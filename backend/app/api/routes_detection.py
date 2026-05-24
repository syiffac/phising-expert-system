from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.feature_extraction import extract_features_from_url
from app.core.inference_engine import forward_chaining
from app.core.json_loader import load_json
from app.core.ml_predictor import predict_manual_baseline
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

    ml_result = predict_manual_baseline(feature_result["facts"])

    final_result = inference_result["initial_status"]

    rf_prediction = None
    rf_confidence = None
    xgb_prediction = None
    xgb_confidence = None

    if ml_result.get("available"):
        rf_prediction = ml_result["random_forest"]["prediction"]
        rf_confidence = ml_result["random_forest"]["confidence"]
        xgb_prediction = ml_result["xgboost"]["prediction"]
        xgb_confidence = ml_result["xgboost"]["confidence"]

        if final_result == "suspicious":
            if rf_prediction == "phishing" and xgb_prediction == "phishing":
                final_result = "phishing"

        if final_result == "legitimate":
            if rf_prediction == "phishing" and xgb_prediction == "phishing":
                final_result = "suspicious"

    history = DetectionHistory(
        url=feature_result["original_url"],
        normalized_url=feature_result["normalized_url"],
        hostname=feature_result["hostname"],
        expert_status=inference_result["initial_status"],
        final_result=final_result,
        triggered_rules=inference_result["triggered_rules"],
        facts=feature_result["facts"],
        rf_prediction=rf_prediction,
        rf_confidence=rf_confidence,
        xgb_prediction=xgb_prediction,
        xgb_confidence=xgb_confidence,
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
        "machine_learning": ml_result,
        "final_result": final_result,
        "note": feature_result["note"],
    }