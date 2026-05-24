import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier


ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = Path(__file__).resolve().parents[1]
RAW_DATA_DIR = ROOT_DIR / "dataset" / "raw"
MODEL_DIR = BACKEND_DIR / "app" / "ml_models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


def load_dataset():
    csv_files = list(RAW_DATA_DIR.glob("*.csv"))

    if not csv_files:
        raise FileNotFoundError(
            f"Tidak ada file CSV di folder {RAW_DATA_DIR}."
        )

    dataset_path = csv_files[0]
    print(f"Dataset digunakan: {dataset_path}")

    return pd.read_csv(dataset_path)


def normalize_label(value):
    if isinstance(value, str):
        text = value.strip().lower()

        if text in ["phishing", "malicious", "bad", "unsafe", "1"]:
            return 1

        if text in ["legitimate", "benign", "safe", "normal", "0"]:
            return 0

    if value in [1, "1"]:
        return 1

    if value in [0, "0"]:
        return 0

    if value == -1:
        return 1

    raise ValueError(f"Label tidak dikenali: {value}")


def evaluate_model(model, x_test, y_test):
    y_pred = model.predict(x_test)

    return {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision": round(precision_score(y_test, y_pred, zero_division=0), 4),
        "recall": round(recall_score(y_test, y_pred, zero_division=0), 4),
        "f1_score": round(f1_score(y_test, y_pred, zero_division=0), 4),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
    }


def main():
    df = load_dataset()

    if "status" not in df.columns:
        raise ValueError("Kolom target 'status' tidak ditemukan pada dataset.")

    y = df["status"].apply(normalize_label)

    drop_columns = ["url", "status"]
    existing_drop_columns = [col for col in drop_columns if col in df.columns]

    x = df.drop(columns=existing_drop_columns)

    non_numeric_columns = x.select_dtypes(exclude=["number"]).columns.tolist()

    if non_numeric_columns:
        print("Kolom non-numerik yang dihapus:")
        for col in non_numeric_columns:
            print("-", col)

        x = x.drop(columns=non_numeric_columns)

    x = x.fillna(0)

    feature_columns = x.columns.tolist()

    print("\nJumlah fitur digunakan:", len(feature_columns))
    print("Jumlah data:", len(df))

    print("\nDistribusi label:")
    print(y.value_counts())

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    rf_model = RandomForestClassifier(
        n_estimators=300,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1,
    )

    xgb_model = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1,
    )

    print("\nTraining Random Forest...")
    rf_model.fit(x_train, y_train)

    print("Training XGBoost...")
    xgb_model.fit(x_train, y_train)

    rf_metrics = evaluate_model(rf_model, x_test, y_test)
    xgb_metrics = evaluate_model(xgb_model, x_test, y_test)

    metrics = {
        "training_mode": "dataset_features",
        "random_forest": rf_metrics,
        "xgboost": xgb_metrics,
        "feature_columns": feature_columns,
        "label_mapping": {
            "0": "legitimate",
            "1": "phishing",
        },
        "note": "Model dilatih menggunakan fitur numerik asli dari dataset, bukan hanya fitur hasil ekstraksi URL sederhana.",
    }

    joblib.dump(rf_model, MODEL_DIR / "random_forest_dataset_model.joblib")
    joblib.dump(xgb_model, MODEL_DIR / "xgboost_dataset_model.joblib")

    with open(MODEL_DIR / "dataset_feature_columns.json", "w", encoding="utf-8") as file:
        json.dump(feature_columns, file, indent=2)

    with open(MODEL_DIR / "dataset_metrics.json", "w", encoding="utf-8") as file:
        json.dump(metrics, file, indent=2)

    print("\nEvaluasi Random Forest:")
    print(json.dumps(rf_metrics, indent=2))

    print("\nEvaluasi XGBoost:")
    print(json.dumps(xgb_metrics, indent=2))

    print("\nModel berhasil disimpan di:")
    print(MODEL_DIR)


if __name__ == "__main__":
    main()