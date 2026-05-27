import json
from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import pandas as pd


ROOT_DIR = Path(__file__).resolve().parents[3]
APP_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = APP_DIR / "ml_models"
DATASET_PATH = ROOT_DIR / "dataset" / "raw" / "dataset_phishing.csv"

DATASET_NOTE = (
    "Prediksi ini menggunakan model dataset 87 fitur yang hanya valid untuk "
    "data dengan fitur lengkap."
)


class DatasetResourceError(RuntimeError):
    """Raised when a required dataset/model artifact is unavailable."""


class DatasetValidationError(ValueError):
    """Raised when dataset contents cannot be used for prediction."""


class DatasetSampleNotFound(LookupError):
    """Raised when a requested dataset row does not exist."""


@lru_cache(maxsize=1)
def load_dataset() -> pd.DataFrame:
    if not DATASET_PATH.exists():
        raise DatasetResourceError(
            f"Dataset tidak ditemukan di path: {DATASET_PATH}"
        )

    dataset = pd.read_csv(DATASET_PATH)
    required_columns = {"url", "status"}
    missing_columns = sorted(required_columns - set(dataset.columns))

    if missing_columns:
        raise DatasetValidationError(
            "Kolom wajib dataset tidak ditemukan: "
            + ", ".join(missing_columns)
        )

    return dataset


def normalize_label(value: Any) -> int:
    if isinstance(value, str):
        text = value.strip().lower()

        if text in {"phishing", "malicious", "bad", "unsafe", "1", "-1"}:
            return 1

        if text in {"legitimate", "benign", "safe", "normal", "0"}:
            return 0

    try:
        numeric_value = int(value)
    except (TypeError, ValueError):
        numeric_value = None

    if numeric_value == 1:
        return 1

    if numeric_value == 0:
        return 0

    if numeric_value == -1:
        return 1

    raise DatasetValidationError(f"Label dataset tidak dikenali: {value}")


def label_to_text(label: int) -> str:
    return "phishing" if int(label) == 1 else "legitimate"


def _load_json_file(filename: str) -> Any:
    file_path = MODEL_DIR / filename

    if not file_path.exists():
        raise DatasetResourceError(
            f"File konfigurasi model tidak ditemukan: {file_path}"
        )

    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def _load_model(filename: str):
    file_path = MODEL_DIR / filename

    if not file_path.exists():
        raise DatasetResourceError(f"File model tidak ditemukan: {file_path}")

    return joblib.load(file_path)


@lru_cache(maxsize=1)
def load_dataset_models() -> dict:
    feature_columns = _load_json_file("dataset_feature_columns.json")

    if not isinstance(feature_columns, list) or not feature_columns:
        raise DatasetValidationError(
            "dataset_feature_columns.json harus berisi daftar fitur."
        )

    return {
        "random_forest": _load_model("random_forest_dataset_model.joblib"),
        "xgboost": _load_model("xgboost_dataset_model.joblib"),
        "feature_columns": feature_columns,
    }


def _get_prediction_confidence(model, input_df: pd.DataFrame, prediction: int):
    if not hasattr(model, "predict_proba"):
        return None

    probabilities = model.predict_proba(input_df)[0]
    classes = list(getattr(model, "classes_", []))

    if prediction in classes:
        probability_index = classes.index(prediction)
    else:
        probability_index = int(prediction)

    return round(float(probabilities[probability_index]), 4)


def _predict_model(model, input_df: pd.DataFrame, actual_label: int) -> dict:
    prediction = int(model.predict(input_df)[0])

    return {
        "prediction": label_to_text(prediction),
        "confidence": _get_prediction_confidence(model, input_df, prediction),
        "is_correct": prediction == actual_label,
    }


def get_dataset_samples(limit: int = 10) -> list[dict]:
    dataset = load_dataset()
    safe_limit = max(1, min(int(limit), 50))

    samples = dataset.head(safe_limit)

    return [
        {
            "index": int(index),
            "url": str(row["url"]),
            "actual_label": label_to_text(normalize_label(row["status"])),
        }
        for index, row in samples.iterrows()
    ]


def predict_dataset_sample(index: int) -> dict:
    dataset = load_dataset()
    models = load_dataset_models()
    feature_columns = models["feature_columns"]

    if len(feature_columns) != 87:
        raise DatasetValidationError(
            f"Jumlah fitur dataset tidak valid: {len(feature_columns)}. "
            "Model dataset membutuhkan 87 fitur."
        )

    missing_features = [
        feature for feature in feature_columns if feature not in dataset.columns
    ]

    if missing_features:
        raise DatasetValidationError(
            "Kolom fitur dataset tidak lengkap: " + ", ".join(missing_features)
        )

    if index not in dataset.index:
        raise DatasetSampleNotFound(
            f"Sample dataset dengan index {index} tidak ditemukan."
        )

    row = dataset.loc[index]
    actual_label = normalize_label(row["status"])
    input_df = (
        pd.DataFrame([row[feature_columns]], columns=feature_columns)
        .apply(pd.to_numeric, errors="coerce")
        .fillna(0)
    )

    return {
        "index": int(index),
        "url": str(row["url"]),
        "actual_label": label_to_text(actual_label),
        "features_used": len(feature_columns),
        "random_forest": _predict_model(
            models["random_forest"],
            input_df,
            actual_label,
        ),
        "xgboost": _predict_model(
            models["xgboost"],
            input_df,
            actual_label,
        ),
        "note": DATASET_NOTE,
    }
