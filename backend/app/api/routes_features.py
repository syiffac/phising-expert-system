from fastapi import APIRouter, HTTPException

from app.core.json_loader import load_json

router = APIRouter(prefix="/api/features", tags=["Knowledge Base - Features"])


@router.get("/")
def get_features():
    features = load_json("features.json")

    return {
        "total": len(features),
        "data": features,
    }


@router.get("/{feature_code}")
def get_feature_by_code(feature_code: str):
    features = load_json("features.json")
    feature_code = feature_code.upper()

    for feature in features:
        if feature["code"] == feature_code:
            return feature

    raise HTTPException(status_code=404, detail="Feature tidak ditemukan")