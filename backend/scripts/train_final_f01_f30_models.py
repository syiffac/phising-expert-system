import json
import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold, train_test_split
from xgboost import XGBClassifier


ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / "backend"
DATASET_PATH = ROOT_DIR / "dataset" / "raw" / "dataset_phishing.csv"
MODEL_DIR = BACKEND_DIR / "app" / "ml_models"
REPORT_PATH = ROOT_DIR / "docs" / "final_training_report.md"

sys.path.insert(0, str(BACKEND_DIR))

from app.core.final_feature_builder import (  # noqa: E402
    EXPECTED_FEATURES,
    build_final_feature_dataframe,
    get_feature_value_distributions,
    get_low_variance_features,
    normalize_label,
)


SCORING = "f1"
RANDOM_STATE = 42
CV = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)


def load_dataset() -> pd.DataFrame:
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset tidak ditemukan: {DATASET_PATH}")
    dataset = pd.read_csv(DATASET_PATH)
    if "status" not in dataset.columns:
        raise ValueError("Kolom target 'status' tidak ditemukan pada dataset.")
    return dataset


def round_float(value: float) -> float:
    return round(float(value), 6)


def write_json(path: Path, content: object) -> None:
    with open(path, "w", encoding="utf-8") as file:
        json.dump(content, file, indent=2, ensure_ascii=True)
        file.write("\n")


def evaluate_model(search: RandomizedSearchCV, x_test: pd.DataFrame, y_test: pd.Series) -> dict:
    prediction = search.best_estimator_.predict(x_test)
    best_index = search.best_index_
    return {
        "best_params": search.best_params_,
        "accuracy": round_float(accuracy_score(y_test, prediction)),
        "precision": round_float(precision_score(y_test, prediction, zero_division=0)),
        "recall": round_float(recall_score(y_test, prediction, zero_division=0)),
        "f1_score": round_float(f1_score(y_test, prediction, zero_division=0)),
        "confusion_matrix": confusion_matrix(y_test, prediction).tolist(),
        "classification_report": classification_report(
            y_test, prediction, output_dict=True, zero_division=0
        ),
        "cross_validation_mean": round_float(search.best_score_),
        "cross_validation_std": round_float(
            search.cv_results_["std_test_score"][best_index]
        ),
    }


def feature_importance(model) -> list[dict]:
    pairs = zip(EXPECTED_FEATURES, model.feature_importances_)
    return [
        {"feature": feature, "importance": round_float(importance)}
        for feature, importance in sorted(pairs, key=lambda item: item[1], reverse=True)
    ]


def choose_best_model(rf_metrics: dict, xgb_metrics: dict) -> dict:
    rf_score = (rf_metrics["f1_score"], rf_metrics["accuracy"])
    xgb_score = (xgb_metrics["f1_score"], xgb_metrics["accuracy"])
    name = "random_forest" if rf_score >= xgb_score else "xgboost"
    return {
        "name": name,
        "selection_basis": (
            "Dipilih berdasarkan f1_score pada test set, kemudian accuracy "
            "sebagai pemecah seri; keputusan dibuat setelah evaluasi."
        ),
    }


def format_metric_row(label: str, metrics: dict) -> str:
    return (
        f"| {label} | {metrics['accuracy']:.4f} | {metrics['precision']:.4f} | "
        f"{metrics['recall']:.4f} | {metrics['f1_score']:.4f} | "
        f"{metrics['cross_validation_mean']:.4f} +/- {metrics['cross_validation_std']:.4f} |"
    )


