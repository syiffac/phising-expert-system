from functools import lru_cache
import json
import logging
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

APP_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = APP_DIR / "ml_models"
RF_MODEL_FILENAME = "final_augmented_robust_random_forest.joblib"
logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def load_primary_xgboost_model() -> tuple[Any, list[str], dict[str, Any]]:
    """Memuat model XGBoost utama, feature columns, dan metadata model."""
    model_path = MODEL_DIR / "final_augmented_robust_xgboost.joblib"
    cols_path = MODEL_DIR / "optimized_hybrid_feature_columns.json"
    meta_path = MODEL_DIR / "final_augmented_robust_xgboost_model_type.json"

    if not model_path.exists():
        raise FileNotFoundError(f"Model XGBoost tidak ditemukan di {model_path}")
    if not cols_path.exists():
        raise FileNotFoundError(f"Kolom fitur tidak ditemukan di {cols_path}")
    if not meta_path.exists():
        raise FileNotFoundError(f"Metadata model tidak ditemukan di {meta_path}")

    model = joblib.load(model_path)
    with open(cols_path, "r", encoding="utf-8") as f:
        feature_columns = json.load(f)
    with open(meta_path, "r", encoding="utf-8") as f:
        metadata = json.load(f)

    return model, feature_columns, metadata


@lru_cache(maxsize=1)
def _load_comparison_random_forest_model_result() -> dict[str, Any]:
    """Memuat model Random Forest pembanding beserta status error yang eksplisit."""
    model_path = MODEL_DIR / RF_MODEL_FILENAME
    if not model_path.exists():
        note = f"Random Forest file not found at {model_path}"
        logger.warning("Random Forest file not exists: %s", model_path)
        return {"model": None, "note": note}

    try:
        file_size = model_path.stat().st_size
        logger.info("Random Forest file exists: %s", model_path)
        logger.info("Random Forest file size: %s bytes", file_size)
    except OSError as error:
        logger.warning(
            "Random Forest file exists but size could not be read: %s (%s)",
            model_path,
            error,
        )

    try:
        model = joblib.load(model_path)
        logger.info("Random Forest loaded successfully from %s", model_path)
        return {"model": model, "note": "Random Forest model loaded successfully."}
    except Exception as error:
        note = f"Random Forest failed to load from {model_path}: {error}"
        logger.exception("Random Forest failed to load from %s", model_path)
        return {"model": None, "note": note}


def load_comparison_random_forest_model() -> Any | None:
    """Memuat model Random Forest pembanding jika tersedia, tanpa crash jika tidak ada."""
    return _load_comparison_random_forest_model_result()["model"]


def label_to_text(label: int) -> str:
    """Mengubah kelas prediksi 0/1 menjadi legitimate/phishing."""
    return "phishing" if int(label) == 1 else "legitimate"


def get_confidence(model, input_df: pd.DataFrame, prediction: int) -> float | None:
    """Menghitung persentase tingkat kepercayaan prediksi menggunakan predict_proba."""
    if not hasattr(model, "predict_proba"):
        return None
    try:
        probabilities = model.predict_proba(input_df)[0]
        confidence = probabilities[int(prediction)]
        return round(float(confidence), 4)
    except Exception:
        return None


def get_random_forest_confidence(model, input_df: pd.DataFrame, prediction: int) -> float | None:
    """Menghitung confidence Random Forest dengan logging eksplisit untuk predict_proba."""
    if not hasattr(model, "predict_proba"):
        logger.warning("Random Forest predict_proba failed: method is not available.")
        return None

    try:
        probabilities = model.predict_proba(input_df)[0]
        confidence = probabilities[int(prediction)]
        logger.info("Random Forest predict_proba success.")
        return round(float(confidence), 4)
    except Exception:
        logger.exception("Random Forest predict_proba failed.")
        return None


