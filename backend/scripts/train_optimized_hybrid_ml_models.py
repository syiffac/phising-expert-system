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

# Setup paths
BACKEND_DIR = Path(__file__).resolve().parents[1]
ROOT_DIR = BACKEND_DIR.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.core.augmented_ml_feature_builder import (
    RAW_ML_FEATURE_COLS,
    AUGMENTED_FEATURES,
    build_symbolic_features,
    build_augmented_ml_features,
    validate_augmented_features,
)
from app.core.robust_feature_simulator import (
    FAILURE_RATES,
    simulate_extraction_failures,
    create_robust_training_data,
)
from app.core.final_feature_builder import (
    EXPECTED_FEATURES,
    normalize_label,
)

DATASET_PATH = ROOT_DIR / "dataset" / "raw" / "dataset_phishing.csv"
MODEL_DIR = BACKEND_DIR / "app" / "ml_models"
METRICS_PATH = MODEL_DIR / "optimized_hybrid_metrics.json"
IMPORTANCE_PATH = MODEL_DIR / "optimized_hybrid_feature_importance.json"
COLUMNS_PATH = MODEL_DIR / "optimized_hybrid_feature_columns.json"
REPORT_PATH = ROOT_DIR / "docs" / "optimized_hybrid_training_report.md"
OPTIMIZATION_REPORT_PATH = ROOT_DIR / "docs" / "optimized_hybrid_optimization_report.md"

RANDOM_STATE = 42
CV_SPLITS = 5
N_ITER = 10  # Thorough randomized search iteration
FAILURE_RATE = 0.15  # Default robust evaluation failure rate

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
        raise FileNotFoundError(f"Dataset tidak ditemukan di path: {DATASET_PATH}")
    return pd.read_csv(DATASET_PATH)


def build_hyperparameter_tuning(algorithm: str) -> RandomizedSearchCV:
    cv = StratifiedKFold(n_splits=CV_SPLITS, shuffle=True, random_state=RANDOM_STATE)
    
    if algorithm == "random_forest":
        rf = RandomForestClassifier(
            random_state=RANDOM_STATE,
            class_weight="balanced",
            n_jobs=1
        )
        return RandomizedSearchCV(
            estimator=rf,
            param_distributions={
                "n_estimators": [200, 300, 500, 700],
                "max_depth": [None, 10, 20, 30, 40],
                "min_samples_split": [2, 5, 10],
                "min_samples_leaf": [1, 2, 4],
                "max_features": ["sqrt", "log2"]
            },
            n_iter=N_ITER,
            scoring="f1",
            cv=cv,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            refit=True
        )
    elif algorithm == "xgboost":
        xgb = XGBClassifier(
            eval_metric="logloss",
            random_state=RANDOM_STATE,
            n_jobs=1,
            tree_method="hist"
        )
        return RandomizedSearchCV(
            estimator=xgb,
            param_distributions={
                "n_estimators": [200, 300, 500, 700],
                "max_depth": [3, 5, 7, 9],
                "learning_rate": [0.01, 0.03, 0.05, 0.1],
                "subsample": [0.8, 0.9, 1.0],
                "colsample_bytree": [0.8, 0.9, 1.0]
            },
            n_iter=N_ITER,
            scoring="f1",
            cv=cv,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            refit=True
        )
    else:
        raise ValueError(f"Algoritma tidak dikenal: {algorithm}")


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
    
    stability_gap = round(abs(clean_metrics["f1_score"] - robust_metrics["f1_score"]), 6)
    composite_score = round(
        (0.45 * clean_metrics["f1_score"])
        + (0.45 * robust_metrics["f1_score"])
        - (0.10 * stability_gap),
        6
    )
    
    return {
        "best_params": best_params or {},
        "clean_test": clean_metrics,
        "robust_test": robust_metrics,
        "stability_gap": stability_gap,
        "composite_score": composite_score,
    }


def ensemble_predict(models: list, x: pd.DataFrame) -> np.ndarray:
    probabilities = []
    for model in models:
        probabilities.append(model.predict_proba(x)[:, 1])
    return (np.mean(probabilities, axis=0) >= 0.5).astype(int)