def write_report(metrics: dict, importance: dict, distributions: dict) -> None:
    dataset = metrics["dataset_summary"]
    feature_summary = metrics["feature_summary"]
    split = metrics["split"]
    rf_metrics = metrics["random_forest"]
    xgb_metrics = metrics["xgboost"]
    label_distribution = ", ".join(
        f"{label}: {count}"
        for label, count in dataset["target_distribution"].items()
    )
    low_variance = ", ".join(feature_summary["low_variance_features"]) or "Tidak ada"
    rf_top = ", ".join(
        f"{item['feature']} ({item['importance']:.4f})"
        for item in importance["random_forest"][:5]
    )
    xgb_top = ", ".join(
        f"{item['feature']} ({item['importance']:.4f})"
        for item in importance["xgboost"][:5]
    )
    distribution_rows = "\n".join(
        f"| {feature} | {values['-1']} | {values['0']} | {values['1']} |"
        for feature, values in distributions["distributions"].items()
    )
    content = f"""# Laporan Training Final Model F01-F30

## Tujuan

Training final ini membangun model Random Forest dan XGBoost pendukung hybrid expert system menggunakan fitur F01-F30 yang telah tervalidasi pada knowledge base dan rule base. Sistem pakar dengan working memory, inference engine, dan forward chaining tetap menjadi sumber penjelasan keputusan.

## Revisi Fitur untuk Input Manual

Lima fitur yang sebelumnya sulit direproduksi dari input manual diganti dengan fitur dataset yang dapat dihitung dari URL atau HTML:

| Kode | Definisi Final | Kolom Dataset | Sumber Manual |
|---|---|---|---|
| F18 | Phishing Hints | `phish_hints` | URL string dan teks HTML |
| F26 | Brand in Path | `brand_in_path` | URL string |
| F27 | Suspicious TLD | `suspecious_tld` | URL string |
| F28 | Domain in Title | `domain_in_title` | HTML parsing |
| F30 | Empty Title | `empty_title` | HTML parsing |

Revisi ini menggantikan ketergantungan pada indikator eksternal lama agar mode URL manual dapat membentuk bukti tanpa API traffic, ranking, indexing, atau blacklist. Landasan pemilihan fitur berasal dari Hannousse & Yahiouche, didukung penggunaan fitur URL/HTML/text tanpa layanan pihak ketiga oleh Aljofey et al. (Scientific Reports, 2022) dan pendekatan URL/text oleh Shaukat et al. (Sensors, 2023).

## Dataset dan Cleaning

- Dataset: `dataset/raw/dataset_phishing.csv`
- Jumlah data awal: {dataset['total_rows_original']}
- Duplikasi dihapus: {dataset['duplicates_removed']}
- Jumlah data setelah cleaning: {dataset['total_rows_after_cleaning']}
- Jumlah kolom awal: {dataset['total_columns_original']}
- Missing value sumber: {dataset['missing_values_total']}

Tidak ada `fillna` global. Pipeline berhenti dengan error jika kolom trainable hilang atau nilai sumber fitur tidak dapat ditransformasikan secara sah. Dataset yang digunakan pada training ini tidak memiliki missing value kritis.

## Label dan Fitur

- Normalisasi label: `0 = legitimate`, `1 = phishing`
- Distribusi label: {label_distribution}
- Total fitur final: {feature_summary['total_features_used']}
- Fitur low variance: {low_variance}
- Distribusi fitur lengkap: `backend/app/ml_models/final_feature_distribution.json`

Seluruh fitur F01-F30 dibentuk dari `final_feature_mapping.json`; tidak ada fitur yang diisi nilai default karena gagal dihitung. Seluruh nilai akhir fitur dibatasi pada `-1`, `0`, dan `1`.

## Split dan Validasi

- Train size: {split['train_size']}
- Test size: {split['test_size']}
- Test ratio: {split['test_ratio']}
- Random state: {split['random_state']}
- Stratified: {str(split['stratified']).lower()}
- Cross-validation: 5-fold stratified
- Scoring tuning utama: `f1`, agar perbandingan memperhatikan kemampuan mendeteksi kelas phishing, bukan hanya akurasi keseluruhan.

Hyperparameter tuning dilakukan menggunakan `RandomizedSearchCV` dengan ruang pencarian terbatas agar realistis dijalankan pada perangkat pengembangan.

## Hasil Evaluasi

| Model | Accuracy | Precision | Recall | F1 Score | CV F1 Mean +/- Std |
|---|---:|---:|---:|---:|---:|
{format_metric_row('Random Forest', rf_metrics)}
{format_metric_row('XGBoost', xgb_metrics)}

- Parameter terbaik Random Forest: `{json.dumps(rf_metrics['best_params'], ensure_ascii=True)}`
- Parameter terbaik XGBoost: `{json.dumps(xgb_metrics['best_params'], ensure_ascii=True)}`
- Confusion matrix Random Forest: `{rf_metrics['confusion_matrix']}`
- Confusion matrix XGBoost: `{xgb_metrics['confusion_matrix']}`

## Feature Importance

- Lima fitur teratas Random Forest: {rf_top}
- Lima fitur teratas XGBoost: {xgb_top}
- Data lengkap: `backend/app/ml_models/final_feature_importance.json`

## Distribusi Nilai Fitur

| Fitur | -1 | 0 | 1 |
|---|---:|---:|---:|
{distribution_rows}

## Kesimpulan

Model terbaik berdasarkan hasil evaluasi adalah `{metrics['best_model']['name']}`. Pemilihan ini didasarkan pada F1 score test set dan accuracy sebagai pemecah seri, bukan asumsi sebelum training. Model prototype lama tidak dioverwrite; artefak final disimpan menggunakan nama file baru.
"""
    with open(REPORT_PATH, "w", encoding="utf-8") as file:
        file.write(content)


