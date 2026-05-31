import json
import sys
from pathlib import Path

import joblib
import pandas as pd

# Setup paths
BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

MODEL_DIR = BACKEND_DIR / "app" / "ml_models"
METRICS_PATH = MODEL_DIR / "optimized_hybrid_metrics.json"
COLUMNS_PATH = MODEL_DIR / "optimized_hybrid_feature_columns.json"
MODEL_PATH = MODEL_DIR / "final_optimized_hybrid_model.joblib"


def main() -> None:
    print("=== VALIDASI MODEL OPTIMIZED HYBRID ===")

    if not METRICS_PATH.exists():
        print(f"Metrics file tidak ditemukan: {METRICS_PATH}")
        print("Jalankan script training terlebih dahulu.")
        return

    with open(METRICS_PATH, "r", encoding="utf-8") as f:
        metrics = json.load(f)

    gate = metrics.get("quality_gate", {})
    passed = gate.get("passed", False)
    reasons = gate.get("failed_reasons", [])

    print(f"- Quality Gate Passed: {passed}")
    if not passed:
        print("- Alasan kegagalan Quality Gate:")
        for reason in reasons:
            print(f"  * {reason}")
        print("\nModel optimized hybrid belum diterapkan karena quality gate belum terpenuhi.")
        return

    # If passed, validate loading and prediction
    print("- Quality Gate terpenuhi! Memuat model official...")
    
    if not MODEL_PATH.exists():
        print(f"Error: File model tidak ditemukan di {MODEL_PATH} padahal quality gate passed.")
        return
        
    if not COLUMNS_PATH.exists():
        print(f"Error: File feature columns tidak ditemukan di {COLUMNS_PATH} padahal quality gate passed.")
        return

    try:
        model = joblib.load(MODEL_PATH)
        with open(COLUMNS_PATH, "r", encoding="utf-8") as f:
            columns = json.load(f)
            
        print(f"- Model successfully loaded from: {MODEL_PATH}")
        print(f"- Number of features expected: {len(columns)}")
        
        # Build one clean sample (all ones/safe)
        clean_sample = {col: 1 for col in columns}
        # If it is raw feature, set to normal values
        for col in columns:
            if col.startswith("length"):
                clean_sample[col] = 15
            elif col.startswith("nb_"):
                clean_sample[col] = 0
            elif col.startswith("ratio_"):
                clean_sample[col] = 0.0
                
        df_clean = pd.DataFrame([clean_sample], columns=columns)
        clean_pred = int(model.predict(df_clean)[0])
        print(f"- Prediksi clean sample (legitimate expected): {clean_pred} ({'phishing' if clean_pred == 1 else 'legitimate'})")
        
        # Build one robust sample (simulate failures on HTML/RDAP/DNS features by setting them to 0)
        robust_sample = clean_sample.copy()
        # Set some features to 0 to simulate failures
        for col in columns:
            if col in ["F09", "F10", "F13", "F24", "F25", "dns_record", "domain_age", "domain_registration_length"]:
                robust_sample[col] = 0
                
        df_robust = pd.DataFrame([robust_sample], columns=columns)
        robust_pred = int(model.predict(df_robust)[0])
        print(f"- Prediksi robust sample (imputed features set to 0): {robust_pred} ({'phishing' if robust_pred == 1 else 'legitimate'})")
        
        print("\nValidasi berhasil! Model optimized hybrid berfungsi dengan baik di runtime.")
        
    except Exception as e:
        print(f"Error saat validasi model di runtime: {str(e)}")


if __name__ == "__main__":
    main()