def build_runtime_ml_features(extraction_result: dict, feature_columns: list[str] = None) -> pd.DataFrame:
    """Membentuk dataframe input 91 fitur terurut dari hasil ekstraksi manual."""
    if feature_columns is None:
        cols_path = MODEL_DIR / "optimized_hybrid_feature_columns.json"
        if cols_path.exists():
            with open(cols_path, "r", encoding="utf-8") as f:
                feature_columns = json.load(f)
        else:
            feature_columns = []

    input_data = {}
    
    # 1. facts F01-F30 (symbolic features)
    facts = extraction_result.get("features_for_ml", extraction_result.get("facts", {}))
    
    # 2. raw numeric features
    raw_features = extraction_result.get("ml_raw_features", {})

    for col in feature_columns:
        if col in facts:
            input_data[col] = facts[col]
        elif col in raw_features:
            input_data[col] = raw_features[col]
        else:
            # Jika fitur tidak ada, isi dengan 0
            input_data[col] = 0

    # Pastikan tidak ada target leakage (URL mentah, status, dll)
    leakage_keywords = {"status", "target", "label", "url", "original_url", "normalized_url", "hostname"}
    filtered_data = {k: v for k, v in input_data.items() if k.lower() not in leakage_keywords}
    
    return pd.DataFrame([filtered_data], columns=feature_columns)


def predict_optimized_hybrid(extraction_result: dict) -> dict:
    """
    Melakukan klasifikasi akhir menggunakan Augmented Robust XGBoost sebagai model utama
    dan Augmented Robust Random Forest sebagai model pembanding.
    """
    try:
        xgb_model, feature_columns, xgb_meta = load_primary_xgboost_model()
    except Exception as e:
        return {
            "available": False,
            "mode": "augmented_robust_xgboost",
            "reason": f"Model Augmented Robust XGBoost belum tersedia: {str(e)}"
        }

    rf_load_result = _load_comparison_random_forest_model_result()
    rf_model = rf_load_result["model"]

    # Build features dataframe
    input_df = build_runtime_ml_features(extraction_result, feature_columns)

    # 1. Predict Primary Model (XGBoost)
    xgb_pred_val = int(xgb_model.predict(input_df)[0])
    xgb_confidence = get_confidence(xgb_model, input_df, xgb_pred_val)
    xgb_pred_text = label_to_text(xgb_pred_val)

    primary_model_res = {
        "name": "augmented_robust_xgboost",
        "algorithm": "xgboost",
        "prediction": xgb_pred_text,
        "confidence": xgb_confidence
    }

    # 2. Predict Comparison Model (Random Forest)
    comparison_model_res = {
        "name": "augmented_robust_random_forest",
        "algorithm": "random_forest",
        "prediction": None,
        "confidence": None,
        "available": False,
        "note": rf_load_result["note"],
    }

    if rf_model is not None:
        try:
            rf_pred_val = int(rf_model.predict(input_df)[0])
            logger.info("Random Forest predict success.")
            rf_confidence = get_random_forest_confidence(rf_model, input_df, rf_pred_val)
            rf_pred_text = label_to_text(rf_pred_val)

            comparison_model_res.update({
                "prediction": rf_pred_text,
                "confidence": rf_confidence,
                "available": True,
                "note": (
                    "Random Forest prediction and confidence score are available."
                    if rf_confidence is not None
                    else "Random Forest prediction available, but confidence score is not available."
                ),
            })
        except Exception as error:
            note = f"Random Forest failed to predict: {error}"
            logger.exception("Random Forest predict failed.")
            comparison_model_res.update({
                "prediction": None,
                "confidence": None,
                "available": False,
                "note": note,
            })

    # Extract quality
    quality = extraction_result.get("feature_quality", {
        "total_features": 30,
        "available": 30,
        "imputed_unknown": 0,
        "imputed_features": []
    })

    return {
        "available": True,
        "mode": "augmented_robust_xgboost",
        "primary_model": primary_model_res,
        "comparison_model": comparison_model_res,
        "feature_set": {
            "type": "augmented",
            "total_features": len(feature_columns)
        },
        "feature_quality": {
            "total_features": quality.get("total_features", 30),
            "available": quality.get("available", 30),
            "imputed_unknown": quality.get("imputed_unknown", 0),
            "imputed_features": quality.get("imputed_features", [])
        },
        "note": "XGBoost digunakan sebagai model ML final; Random Forest ditampilkan sebagai pembanding."
    }