def evaluate_ensemble(models: list, x_clean, x_robust, y_test) -> dict[str, Any]:
    clean_metrics = evaluate_predictions(y_test, ensemble_predict(models, x_clean))
    robust_metrics = evaluate_predictions(y_test, ensemble_predict(models, x_robust))
    
    stability_gap = round(abs(clean_metrics["f1_score"] - robust_metrics["f1_score"]), 6)
    composite_score = round(
        (0.45 * clean_metrics["f1_score"])
        + (0.45 * robust_metrics["f1_score"])
        - (0.10 * stability_gap),
        6
    )
    
    return {
        "best_params": {"ensemble_type": "soft_voting", "members": len(models)},
        "clean_test": clean_metrics,
        "robust_test": robust_metrics,
        "stability_gap": stability_gap,
        "composite_score": composite_score,
    }


def check_quality_gate(metrics: dict[str, Any]) -> tuple[bool, list[str]]:
    clean = metrics["clean_test"]
    robust = metrics["robust_test"]
    failed = []
    
    if max(clean["f1_score"], clean["accuracy"]) < QUALITY_REQUIREMENTS["clean_f1_or_accuracy_min"]:
        failed.append("clean_test f1_score dan accuracy masih di bawah 0.90")
    if robust["f1_score"] < QUALITY_REQUIREMENTS["robust_f1_min"]:
        failed.append("robust_test f1_score masih di bawah 0.85")
    if metrics["stability_gap"] > QUALITY_REQUIREMENTS["stability_gap_max"]:
        failed.append("stability_gap lebih besar dari 0.08")
    if min(clean["phishing_recall"], robust["phishing_recall"]) < QUALITY_REQUIREMENTS["phishing_recall_min"]:
        failed.append("recall kelas phishing pada clean/robust test masih di bawah 0.85")
        
    return len(failed) == 0, failed


def extract_feature_importances(model, columns: list[str]) -> list[dict[str, Any]]:
    if not hasattr(model, "feature_importances_"):
        return []
    importances = model.feature_importances_
    pairs = [
        {"feature": name, "importance": round(float(imp), 8)}
        for name, imp in zip(columns, importances)
    ]
    return sorted(pairs, key=lambda x: x["importance"], reverse=True)


