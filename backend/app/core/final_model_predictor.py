import json
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

APP_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = APP_DIR / "ml_models"


def load_optimized_hybrid_model() -> dict[str, Any] | None:
    model_path = MODEL_DIR / "final_optimized_hybrid_model.joblib"
    type_path = MODEL_DIR / "final_optimized_hybrid_model_type.json"
    cols_path = MODEL_DIR / "optimized_hybrid_feature_columns.json"

    if not model_path.exists() or not type_path.exists() or not cols_path.exists():
        return None

    try:
        model = joblib.load(model_path)
        with open(type_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
        with open(cols_path, "r", encoding="utf-8") as f:
            cols = json.load(f)
        return {
            "model": model,
            "model_type": meta.get("model_type"),
            "candidate": meta.get("candidate"),
            "feature_set": meta.get("feature_set"),
            "feature_columns": cols,
        }
    except Exception:
        return None


def label_to_text(label: int) -> str:
    return "phishing" if int(label) == 1 else "legitimate"


def get_confidence(model, input_df: pd.DataFrame, prediction: int) -> float | None:
    if not hasattr(model, "predict_proba"):
        return None
    probabilities = model.predict_proba(input_df)[0]
    confidence = probabilities[int(prediction)]
    return round(float(confidence), 4)


def predict_optimized_hybrid_from_extraction(extraction_result: dict) -> dict:
    meta = load_optimized_hybrid_model()
    if meta is None:
        return {
            "available": False,
            "mode": "manual_url_optimized_hybrid",
            "note": "Model Optimized Hybrid belum tersedia atau Quality Gate tidak terpenuhi.",
            "prediction": "legitimate",
            "confidence": 0.0,
            "random_forest": None,
            "xgboost": None,
        }

    model = meta["model"]
    model_type = meta["model_type"]
    feature_columns = meta["feature_columns"]
    feature_set = meta["feature_set"]

    # Build input features
    input_data = {}
    
    # 1. Fill facts (symbolic)
    facts = extraction_result.get("features_for_ml", extraction_result.get("facts", {}))
    
    # 2. Fill raw numeric features if augmented
    raw_features = extraction_result.get("ml_raw_features", {})

    for col in feature_columns:
        if col in facts:
            input_data[col] = facts[col]
        elif col in raw_features:
            input_data[col] = raw_features[col]
        else:
            # Fallback default
            input_data[col] = 0

    input_df = pd.DataFrame([input_data], columns=feature_columns)

    try:
        prediction = int(model.predict(input_df)[0])
        confidence = get_confidence(model, input_df, prediction) or 0.5
    except Exception as e:
        return {
            "available": False,
            "mode": "manual_url_optimized_hybrid",
            "note": f"Gagal memprediksi dengan model Optimized Hybrid: {str(e)}",
            "prediction": "legitimate",
            "confidence": 0.0,
            "random_forest": None,
            "xgboost": None,
        }

    pred_text = label_to_text(prediction)
    
    rf_pred = {"prediction": "legitimate", "confidence": 0.5}
    xgb_pred = {"prediction": "legitimate", "confidence": 0.5}
    
    if model_type == "random_forest":
        rf_pred = {"prediction": pred_text, "confidence": confidence}
    else:
        xgb_pred = {"prediction": pred_text, "confidence": confidence}

    return {
        "available": True,
        "mode": "manual_url_optimized_hybrid",
        "model_type": model_type,
        "candidate": meta["candidate"],
        "feature_set": feature_set,
        "prediction": pred_text,
        "confidence": confidence,
        "random_forest": rf_pred,
        "xgboost": xgb_pred,
    }
