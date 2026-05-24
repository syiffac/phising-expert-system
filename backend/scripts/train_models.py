import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

from app.core.feature_extraction import extract_features_from_url


ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = Path(__file__).resolve().parents[1]
RAW_DATA_DIR = ROOT_DIR / "dataset" / "raw"
MODEL_DIR = BACKEND_DIR / "app" / "ml_models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


POSSIBLE_URL_COLUMNS = ["url", "URL", "Url", "website", "Website", "domain", "Domain"]
POSSIBLE_TARGET_COLUMNS = ["status", "Status", "label", "Label", "class", "Class", "target", "Target", "result", "Result"]


def find_column(columns, candidates):
    for candidate in candidates:
        if candidate in columns:
            return candidate
    return None


def load_dataset():
    csv_files = list(RAW_DATA_DIR.glob("*.csv"))

    if not csv_files:
        raise FileNotFoundError(
            f"Tidak ada file CSV di folder {RAW_DATA_DIR}. "
            "Letakkan dataset phishing dalam format CSV di folder dataset/raw."
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


def build_feature_dataframe(df, url_column):
    rows = []

    for url in df[url_column].astype(str):
        extracted = extract_features_from_url(url)
        rows.append(extracted["facts"])

    features_df = pd.DataFrame(rows)

    feature_columns = [f"F{i:02d}" for i in range(1, 31)]
    features_df = features_df[feature_columns]

    return features_df, feature_columns


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

    url_column = find_column(df.columns, POSSIBLE_URL_COLUMNS)
    target_column = find_column(df.columns, POSSIBLE_TARGET_COLUMNS)

    if url_column is None:
        raise ValueError(
            "Kolom URL tidak ditemukan. Pastikan dataset punya kolom seperti url, URL, website, atau domain."
        )

    if target_column is None:
        raise ValueError(
            "Kolom target tidak ditemukan. Pastikan dataset punya kolom seperti status, label, class, target, atau result."
        )

    print(f"Kolom URL    : {url_column}")
    print(f"Kolom target : {target_column}")

    df = df[[url_column, target_column]].dropna()

    x, feature_columns = build_feature_dataframe(df, url_column)
    y = df[target_column].apply(normalize_label)

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
        n_estimators=200,
        random_state=42,
        class_weight="balanced",
        n_jobs=-1,
    )

    xgb_model = XGBClassifier(
        n_estimators=200,
        max_depth=5,
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
        "random_forest": rf_metrics,
        "xgboost": xgb_metrics,
        "feature_columns": feature_columns,
        "label_mapping": {
            "0": "legitimate",
            "1": "phishing",
        },
        "note": "Model dilatih menggunakan fitur F01-F30 yang dibentuk dari proses ekstraksi URL agar kompatibel dengan rule-based system pada backend.",
    }

    joblib.dump(rf_model, MODEL_DIR / "random_forest_model.joblib")
    joblib.dump(xgb_model, MODEL_DIR / "xgboost_model.joblib")

    with open(MODEL_DIR / "feature_columns.json", "w", encoding="utf-8") as file:
        json.dump(feature_columns, file, indent=2)

    with open(MODEL_DIR / "metrics.json", "w", encoding="utf-8") as file:
        json.dump(metrics, file, indent=2)

    print("\nEvaluasi Random Forest:")
    print(json.dumps(rf_metrics, indent=2))

    print("\nEvaluasi XGBoost:")
    print(json.dumps(xgb_metrics, indent=2))

    print("\nModel berhasil disimpan di:")
    print(MODEL_DIR)


if __name__ == "__main__":
    main()