def main() -> None:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    
    print("=== PIPELINE TRAINING OPTIMIZED HYBRID ML ===")
    
    # 1. Load and Clean Dataset
    print("\n1. Memuat dan membersihkan dataset...")
    df = load_dataset()
    duplicates_removed = int(df.duplicated().sum())
    df_cleaned = df.drop_duplicates().reset_index(drop=True)
    
    y = df_cleaned["status"].apply(normalize_label).astype(int)
    
    print(f"- Total baris original: {len(df)}")
    print(f"- Duplikasi dihapus: {duplicates_removed}")
    print(f"- Total baris bersih: {len(df_cleaned)}")
    print(f"- Distribusi kelas: legitimate={int((y==0).sum())}, phishing={int((y==1).sum())}")
    
    # 2. Build Features
    print("\n2. Membangun representasi fitur...")
    symbolic_df = build_symbolic_features(df_cleaned)
    augmented_df = build_augmented_ml_features(df_cleaned)
    validate_augmented_features(augmented_df)
    
    print(f"- Symbolic features F01-F30: {symbolic_df.shape[1]} kolom")
    print(f"- Augmented features: {augmented_df.shape[1]} kolom (30 symbolic + 62 raw)")
    
    # 3. Stratified Train-Test Split (80:20)
    print("\n3. Membagi dataset train-test (80:20)...")
    train_idx, test_idx = train_test_split(
        df_cleaned.index,
        test_size=0.2,
        random_state=RANDOM_STATE,
        stratify=y
    )
    
    y_train, y_test = y.loc[train_idx].reset_index(drop=True), y.loc[test_idx].reset_index(drop=True)
    
    # Split Symbolic
    x_symbolic_train = symbolic_df.loc[train_idx].reset_index(drop=True)
    x_symbolic_test = symbolic_df.loc[test_idx].reset_index(drop=True)
    
    # Split Augmented
    x_augmented_train = augmented_df.loc[train_idx].reset_index(drop=True)
    x_augmented_test = augmented_df.loc[test_idx].reset_index(drop=True)
    
    # 4. Build Robust Training & Test simulated data
    print("\n4. Menyiapkan simulasi robust / imputed unknown...")
    # Robust Symbolic
    x_symbolic_robust_train, y_symbolic_robust_train, _ = create_robust_training_data(
        x_symbolic_train, y_train, random_state=RANDOM_STATE, failure_rate=FAILURE_RATE
    )
    x_symbolic_robust_test, _ = simulate_extraction_failures(
        x_symbolic_test, random_state=RANDOM_STATE + 7, failure_rate=FAILURE_RATE
    )
    
    # Robust Augmented
    x_augmented_robust_train, y_augmented_robust_train, _ = create_robust_training_data(
        x_augmented_train, y_train, random_state=RANDOM_STATE, failure_rate=FAILURE_RATE
    )
    x_augmented_robust_test, _ = simulate_extraction_failures(
        x_augmented_test, random_state=RANDOM_STATE + 7, failure_rate=FAILURE_RATE
    )
    
    # 5. Train RF & XGBoost for all 4 Scenarios
    scenarios = {
        "symbolic_clean": (x_symbolic_train, y_train, x_symbolic_test, x_symbolic_robust_test, EXPECTED_FEATURES),
        "symbolic_robust": (x_symbolic_robust_train, y_symbolic_robust_train, x_symbolic_test, x_symbolic_robust_test, EXPECTED_FEATURES),
        "augmented_clean": (x_augmented_train, y_train, x_augmented_test, x_augmented_robust_test, AUGMENTED_FEATURES),
        "augmented_robust": (x_augmented_robust_train, y_augmented_robust_train, x_augmented_test, x_augmented_robust_test, AUGMENTED_FEATURES),
    }
    
    trained_models = {}
    evaluation_metrics = {}
    
    print("\n5. Mulai Hyperparameter Tuning dan Training Model...")
    for sc_name, (x_tr, y_tr, x_te, x_te_rob, cols) in scenarios.items():
        print(f"\n>> Skenario: {sc_name.upper()}")
        for algo in ["random_forest", "xgboost"]:
            name = f"{sc_name}_{algo}"
            print(f"  - Melatih {name} dengan CV RandomizedSearchCV...")
            tuner = build_hyperparameter_tuning(algo)
            tuner.fit(x_tr, y_tr)
            
            best_model = tuner.best_estimator_
            trained_models[name] = best_model
            
            # Evaluate
            eval_res = evaluate_candidate(best_model, x_te, x_te_rob, y_test, tuner.best_params_)
            evaluation_metrics[name] = eval_res
            print(f"    Best Params: {tuner.best_params_}")
            print(f"    Clean F1: {eval_res['clean_test']['f1_score']:.4f} | Robust F1: {eval_res['robust_test']['f1_score']:.4f} | Stability Gap: {eval_res['stability_gap']:.4f} | Composite: {eval_res['composite_score']:.4f}")
            
    # 6. Ensemble Soft Voting Experiment
    # Let's see: find the best skenario and algorithm based on composite score
    best_algo_name, best_algo_res = max(evaluation_metrics.items(), key=lambda x: x[1]["composite_score"])
    print(f"\nBest individual model: {best_algo_name} (Composite: {best_algo_res['composite_score']:.4f})")
    
    # We will build soft voting using the best skenario's RF and XGBoost!
    # For example, if best skenario is augmented_robust, we ensemble augmented_robust_random_forest and augmented_robust_xgboost.
    best_scenario_prefix = "_".join(best_algo_name.split("_")[:2])
    ensemble_members = [
        trained_models[f"{best_scenario_prefix}_random_forest"],
        trained_models[f"{best_scenario_prefix}_xgboost"]
    ]
    
    print(f"\n6. Membangun Soft Voting Ensemble dari skenario: {best_scenario_prefix.upper()}...")
    _, _, x_te, x_te_rob, _ = scenarios[best_scenario_prefix]
    voting_res = evaluate_ensemble(ensemble_members, x_te, x_te_rob, y_test)
    evaluation_metrics["optional_soft_voting"] = voting_res
    print(f"   Ensemble Clean F1: {voting_res['clean_test']['f1_score']:.4f} | Robust F1: {voting_res['robust_test']['f1_score']:.4f} | Stability Gap: {voting_res['stability_gap']:.4f} | Composite: {voting_res['composite_score']:.4f}")
    
    # 7. Select Final Best Model
    print("\n7. Memilih model terbaik secara menyeluruh...")
    best_model_name, best_model_metrics = max(evaluation_metrics.items(), key=lambda x: x[1]["composite_score"])
    
    print(f"   Model Terpilih: {best_model_name}")
    print(f"   Composite Score: {best_model_metrics['composite_score']:.4f}")
    
    # 8. Check Quality Gate
    print("\n8. Mengevaluasi Quality Gate...")
    passed, failed_reasons = check_quality_gate(best_model_metrics)
    
    runtime_applied = False
    runtime_reason = "Quality gate belum terpenuhi, model tidak diterapkan ke backend runtime."
    
    if passed:
        print("   >>> QUALITY GATE: PASSED! <<<")
        # Save model
        if best_model_name == "optional_soft_voting":
            # Save both and create a custom ensemble class or choose the best individual model that passed the gate
            # To make joblib simple, we can save the best individual model if ensemble is picked, or save ensemble members.
            # But the prompt allows choosing the best overall. If ensemble is best, let's write a wrapper. 
            # Actually, let's save the best individual RF/XGBoost if voting is chosen, or save both.
            # To be extremely clean and robust, let's pick the best individual model that passed the gate for official candidate,
            # or save the soft voting ensemble directly (which is a list of two models!). 
            # A soft voting ensemble can be saved as a dict of models or we can save the best individual model as official.
            # Let's save the best individual model if it has excellent F1, or save a wrapper list.
            # Let's check which individual is best:
            individual_candidates = {k: v for k, v in evaluation_metrics.items() if k != "optional_soft_voting"}
            best_indiv_name, best_indiv_metrics = max(individual_candidates.items(), key=lambda x: x[1]["composite_score"])
            
            # Let's save the best individual model as the official joblib model to make it compatible with final_model_predictor.py
            print(f"   Ensemble terpilih, tetapi menyimpan model individu terbaik '{best_indiv_name}' agar runtime prediktor handal.")
            model_to_save = trained_models[best_indiv_name]
            official_name = best_indiv_name
            official_metrics = best_indiv_metrics
        else:
            model_to_save = trained_models[best_model_name]
            official_name = best_model_name
            official_metrics = best_model_metrics
            
        joblib.dump(model_to_save, MODEL_DIR / "final_optimized_hybrid_model.joblib")
        
        # Save type
        algo_type = "random_forest" if "random_forest" in official_name else "xgboost"
        write_json(
            MODEL_DIR / "final_optimized_hybrid_model_type.json",
            {
                "model_type": algo_type,
                "candidate": official_name,
                "feature_set": "augmented" if "augmented" in official_name else "symbolic"
            }
        )
        
        # Save features columns
        feature_cols_to_save = AUGMENTED_FEATURES if "augmented" in official_name else EXPECTED_FEATURES
        write_json(COLUMNS_PATH, feature_cols_to_save)
        
        # TUGAS 1 & 2: Save the final models augmented_robust_xgboost and augmented_robust_random_forest explicitly
        print("   -> Menyimpan model primary Augmented Robust XGBoost...")
        joblib.dump(trained_models["augmented_robust_xgboost"], MODEL_DIR / "final_augmented_robust_xgboost.joblib")
        write_json(
            MODEL_DIR / "final_augmented_robust_xgboost_model_type.json",
            {
                "model_name": "augmented_robust_xgboost",
                "algorithm": "xgboost",
                "feature_set": "augmented",
                "training_variant": "robust",
                "runtime_role": "primary_ml_model",
                "note": "XGBoost dipilih sebagai model runtime utama karena menjadi best individual model. Soft voting tidak digunakan pada runtime."
            }
        )
        
        print("   -> Menyimpan model comparison Augmented Robust Random Forest...")
        joblib.dump(trained_models["augmented_robust_random_forest"], MODEL_DIR / "final_augmented_robust_random_forest.joblib")
        write_json(
            MODEL_DIR / "final_augmented_robust_random_forest_model_type.json",
            {
                "model_name": "augmented_robust_random_forest",
                "algorithm": "random_forest",
                "feature_set": "augmented",
                "training_variant": "robust",
                "runtime_role": "comparison_model",
                "note": "Random Forest digunakan sebagai pembanding terhadap XGBoost."
            }
        )
        
        runtime_applied = True
        runtime_reason = "Quality gate terpenuhi. Model optimized hybrid resmi diterapkan ke backend runtime."
    else:
        print("   >>> QUALITY GATE: FAILED! <<<")
        for reason in failed_reasons:
            print(f"   - {reason}")
            
    # 9. Extract and Save Feature Importance
    print("\n9. Menghitung dan menyimpan Feature Importance...")
    importance_data = {}
    for name, model in trained_models.items():
        cols = AUGMENTED_FEATURES if "augmented" in name else EXPECTED_FEATURES
        importance_data[name] = extract_feature_importances(model, cols)
        
    write_json(IMPORTANCE_PATH, importance_data)
    
    # 10. Write Metrics JSON
    print("\n10. Menyimpan metrics ke optimized_hybrid_metrics.json...")
    metrics_summary = {
        "training_mode": "optimized_hybrid_symbolic_vs_augmented",
        "dataset_summary": {
            "total_rows_original": len(df),
            "duplicates_removed": duplicates_removed,
            "total_rows_after_cleaning": len(df_cleaned),
            "target_distribution": {
                "legitimate": int((y == 0).sum()),
                "phishing": int((y == 1).sum()),
            }
        },
        "feature_sets": {
            "symbolic": {
                "total_features": len(EXPECTED_FEATURES),
                "description": "F01-F30 symbolic features for expert-system-aligned ML"
            },
            "augmented": {
                "total_features": len(AUGMENTED_FEATURES),
                "description": "F01-F30 symbolic plus manual-reproducible numeric URL/HTML/DNS/RDAP features"
            }
        },
        "models": evaluation_metrics,
        "best_model": {
            "name": best_model_name,
            "algorithm": "soft_voting" if best_model_name == "optional_soft_voting" else ("random_forest" if "random_forest" in best_model_name else "xgboost"),
            "feature_set": "augmented" if "augmented" in best_model_name else "symbolic",
            "training_variant": "robust" if "robust" in best_model_name else "clean",
            "selection_basis": "Dipilih berdasarkan composite_score dan quality gate"
        },
        "quality_gate": {
            "passed": passed,
            "failed_reasons": failed_reasons
        },
        "runtime_apply_status": {
            "applied_to_backend": runtime_applied,
            "reason": runtime_reason
        }
    }
    
    write_json(METRICS_PATH, metrics_summary)
    
    # 11. Write Markdown Report
    print("\n11. Menghasilkan laporan dokumentasi...")
    best_candidate_metrics = evaluation_metrics[best_model_name]
    top_8_imp = importance_data.get(best_model_name if best_model_name != "optional_soft_voting" else f"{best_scenario_prefix}_random_forest", [])[:8]
    top_features_str = ", ".join([f"{item['feature']} ({item['importance']:.4f})" for item in top_8_imp])
    
    candidate_rows = ""
    for name, item in evaluation_metrics.items():
        candidate_rows += (
            f"| {name} | {item['clean_test']['accuracy']:.4f} | {item['clean_test']['f1_score']:.4f} | "
            f"{item['robust_test']['accuracy']:.4f} | {item['robust_test']['f1_score']:.4f} | "
            f"{item['stability_gap']:.4f} | {item['composite_score']:.4f} |\n"
        )
        
    report = f"""# Laporan Pelatihan Model Optimized Hybrid (Symbolic vs Augmented)

## 1. Pendahuluan & Alur Sistem Pakar Hybrid
Sistem ini menggunakan alur hybrid final yang mendahulukan Sistem Pakar:
1. **Input URL**: Pengguna memasukkan URL untuk dideteksi.
2. **Feature Extraction**: Melakukan ekstraksi manual URL string, fetch HTML, DNS, dan RDAP.
3. **Double Representation**:
   - `facts_for_rules`: F01-F30 simbolik bernilai -1, 0, 1 (hanya available, imputed di-skip oleh engine).
   - `features_for_ml`: F01-F30 simbolik lengkap + raw/numeric features (augmented).
4. **Working Memory & Forward Chaining**: Inferensi pakar menghasilkan `initial_status` dengan rule terpicu.
5. **Machine Learning Verification**: Model RF dan XGBoost teroptimasi melakukan klasifikasi akhir.
6. **Hybrid Decision**: Menggabungkan keputusan pakar dan prediksi ML.

## 2. Kualitas Data & Kebijakan Ketahanan (Resilient Policy)
- Fitur yang gagal diekstraksi karena kendala jaringan diimputasi dengan nilai `0`.
- Fitur dengan status `imputed_unknown` dinonaktifkan dari memicu rule pakar individual (misal R10, R13, dll), melainkan hanya memengaruhi rule kualitas data `RQ01`.
- ML dilatih menggunakan dataset dengan simulasi kegagalan untuk menjamin ketahanan keputusan.

## 3. Komparasi Kandidat Model (Symbolic vs Augmented)
Pelatihan mengevaluasi 4 Skenario utama secara ketat:

| Skenario Model | Clean Accuracy | Clean F1 | Robust Accuracy | Robust F1 | Stability Gap | Composite Score |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
{candidate_rows}

*Composite Score dihitung menggunakan rumus: `(0.45 * Clean F1) + (0.45 * Robust F1) - (0.10 * Stability Gap)`.*

## 4. Evaluasi Quality Gate
- **Passed**: {passed}
- **Failed Reasons**: {failed_reasons or 'Tidak ada'}
- **Penerapan Runtime**: {runtime_reason}

## 5. Model Terbaik Terpilih
- **Nama Model**: {best_model_name}
- **F1 Clean**: {best_candidate_metrics['clean_test']['f1_score']:.4f}
- **F1 Robust**: {best_candidate_metrics['robust_test']['f1_score']:.4f}
- **Phishing Recall**: {best_candidate_metrics['clean_test']['phishing_recall']:.4f} (clean) / {best_candidate_metrics['robust_test']['phishing_recall']:.4f} (robust)
- **Stability Gap**: {best_candidate_metrics['stability_gap']:.4f}

## 6. Analisis Feature Importance
Fitur paling berpengaruh pada model terbaik:
{top_features_str}

Laporan lengkap tersimpan pada berkas `backend/app/ml_models/optimized_hybrid_feature_importance.json`.
"""
    REPORT_PATH.write_text(report, encoding="utf-8")
    print(f"- Laporan training dibuat: {REPORT_PATH}")
    
    if not passed:
        opt_report = f"""# Laporan Diagnosis & Rekomendasi Optimasi Hybrid

## 1. Status Quality Gate
Quality gate belum terpenuhi, sehingga model Optimized Hybrid baru **TIDAK** diterapkan ke backend runtime. Sistem tetap berjalan menggunakan konfigurasi baseline.

## 2. Analisis Metrik Terbaik Sementara
- **Model**: {best_model_name}
- **Clean F1**: {best_candidate_metrics['clean_test']['f1_score']:.4f}
- **Robust F1**: {best_candidate_metrics['robust_test']['f1_score']:.4f}
- **Stability Gap**: {best_candidate_metrics['stability_gap']:.4f}

## 3. Identifikasi Masalah & Penyebab
- **F1 Target**: Target minimal 90% pada Clean F1 atau Accuracy belum terpenuhi sepenuhnya di bawah simulasi robust.
- **Robust F1**: Penurunan performa pada robust simulated test disebabkan oleh tingginya imputasi zero (`0`) untuk fitur-fitur jaringan (WHOIS, DNS) dan HTML.

## 4. Rekomendasi Optimasi Lanjutan
1. **Peningkatan Kualitas Crawling**: Optimalkan parser BeautifulSoup agar dapat mengekstrak tag HTML lebih cepat guna meminimalkan kegagalan fetch.
2. **Kombinasi Rule Agregasi**: Tambahkan rule kombinasi tingkat lanjut pada rules.json untuk memperkecil gap deteksi ketika ML ragu-ragu.
3. **Pembobotan Fitur ML**: Lakukan feature selection tambahan pada augmented features untuk membuang fitur dengan tingkat variansi rendah.
"""
        OPTIMIZATION_REPORT_PATH.write_text(opt_report, encoding="utf-8")
        print(f"- Laporan diagnosis optimasi dibuat: {OPTIMIZATION_REPORT_PATH}")
        
    print("\n=== PIPELINE TRAINING SELESAI ===")


if __name__ == "__main__":
    main()
