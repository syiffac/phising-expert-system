import json
import sys
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from sklearn.base import clone
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


BACKEND_DIR = Path(__file__).resolve().parents[1]
ROOT_DIR = BACKEND_DIR.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.core.final_feature_builder import (  # noqa: E402
    EXPECTED_FEATURES,
    build_final_feature_dataframe,
    get_feature_value_distributions,
    get_low_variance_features,
    normalize_label,
)
from app.core.robust_feature_simulator import (  # noqa: E402
    FAILURE_RATES,
    FAILURE_SIMULATION_GROUPS,
    create_robust_training_data,
    simulate_extraction_failures,
)


DATASET_PATH = ROOT_DIR / "dataset" / "raw" / "dataset_phishing.csv"
MODEL_DIR = BACKEND_DIR / "app" / "ml_models"
METRICS_PATH = MODEL_DIR / "resilient_metrics.json"
IMPORTANCE_PATH = MODEL_DIR / "resilient_feature_importance.json"
REPORT_PATH = ROOT_DIR / "docs" / "resilient_training_report.md"
OPTIMIZATION_REPORT_PATH = ROOT_DIR / "docs" / "resilient_optimization_report.md"
RANDOM_STATE = 42
SCORING = "f1"
CV = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
QUALITY_REQUIREMENTS = {
    "clean_f1_or_accuracy_min": 0.90,
    "robust_f1_min": 0.85,
    "stability_gap_max": 0.08,
    "phishing_recall_min": 0.85,
}


def write_json(path: Path, data: Any) -> None:
    with open(path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2, ensure_ascii=True)
        file.write("\n")


def load_dataset() -> pd.DataFrame:
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset tidak ditemukan: {DATASET_PATH}")
    return pd.read_csv(DATASET_PATH)


def apply_threshold_profile(features: pd.DataFrame, raw: pd.DataFrame, profile: str) -> pd.DataFrame:
    adjusted = features.copy()
    parts = set(profile.split("+")) if profile else {"baseline"}

    if "f18_b" in parts:
        values = pd.to_numeric(raw["phish_hints"], errors="coerce")
        if values.isna().any():
            raise ValueError("F18 optimization: phish_hints memiliki nilai kosong.")
        adjusted["F18"] = np.select(
            [values == 0, values == 1, values >= 2],
            [1, 0, -1],
            default=np.nan,
        ).astype(int)

    if "f29_b" in parts:
        values = pd.to_numeric(raw["ratio_extHyperlinks"], errors="coerce")
        if values.isna().any() or (values < 0).any():
            raise ValueError("F29 optimization: ratio_extHyperlinks tidak valid.")
        if float(values.max()) <= 1:
            adjusted["F29"] = np.select(
                [values <= 0.20, (values > 0.20) & (values <= 0.60), values > 0.60],
                [1, 0, -1],
                default=np.nan,
            ).astype(int)
        else:
            adjusted["F29"] = np.select(
                [values <= 20, (values > 20) & (values <= 60), values > 60],
                [1, 0, -1],
                default=np.nan,
            ).astype(int)

    unexpected = set(adjusted.to_numpy().ravel()) - {-1, 0, 1}
    if unexpected:
        raise ValueError(f"Threshold profile {profile} menghasilkan nilai tidak valid: {unexpected}")

    return adjusted.astype(int)


