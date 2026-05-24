from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.database_models import DetectionHistory


router = APIRouter(prefix="/api/history", tags=["Detection History"])


@router.get("/")
def get_detection_histories(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    histories = (
        db.query(DetectionHistory)
        .order_by(DetectionHistory.created_at.desc())
        .limit(limit)
        .all()
    )

    return {
        "total": len(histories),
        "data": [
            {
                "id": item.id,
                "url": item.url,
                "normalized_url": item.normalized_url,
                "hostname": item.hostname,
                "expert_status": item.expert_status,
                "final_result": item.final_result,
                "triggered_rules": item.triggered_rules,
                "facts": item.facts,
                "rf_prediction": item.rf_prediction,
                "rf_confidence": item.rf_confidence,
                "xgb_prediction": item.xgb_prediction,
                "xgb_confidence": item.xgb_confidence,
                "created_at": item.created_at.isoformat() if item.created_at else None,
            }
            for item in histories
        ],
    }