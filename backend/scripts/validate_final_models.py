import json
import sys
from pathlib import Path

import joblib
import pandas as pd


ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / "backend"
DATASET_PATH = ROOT_DIR / "dataset" / "raw" / "dataset_phishing.csv"
MODEL_DIR = BACKEND_DIR / "app" / "ml_models"

sys.path.insert(0, str(BACKEND_DIR))

from app.core.final_feature_builder import (  # noqa: E402
    EXPECTED_FEATURES,
    build_final_feature_dataframe,
    normalize_label,
)


REQUIRED_ARTIFACTS = [
    "final_random_forest_f01_f30.joblib",
    "final_xgboost_f01_f30.joblib",
    "final_feature_columns.json",
    "final_metrics.json",
    "final_feature_importance.json",
    "final_feature_distribution.json",
]


def load_json(filename: str):
    with open(MODEL_DIR / filename, "r", encoding="utf-8") as file:
        return json.load(file)


def main() -> None:
    missing = [
        filename
        for filename in REQUIRED_ARTIFACTS
        if not (MODEL_DIR / filename).exists()
    ]
    if missing:
        raise FileNotFoundError(
            "Artefak model final belum tersedia: " + ", ".join(missing)
        )
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset tidak ditemukan: {DATASET_PATH}")

    feature_columns = load_json("final_feature_columns.json")
    if feature_columns != EXPECTED_FEATURES:
        raise ValueError("final_feature_columns.json harus berisi F01 sampai F30.")

    dataset = pd.read_csv(DATASET_PATH).drop_duplicates().reset_index(drop=True)
    features = build_final_feature_dataframe(dataset)
    labels = dataset["status"].apply(normalize_label)
    sample_index = 0
    sample = features.iloc[[sample_index]][feature_columns]

    rf_model = joblib.load(MODEL_DIR / "final_random_forest_f01_f30.joblib")
    xgb_model = joblib.load(MODEL_DIR / "final_xgboost_f01_f30.joblib")
    rf_prediction = int(rf_model.predict(sample)[0])
    xgb_prediction = int(xgb_model.predict(sample)[0])

    label_text = {0: "legitimate", 1: "phishing"}
    print("Validasi model final berhasil.")
    print(f"- Sample index: {sample_index}")
    print(f"- Actual label: {label_text[int(labels.iloc[sample_index])]}")
    print(f"- Prediksi Random Forest: {label_text[rf_prediction]}")
    print(f"- Prediksi XGBoost: {label_text[xgb_prediction]}")
    print(f"- Total fitur: {len(feature_columns)}")


if __name__ == "__main__":
    main()
