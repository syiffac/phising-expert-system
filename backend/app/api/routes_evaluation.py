from fastapi import APIRouter

from app.core.ml_predictor import get_model_evaluation_metrics


router = APIRouter(prefix="/api/evaluation", tags=["Model Evaluation"])


@router.get("/")
def get_evaluation_metrics():
    metrics = get_model_evaluation_metrics()

    return {
        "message": "Hasil evaluasi model Random Forest dan XGBoost",
        "data": metrics,
    }