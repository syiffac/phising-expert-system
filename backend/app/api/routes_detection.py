from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.feature_extraction import extract_features_from_url
from app.core.inference_engine import forward_chaining
from app.core.json_loader import load_json
from app.database import get_db
from app.models.database_models import DetectionHistory


router = APIRouter(prefix="/api/detect", tags=["Detection"])


class DetectionRequest(BaseModel):
    url: str


@router.post("/")
def detect_url(payload: DetectionRequest, db: Session = Depends(get_db)):
    if not payload.url or not payload.url.strip():
        raise HTTPException(status_code=400, detail="URL tidak boleh kosong")

    feature_result = extract_features_from_url(payload.url)
    rules = load_json("rules.json")

    inference_result = forward_chaining(
        facts=feature_result["facts"],
        rules=rules,
    )

    final_result = inference_result["initial_status"]

    history = DetectionHistory(
        url=feature_result["original_url"],
        normalized_url=feature_result["normalized_url"],
        hostname=feature_result["hostname"],
        expert_status=inference_result["initial_status"],
        final_result=final_result,
        triggered_rules=inference_result["triggered_rules"],
        facts=feature_result["facts"],
    )

    try:
        db.add(history)
        db.commit()
        db.refresh(history)
    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Gagal menyimpan hasil deteksi ke database: {str(error)}",
        )

    return {
        "history_id": history.id,
        "url": feature_result["original_url"],
        "normalized_url": feature_result["normalized_url"],
        "hostname": feature_result["hostname"],
        "facts": feature_result["facts"],
        "evaluated_features": feature_result["evaluated_features"],
        "expert_system": inference_result,
        "final_result": final_result,
        "note": feature_result["note"],
    }