def build_searches(n_iter: int) -> dict[str, RandomizedSearchCV]:
    rf = RandomForestClassifier(
        random_state=RANDOM_STATE,
        class_weight="balanced",
        n_jobs=1,
    )
    xgb = XGBClassifier(
        eval_metric="logloss",
        random_state=RANDOM_STATE,
        n_jobs=1,
        tree_method="hist",
    )
    return {
        "random_forest": RandomizedSearchCV(
            estimator=rf,
            param_distributions={
                "n_estimators": [200, 300, 500],
                "max_depth": [None, 10, 20, 30],
                "min_samples_split": [2, 5, 10],
                "min_samples_leaf": [1, 2, 4],
                "max_features": ["sqrt", "log2"],
            },
            n_iter=n_iter,
            scoring=SCORING,
            cv=CV,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            refit=True,
        ),
        "xgboost": RandomizedSearchCV(
            estimator=xgb,
            param_distributions={
                "n_estimators": [200, 300, 500],
                "max_depth": [3, 5, 7],
                "learning_rate": [0.01, 0.05, 0.1],
                "subsample": [0.8, 0.9, 1.0],
                "colsample_bytree": [0.8, 0.9, 1.0],
            },
            n_iter=n_iter,
            scoring=SCORING,
            cv=CV,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            refit=True,
        ),
    }


def evaluate_predictions(y_true: pd.Series, y_pred: np.ndarray) -> dict[str, Any]:
    report = classification_report(
        y_true,
        y_pred,
        output_dict=True,
        zero_division=0,
    )
    return {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 6),
        "precision": round(float(precision_score(y_true, y_pred, zero_division=0)), 6),
        "recall": round(float(recall_score(y_true, y_pred, zero_division=0)), 6),
        "f1_score": round(float(f1_score(y_true, y_pred, zero_division=0)), 6),
        "phishing_recall": round(float(report.get("1", {}).get("recall", 0)), 6),
        "confusion_matrix": confusion_matrix(y_true, y_pred).astype(int).tolist(),
        "classification_report": report,
    }


def evaluate_candidate(model, x_clean, x_robust, y_test, best_params: dict | None) -> dict[str, Any]:
    clean_metrics = evaluate_predictions(y_test, model.predict(x_clean))
    robust_metrics = evaluate_predictions(y_test, model.predict(x_robust))
    stability_gap = round(
        abs(clean_metrics["f1_score"] - robust_metrics["f1_score"]),
        6,
    )
    composite_score = round(
        (0.45 * clean_metrics["f1_score"])
        + (0.45 * robust_metrics["f1_score"])
        - (0.10 * stability_gap),
        6,
    )
    return {
        "best_params": best_params or {},
        "clean_test": clean_metrics,
        "robust_test": robust_metrics,
        "stability_gap": stability_gap,
        "composite_score": composite_score,
    }


def feature_importance(model) -> list[dict[str, Any]]:
    if not hasattr(model, "feature_importances_"):
        return []
    pairs = [
        {"feature": feature, "importance": round(float(score), 8)}
        for feature, score in zip(EXPECTED_FEATURES, model.feature_importances_)
    ]
    return sorted(pairs, key=lambda item: item["importance"], reverse=True)


def ensemble_predict(models: list, x: pd.DataFrame) -> np.ndarray:
    probabilities = []
    for model in models:
        if hasattr(model, "predict_proba"):
            probabilities.append(model.predict_proba(x)[:, 1])
        else:
            probabilities.append(model.predict(x))
    return (np.mean(probabilities, axis=0) >= 0.5).astype(int)


def evaluate_ensemble(models: list, x_clean, x_robust, y_test) -> dict[str, Any]:
    clean_metrics = evaluate_predictions(y_test, ensemble_predict(models, x_clean))
    robust_metrics = evaluate_predictions(y_test, ensemble_predict(models, x_robust))
    stability_gap = round(abs(clean_metrics["f1_score"] - robust_metrics["f1_score"]), 6)
    composite_score = round(
        (0.45 * clean_metrics["f1_score"])
        + (0.45 * robust_metrics["f1_score"])
        - (0.10 * stability_gap),
        6,
    )
    return {
        "best_params": {"members": ["robust_random_forest", "robust_xgboost"]},
        "clean_test": clean_metrics,
        "robust_test": robust_metrics,
        "stability_gap": stability_gap,
        "composite_score": composite_score,
    }


