from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from app.database import Base


class DetectionHistory(Base):
    __tablename__ = "detection_histories"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(Text, nullable=False)
    normalized_url = Column(Text, nullable=True)
    hostname = Column(String(255), nullable=True)

    expert_status = Column(String(50), nullable=False)
    final_result = Column(String(50), nullable=False)

    triggered_rules = Column(JSONB, nullable=True)
    facts = Column(JSONB, nullable=True)

    rf_prediction = Column(String(50), nullable=True)
    rf_confidence = Column(Float, nullable=True)

    xgb_prediction = Column(String(50), nullable=True)
    xgb_confidence = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())