def main() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)

    original = load_dataset()
    total_rows_original = len(original)
    total_columns_original = len(original.columns)
    duplicates_removed = int(original.duplicated().sum())
    missing_values_total = int(original.isna().sum().sum())
    cleaned = original.drop_duplicates().reset_index(drop=True)

    y = cleaned["status"].apply(normalize_label).astype(int)
    if set(y.unique()) - {0, 1}:
        raise ValueError("Label final harus hanya terdiri dari nilai 0 dan 1.")

    features = build_final_feature_dataframe(cleaned)
    if "url" in features.columns or "status" in features.columns:
        raise ValueError("URL atau status tidak boleh masuk sebagai fitur training.")
    if features.columns.tolist() != EXPECTED_FEATURES:
        raise ValueError("Fitur training final harus tepat F01 sampai F30.")

    distributions = get_feature_value_distributions(features)
    low_variance_features = get_low_variance_features(features)
    feature_distribution = {
        "feature_columns": EXPECTED_FEATURES,
        "allowed_values": [-1, 0, 1],
        "missing_value_handling": (
            "Tidak ada imputasi default; konstruksi fitur gagal jika nilai sumber "
            "kosong atau tidak memenuhi aturan mapping."
        ),
        "low_variance_features": low_variance_features,
        "distributions": distributions,
    }
    write_json(MODEL_DIR / "final_feature_distribution.json", feature_distribution)

    x_train, x_test, y_train, y_test = train_test_split(
        features,
        y,
        test_size=0.2,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    rf_search = RandomizedSearchCV(
        estimator=RandomForestClassifier(
            random_state=RANDOM_STATE,
            class_weight="balanced",
            n_jobs=1,
        ),
        param_distributions={
            "n_estimators": [200, 300, 500],
            "max_depth": [None, 10, 20, 30],
            "min_samples_split": [2, 5, 10],
            "min_samples_leaf": [1, 2, 4],
            "max_features": ["sqrt", "log2"],
        },
        n_iter=8,
        scoring=SCORING,
        cv=CV,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        refit=True,
    )
    xgb_search = RandomizedSearchCV(
        estimator=XGBClassifier(
            eval_metric="logloss",
            random_state=RANDOM_STATE,
            n_jobs=1,
            tree_method="hist",
        ),
        param_distributions={
            "n_estimators": [200, 300, 500],
            "max_depth": [3, 5, 7],
            "learning_rate": [0.01, 0.05, 0.1],
            "subsample": [0.8, 0.9, 1.0],
            "colsample_bytree": [0.8, 0.9, 1.0],
        },
        n_iter=8,
        scoring=SCORING,
        cv=CV,
        random_state=RANDOM_STATE,
        n_jobs=-1,
        refit=True,
    )

    print("Training final Random Forest dengan RandomizedSearchCV...")
    rf_search.fit(x_train, y_train)
    print("Training final XGBoost dengan RandomizedSearchCV...")
    xgb_search.fit(x_train, y_train)

    rf_metrics = evaluate_model(rf_search, x_test, y_test)
    xgb_metrics = evaluate_model(xgb_search, x_test, y_test)
    importance = {
        "random_forest": feature_importance(rf_search.best_estimator_),
        "xgboost": feature_importance(xgb_search.best_estimator_),
    }
    metrics = {
        "training_mode": "final_f01_f30_no_default",
        "dataset_summary": {
            "total_rows_original": total_rows_original,
            "total_columns_original": total_columns_original,
            "total_rows_after_cleaning": len(cleaned),
            "duplicates_removed": duplicates_removed,
            "missing_values_total": missing_values_total,
            "target_distribution": {
                "legitimate": int((y == 0).sum()),
                "phishing": int((y == 1).sum()),
            },
        },
        "feature_summary": {
            "total_features_used": len(EXPECTED_FEATURES),
            "feature_columns": EXPECTED_FEATURES,
            "low_variance_features": low_variance_features,
            "feature_value_distribution_path": "final_feature_distribution.json",
        },
        "split": {
            "train_size": len(x_train),
            "test_size": len(x_test),
            "test_ratio": 0.2,
            "random_state": RANDOM_STATE,
            "stratified": True,
        },
        "tuning": {
            "method": "RandomizedSearchCV",
            "scoring": SCORING,
            "cross_validation_folds": 5,
            "iterations_per_model": 8,
        },
        "random_forest": rf_metrics,
        "xgboost": xgb_metrics,
        "best_model": choose_best_model(rf_metrics, xgb_metrics),
        "notes": (
            "Model final dilatih menggunakan fitur F01-F30 yang valid berdasarkan "
            "mapping terbaru, termasuk revisi F18/F26/F27/F28/F30 untuk ekstraksi "
            "manual tanpa indikator eksternal lama, tanpa nilai default asal isi."
        ),
    }

    joblib.dump(rf_search.best_estimator_, MODEL_DIR / "final_random_forest_f01_f30.joblib")
    joblib.dump(xgb_search.best_estimator_, MODEL_DIR / "final_xgboost_f01_f30.joblib")
    write_json(MODEL_DIR / "final_feature_columns.json", EXPECTED_FEATURES)
    write_json(MODEL_DIR / "final_metrics.json", metrics)
    write_json(MODEL_DIR / "final_feature_importance.json", importance)
    write_report(metrics, importance, feature_distribution)

    print(json.dumps(metrics, indent=2, ensure_ascii=True))
    print(f"Laporan dibuat: {REPORT_PATH}")


if __name__ == "__main__":
    main()