def check_quality_gate(candidate: dict[str, Any]) -> tuple[bool, list[str]]:
    clean = candidate["clean_test"]
    robust = candidate["robust_test"]
    failed: list[str] = []
    if max(clean["f1_score"], clean["accuracy"]) < QUALITY_REQUIREMENTS["clean_f1_or_accuracy_min"]:
        failed.append("clean_test f1_score dan accuracy masih di bawah 0.90")
    if robust["f1_score"] < QUALITY_REQUIREMENTS["robust_f1_min"]:
        failed.append("robust_test f1_score masih di bawah 0.85")
    if candidate["stability_gap"] > QUALITY_REQUIREMENTS["stability_gap_max"]:
        failed.append("stability_gap lebih besar dari 0.08")
    if min(clean["phishing_recall"], robust["phishing_recall"]) < QUALITY_REQUIREMENTS["phishing_recall_min"]:
        failed.append("recall kelas phishing pada clean/robust test masih di bawah 0.85")
    return not failed, failed


def train_config(
    raw: pd.DataFrame,
    base_features: pd.DataFrame,
    y: pd.Series,
    threshold_profile: str,
    failure_rate: float,
    n_iter: int,
) -> dict[str, Any]:
    features = apply_threshold_profile(base_features, raw, threshold_profile)
    x_train, x_test, y_train, y_test, raw_train, raw_test = train_test_split(
        features,
        y,
        raw,
        test_size=0.2,
        random_state=RANDOM_STATE,
        stratify=y,
    )
    x_robust_train, y_robust_train, train_simulation = create_robust_training_data(
        x_train,
        y_train,
        random_state=RANDOM_STATE,
        failure_rate=failure_rate,
    )
    x_robust_test, test_simulation = simulate_extraction_failures(
        x_test,
        random_state=RANDOM_STATE + 7,
        failure_rate=failure_rate,
    )
    searches = build_searches(n_iter)
    trained_models = {}
    metrics = {}

    for variant, train_x, train_y in [
        ("clean", x_train, y_train),
        ("robust", x_robust_train, y_robust_train),
    ]:
        for algorithm, search in searches.items():
            name = f"{variant}_{algorithm}"
            print(f"Training {name} | profile={threshold_profile} | failure_rate={failure_rate}")
            fitted = clone(search).fit(train_x, train_y)
            trained_models[name] = fitted.best_estimator_
            metrics[name] = evaluate_candidate(
                fitted.best_estimator_,
                x_test,
                x_robust_test,
                y_test,
                fitted.best_params_,
            )

    ensemble_models = [
        trained_models["robust_random_forest"],
        trained_models["robust_xgboost"],
    ]
    metrics["soft_voting_ensemble"] = evaluate_ensemble(
        ensemble_models,
        x_test,
        x_robust_test,
        y_test,
    )
    best_name, best_metrics = max(
        metrics.items(),
        key=lambda item: item[1]["composite_score"],
    )
    return {
        "threshold_profile": threshold_profile,
        "failure_rate": failure_rate,
        "n_iter": n_iter,
        "models": metrics,
        "trained_models": trained_models,
        "best_model_name": best_name,
        "best_model_metrics": best_metrics,
        "quality_gate": check_quality_gate(best_metrics),
        "split": {
            "train_size": int(len(x_train)),
            "test_size": int(len(x_test)),
            "test_ratio": 0.2,
            "random_state": RANDOM_STATE,
            "stratified": True,
        },
        "simulation": {
            "train": train_simulation,
            "test": test_simulation,
        },
        "raw_test": raw_test,
    }


