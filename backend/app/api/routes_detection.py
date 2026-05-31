from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.feature_extraction import extract_features_from_url
from app.core.inference_engine import forward_chaining
from app.core.json_loader import load_json
from app.core.optimized_hybrid_predictor import predict_optimized_hybrid
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

    # 1. Forward Chaining / Rule-based System (Sistem Pakar Utama)
    # Gunakan facts_for_rules agar fitur dengan status imputed_unknown di-skip dari rule individual F01-F30
    inference_result = forward_chaining(
        facts=feature_result.get("facts_for_rules", feature_result["facts"]),
        rules=rules,
        feature_status=feature_result["feature_status"],
        feature_quality=feature_result.get("feature_quality"),
    )

    # 2. Machine Learning Verification (XGBoost utama + RF pembanding)
    ml_result = predict_optimized_hybrid(feature_result)

    # 3. Hybrid Decision Logic
    initial_status = inference_result["initial_status"]
    
    if ml_result.get("available") is True:
        xgb_pred = ml_result["primary_model"]["prediction"]
        
        # Logika Keputusan Hybrid Final
        if initial_status == "phishing":
            final_result = "phishing"
        elif initial_status == "suspicious" and xgb_pred == "phishing":
            final_result = "phishing"
        elif initial_status == "legitimate" and xgb_pred == "phishing":
            final_result = "suspicious"
        elif initial_status == "suspicious" and xgb_pred == "legitimate":
            final_result = "suspicious"
        else:  # legitimate & legitimate
            final_result = "legitimate"
            
        xgb_prediction_val = xgb_pred
        xgb_confidence_val = ml_result["primary_model"]["confidence"]
        
        rf_prediction_val = None
        rf_confidence_val = None
        if ml_result["comparison_model"].get("available") is True:
            rf_prediction_val = ml_result["comparison_model"]["prediction"]
            rf_confidence_val = ml_result["comparison_model"]["confidence"]
    else:
        # Fallback jika ML tidak tersedia (resilient fallback)
        final_result = initial_status
        xgb_prediction_val = None
        xgb_confidence_val = None
        rf_prediction_val = None
        rf_confidence_val = None

    # 4. Save to Database (Tugas 6: simpan ke kolom existing tanpa merusak db)
    history = DetectionHistory(
        url=feature_result["original_url"],
        normalized_url=feature_result["normalized_url"],
        hostname=feature_result["hostname"],
        expert_status=initial_status,
        final_result=final_result,
        triggered_rules=inference_result["triggered_rules"],
        facts=feature_result["facts"],
        rf_prediction=rf_prediction_val,
        rf_confidence=rf_confidence_val,
        xgb_prediction=xgb_prediction_val,
        xgb_confidence=xgb_confidence_val,
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

    # 5. Return Response (Mencocokkan skema output yang diminta)
    return {
        "analysis_mode": "manual_url_optimized_hybrid_xgboost",
        "url": feature_result["original_url"],
        "normalized_url": feature_result["normalized_url"],
        "hostname": feature_result["hostname"],
        "facts": feature_result["facts"],
        "feature_status": feature_result["feature_status"],
        "feature_sources": feature_result["feature_sources"],
        "feature_quality": feature_result.get("feature_quality"),
        "expert_system": {
            "initial_status": initial_status,
            "total_triggered_rules": inference_result.get("total_triggered_rules", 0),
            "triggered_rules": inference_result.get("triggered_rules", []),
        },
        "machine_learning": ml_result,
        "final_result": final_result,
        "note": "Sistem menggunakan forward chaining terlebih dahulu, kemudian prediksi XGBoost sebagai pendukung keputusan akhir."
    }
