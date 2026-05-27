from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.core.dataset_predictor import (
    DatasetResourceError,
    DatasetSampleNotFound,
    DatasetValidationError,
    get_dataset_samples,
    load_dataset,
    predict_dataset_sample,
)


router = APIRouter(prefix="/api/dataset", tags=["Dataset Feature Mode"])


class DatasetPredictionRequest(BaseModel):
    index: int


@router.get("/samples")
def get_samples(limit: int = Query(default=10, ge=1, le=50)):
    try:
        dataset = load_dataset()
        samples = get_dataset_samples(limit)
    except (DatasetResourceError, DatasetValidationError) as error:
        raise HTTPException(status_code=500, detail=str(error)) from error

    return {
        "total": len(dataset),
        "data": samples,
    }


@router.post("/predict")
def predict_sample(payload: DatasetPredictionRequest):
    try:
        return predict_dataset_sample(payload.index)
    except DatasetSampleNotFound as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except DatasetValidationError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except DatasetResourceError as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