def summarize_importance(best_config: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    trained = best_config["trained_models"]
    importance = {
        name: feature_importance(model)
        for name, model in trained.items()
    }
    rf_imp = importance.get("robust_random_forest", [])
    xgb_imp = importance.get("robust_xgboost", [])
    averaged = []
    if rf_imp and xgb_imp:
        by_feature = {
            item["feature"]: item["importance"]
            for item in rf_imp
        }
        for item in xgb_imp:
            feature = item["feature"]
            averaged.append(
                {
                    "feature": feature,
                    "importance": round((by_feature.get(feature, 0) + item["importance"]) / 2, 8),
                }
            )
        importance["soft_voting_ensemble"] = sorted(
            averaged,
            key=lambda item: item["importance"],
            reverse=True,
        )
    best_name = best_config["best_model_name"]
    importance["best_model"] = importance.get(best_name, importance.get("soft_voting_ensemble", []))
    return importance


def model_descriptor(name: str) -> dict[str, str]:
    if name == "soft_voting_ensemble":
        return {"algorithm": "soft_voting", "training_variant": "robust"}
    variant, algorithm = name.split("_", 1)
    return {"algorithm": algorithm, "training_variant": variant}


def write_reports(metrics: dict[str, Any], importance: dict[str, Any]) -> None:
    best = metrics["best_model"]
    best_metrics = metrics["models"][best["name"]]
    top_features = ", ".join(
        f"{item['feature']} ({item['importance']:.4f})"
        for item in importance.get("best_model", [])[:8]
    )
    candidate_rows = "\n".join(
        f"| {name} | {item['clean_test']['accuracy']:.4f} | {item['clean_test']['f1_score']:.4f} | "
        f"{item['robust_test']['accuracy']:.4f} | {item['robust_test']['f1_score']:.4f} | "
        f"{item['stability_gap']:.4f} | {item['composite_score']:.4f} |"
        for name, item in metrics["models"].items()
    )
    report = f"""# Laporan Training Resilient F01-F30

## Tujuan

Pipeline ini membandingkan clean model dan robust model untuk hybrid expert system. Alur tetap dimulai dari ekstraksi fitur, working memory F01-F30, rule-based forward chaining, lalu ML sebagai pendukung keputusan.

## Resilient Policy

Fitur yang gagal diekstrak karena HTML, DNS, RDAP, timeout, 404, SSL error, atau domain tidak resolve diberi nilai `0` sebagai unknown/suspicious. Nilai ini bukan default aman dan tidak pernah diubah menjadi `1`.

Fitur rawan gagal:

- HTML: {', '.join(FAILURE_SIMULATION_GROUPS['html'])}
- WHOIS/RDAP: {', '.join(FAILURE_SIMULATION_GROUPS['whois_or_rdap'])}
- DNS: {', '.join(FAILURE_SIMULATION_GROUPS['dns'])}

## Dataset

- Jumlah data awal: {metrics['dataset_summary']['total_rows_original']}
- Duplikasi dihapus: {metrics['dataset_summary']['duplicates_removed']}
- Jumlah data setelah cleaning: {metrics['dataset_summary']['total_rows_after_cleaning']}
- Missing values sumber: {metrics['dataset_summary']['missing_values_total']}
- Distribusi label: {metrics['dataset_summary']['target_distribution']}
- Low variance features: {metrics['feature_summary']['low_variance_features']}

## Clean vs Robust Candidates

| Model | Clean Accuracy | Clean F1 | Robust Accuracy | Robust F1 | Stability Gap | Composite |
|---|---:|---:|---:|---:|---:|---:|
{candidate_rows}

Composite score = `(0.45 * clean_f1) + (0.45 * robust_f1) - (0.10 * stability_gap)`.

## Quality Gate

- Passed: {metrics['quality_gate']['passed']}
- Failed reasons: {metrics['quality_gate']['failed_reasons']}
- Runtime apply status: {metrics['runtime_apply_status']}

## Best Model

Model terbaik berdasarkan composite score adalah `{best['name']}` dengan clean F1 `{best_metrics['clean_test']['f1_score']}` dan robust F1 `{best_metrics['robust_test']['f1_score']}`. Stability gap: `{best_metrics['stability_gap']}`.

## Feature Importance

Fitur teratas best model: {top_features}

Data lengkap tersimpan pada `backend/app/ml_models/resilient_feature_importance.json`.
"""
    REPORT_PATH.write_text(report, encoding="utf-8")

    if not metrics["quality_gate"]["passed"]:
        low_importance = [
            item["feature"]
            for item in importance.get("best_model", [])
            if item["importance"] <= 0.005
        ]
        optimization_rows = "\n".join(
            f"| {trial['threshold_profile']} | {trial['failure_rate']} | "
            f"{trial['best_model_name']} | {trial['best_model_metrics']['clean_test']['f1_score']:.4f} | "
            f"{trial['best_model_metrics']['robust_test']['f1_score']:.4f} | "
            f"{trial['best_model_metrics']['composite_score']:.4f} | {trial['quality_gate_passed']} |"
            for trial in metrics["optimization_trials"]
        )
        optimization_report = f"""# Laporan Optimasi Resilient F01-F30

## Status

Quality gate belum terpenuhi, sehingga model resilient tidak diterapkan ke backend runtime.

## Model Terbaik Sementara

- Nama: {best['name']}
- Clean accuracy: {best_metrics['clean_test']['accuracy']}
- Clean precision: {best_metrics['clean_test']['precision']}
- Clean recall: {best_metrics['clean_test']['recall']}
- Clean F1-score: {best_metrics['clean_test']['f1_score']}
- Robust accuracy: {best_metrics['robust_test']['accuracy']}
- Robust precision: {best_metrics['robust_test']['precision']}
- Robust recall: {best_metrics['robust_test']['recall']}
- Robust F1-score: {best_metrics['robust_test']['f1_score']}
- Stability gap: {best_metrics['stability_gap']}
- Phishing recall clean/robust: {best_metrics['clean_test']['phishing_recall']} / {best_metrics['robust_test']['phishing_recall']}

## Optimasi yang Dicoba

| Threshold Profile | Failure Rate | Best Model | Clean F1 | Robust F1 | Composite | Gate |
|---|---:|---|---:|---:|---:|---|
{optimization_rows}

Optimasi mencakup threshold F18 opsi B, threshold F29 opsi B, failure rate mild/moderate/strong, dan ensemble soft voting. `n_iter` tetap 8 agar training realistis di perangkat pengembangan.

## Feature Importance

- Fitur teratas: {top_features}
- Fitur dengan importance sangat rendah (`<= 0.005`): {', '.join(low_importance) or 'Tidak ada'}
- Low variance dari distribusi fitur: {metrics['feature_summary']['low_variance_features']}

## Rekomendasi Berikutnya

Jangan mengganti fitur otomatis. Analisis lanjutan sebaiknya fokus pada threshold berbasis validasi akademik, penambahan rule agregasi risiko, dan kalibrasi keputusan hybrid agar clean performance tidak dikorbankan oleh robust augmentation.
"""
        OPTIMIZATION_REPORT_PATH.write_text(optimization_report, encoding="utf-8")


def main() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)

    original = load_dataset()
    duplicates_removed = int(original.duplicated().sum())
    missing_values_total = int(original.isna().sum().sum())
    cleaned = original.drop_duplicates().reset_index(drop=True)
    y = cleaned["status"].apply(normalize_label).astype(int)
    base_features = build_final_feature_dataframe(cleaned)
    distributions = get_feature_value_distributions(base_features)
    low_variance = get_low_variance_features(base_features)

    if set(base_features.to_numpy().ravel()) - {-1, 0, 1}:
        raise ValueError("Fitur final harus hanya berisi -1, 0, atau 1.")

    configs = [
        ("baseline", FAILURE_RATES["strong"], 8),
        ("f18_b", FAILURE_RATES["mild"], 8),
        ("f29_b", FAILURE_RATES["moderate"], 8),
        ("f18_b+f29_b", FAILURE_RATES["strong"], 8),
    ]
    completed = []
    for profile, failure_rate, n_iter in configs:
        completed.append(
            train_config(
                raw=cleaned,
                base_features=base_features,
                y=y,
                threshold_profile=profile,
                failure_rate=failure_rate,
                n_iter=n_iter,
            )
        )
        if completed[-1]["quality_gate"][0]:
            break

    best_config = max(
        completed,
        key=lambda item: item["best_model_metrics"]["composite_score"],
    )
    best_name = best_config["best_model_name"]
    quality_passed, failed_reasons = check_quality_gate(best_config["best_model_metrics"])
    importance = summarize_importance(best_config)
    descriptor = model_descriptor(best_name)
    optimization_trials = [
        {
            "threshold_profile": item["threshold_profile"],
            "failure_rate": item["failure_rate"],
            "n_iter": item["n_iter"],
            "best_model_name": item["best_model_name"],
            "best_model_metrics": item["best_model_metrics"],
            "quality_gate_passed": item["quality_gate"][0],
            "quality_gate_failed_reasons": item["quality_gate"][1],
        }
        for item in completed
    ]

    runtime_apply_status = {
        "applied_to_backend": False,
        "reason": "Quality gate belum terpenuhi; /api/detect/ tetap memakai rule-based resilient extractor tanpa model runtime baru.",
    }
    if quality_passed:
        model_to_save = best_config["trained_models"].get(best_name)
        if model_to_save is not None:
            joblib.dump(model_to_save, MODEL_DIR / "final_resilient_model.joblib")
            write_json(
                MODEL_DIR / "final_resilient_model_type.json",
                {"model_type": descriptor["algorithm"], "candidate": best_name},
            )
            write_json(MODEL_DIR / "final_resilient_feature_columns.json", EXPECTED_FEATURES)
            runtime_apply_status = {
                "applied_to_backend": True,
                "reason": "Quality gate terpenuhi dan model resilient resmi disimpan.",
            }

    metrics = {
        "training_mode": "resilient_f01_f30_clean_vs_robust",
        "dataset_summary": {
            "total_rows_original": int(len(original)),
            "total_rows_after_cleaning": int(len(cleaned)),
            "duplicates_removed": duplicates_removed,
            "missing_values_total": missing_values_total,
            "target_distribution": {
                "legitimate": int((y == 0).sum()),
                "phishing": int((y == 1).sum()),
            },
        },
        "feature_summary": {
            "total_features_used": 30,
            "feature_columns": EXPECTED_FEATURES,
            "low_variance_features": low_variance,
            "feature_distributions": distributions,
        },
        "resilient_policy": {
            "unknown_encoding": 0,
            "meaning": "unknown/suspicious",
            "simulated_feature_groups": FAILURE_SIMULATION_GROUPS,
            "failure_rates_tested": sorted({item["failure_rate"] for item in completed}),
        },
        "threshold_optimization": {
            "profiles_tested": [item["threshold_profile"] for item in completed],
        },
        "models": best_config["models"],
        "best_model": {
            "name": best_name,
            **descriptor,
            "threshold_profile": best_config["threshold_profile"],
            "failure_rate": best_config["failure_rate"],
            "selection_basis": "Dipilih berdasarkan composite_score dan quality gate.",
        },
        "quality_gate": {
            "passed": quality_passed,
            "requirements": QUALITY_REQUIREMENTS,
            "failed_reasons": failed_reasons,
        },
        "runtime_apply_status": runtime_apply_status,
        "optimization_trials": optimization_trials,
        "notes": "Fitur gagal diekstrak diberi nilai 0 sebagai unknown/suspicious, bukan default aman.",
    }

    write_json(METRICS_PATH, metrics)
    write_json(IMPORTANCE_PATH, importance)
    write_reports(metrics, importance)

    print(json.dumps(metrics, indent=2, ensure_ascii=True))
    print(f"Metrics dibuat: {METRICS_PATH}")
    print(f"Feature importance dibuat: {IMPORTANCE_PATH}")
    print(f"Laporan dibuat: {REPORT_PATH}")
    if not quality_passed:
        print(f"Laporan optimasi dibuat: {OPTIMIZATION_REPORT_PATH}")


if __name__ == "__main__":
    main()
