import json
from pathlib import Path
from typing import Any

import joblib
import pandas as pd


APP_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = APP_DIR / "ml_models"


def load_json_file(filename: str) -> Any:
    file_path = MODEL_DIR / filename

    if not file_path.exists():
        return None

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def load_model(filename: str):
    file_path = MODEL_DIR / filename

    if not file_path.exists():
        return None

    return joblib.load(file_path)


def label_to_text(label: int) -> str:
    return "phishing" if int(label) == 1 else "legitimate"


def get_confidence(model, input_df: pd.DataFrame, prediction: int) -> float | None:
    if not hasattr(model, "predict_proba"):
        return None

    probabilities = model.predict_proba(input_df)[0]
    confidence = probabilities[int(prediction)]

    return round(float(confidence), 4)


def predict_manual_baseline(facts: dict) -> dict:
    """
    Prediksi baseline untuk input URL manual.
    Model ini memakai fitur F01-F30 yang saat ini masih prototype.
    """

    rf_model = load_model("random_forest_model.joblib")
    xgb_model = load_model("xgboost_model.joblib")
    feature_columns = load_json_file("feature_columns.json")

    if rf_model is None or xgb_model is None or feature_columns is None:
        return {
            "available": False,
            "note": "Model baseline belum tersedia. Jalankan script train_models.py terlebih dahulu.",
            "random_forest": None,
            "xgboost": None,
        }

    unavailable_features = [
        feature for feature in feature_columns if facts.get(feature) is None
    ]

    if unavailable_features:
        return {
            "available": False,
            "mode": "manual_url_baseline_f01_f30",
            "note": (
                "Prediksi baseline F01-F30 tidak dijalankan karena fitur "
                "berikut belum tersedia pada input URL manual: "
                + ", ".join(unavailable_features)
                + "."
            ),
            "random_forest": None,
            "xgboost": None,
        }

    input_data = {
        feature: facts[feature]
        for feature in feature_columns
    }

    input_df = pd.DataFrame([input_data], columns=feature_columns)

    rf_prediction = int(rf_model.predict(input_df)[0])
    xgb_prediction = int(xgb_model.predict(input_df)[0])

    return {
        "available": True,
        "mode": "manual_url_baseline_f01_f30",
        "note": "Prediksi ini menggunakan model baseline F01-F30 untuk input URL manual. Model final akan dilatih ulang setelah seluruh fitur terisi valid tanpa nilai default.",
        "random_forest": {
            "prediction": label_to_text(rf_prediction),
            "confidence": get_confidence(rf_model, input_df, rf_prediction),
        },
        "xgboost": {
            "prediction": label_to_text(xgb_prediction),
            "confidence": get_confidence(xgb_model, input_df, xgb_prediction),
        },
    }


def get_model_evaluation_metrics() -> dict:
    baseline_metrics = load_json_file("metrics.json")
    dataset_metrics = load_json_file("dataset_metrics.json")
    final_metrics = load_json_file("final_metrics.json")

    return {
        "baseline_f01_f30": baseline_metrics,
        "dataset_87_features": dataset_metrics,
        "final_f01_f30": final_metrics,
    }
