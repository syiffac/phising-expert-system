from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.feature_extraction import extract_features_from_url
from app.core.inference_engine import forward_chaining
from app.core.json_loader import load_json


router = APIRouter(prefix="/api/detect", tags=["Detection"])


class DetectionRequest(BaseModel):
    url: str


@router.post("/")
def detect_url(payload: DetectionRequest):
    if not payload.url or not payload.url.strip():
        raise HTTPException(status_code=400, detail="URL tidak boleh kosong")

    feature_result = extract_features_from_url(payload.url)
    rules = load_json("rules.json")

    inference_result = forward_chaining(
        facts=feature_result["facts"],
        rules=rules
    )

    return {
        "url": feature_result["original_url"],
        "normalized_url": feature_result["normalized_url"],
        "hostname": feature_result["hostname"],
        "facts": feature_result["facts"],
        "evaluated_features": feature_result["evaluated_features"],
        "expert_system": inference_result,
        "final_result": inference_result["initial_status"],
        "note": feature_result["note"],
    }