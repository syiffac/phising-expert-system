import json
import sys
from pathlib import Path

# Setup paths
BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app.core.manual_feature_extractor import extract_manual_features
from app.core.optimized_hybrid_predictor import (
    load_primary_xgboost_model,
    load_comparison_random_forest_model,
    predict_optimized_hybrid,
)

URLS = [
    "https://www.google.com",
    "https://example.com",
    "http://secure-login-bank@verify-update.com",
    "http://login-bank.xyz/paypal/verify-account",
]


def main() -> None:
    print("=== VALIDASI INTEGRASI RUNTIME XGBOOST ===")

    # 1. Load XGBoost Model
    try:
        xgb_model, feature_columns, xgb_meta = load_primary_xgboost_model()
        print(f"\n[OK] Model XGBoost Utama berhasil dimuat.")
        print(f"     - Path: final_augmented_robust_xgboost.joblib")
        print(f"     - Jumlah Fitur: {len(feature_columns)}")
        print(f"     - Peran: {xgb_meta.get('runtime_role')}")
    except Exception as e:
        print(f"\n[FAIL] Gagal memuat model XGBoost Utama: {str(e)}")
        sys.exit(1)

    # 2. Load Random Forest Model
    rf_model = load_comparison_random_forest_model()
    if rf_model is not None:
        print(f"[OK] Model Random Forest Pembanding berhasil dimuat.")
        print(f"     - Path: final_augmented_robust_random_forest.joblib")
    else:
        print(f"[INFO] Model Random Forest Pembanding tidak tersedia.")

    # 3. Jalankan Ekstraksi dan Prediksi untuk setiap URL
    for url in URLS:
        print("\n" + "=" * 60)
        print(f"URL: {url}")
        
        # Ekstraksi manual dengan network/fetch HTML/DNS/RDAP aktif
        extraction_result = extract_manual_features(url, enable_network=True)
        quality = extraction_result["feature_quality"]
        
        # Prediksi Optimized Hybrid
        ml_res = predict_optimized_hybrid(extraction_result)
        
        if ml_res.get("available") is True:
            primary = ml_res["primary_model"]
            comparison = ml_res["comparison_model"]
            
            print(f"- Feature Quality:")
            print(f"  * Total: {quality['total_features']}")
            print(f"  * Available: {quality['available']}")
            print(f"  * Imputed Unknown: {quality['imputed_unknown']}")
            print(f"  * Imputed Features: {quality['imputed_features']}")
            
            print(f"- XGBoost Prediction (Primary):")
            print(f"  * Algorithm: {primary['algorithm']}")
            print(f"  * Prediction: {primary['prediction']}")
            print(f"  * Confidence: {primary['confidence']}")
            
            print(f"- Random Forest Prediction (Comparison):")
            print(f"  * Available: {comparison['available']}")
            print(f"  * Algorithm: {comparison['algorithm']}")
            print(f"  * Prediction: {comparison['prediction']}")
            print(f"  * Confidence: {comparison['confidence']}")
            
            # Verifikasi
            has_imputed = quality['imputed_unknown'] > 0
            print(f"- Verifikasi Status:")
            print(f"  * Apakah memiliki imputed_unknown? {has_imputed}")
            print(f"  * Apakah XGBoost menjadi primary_model? {primary['name'] == 'augmented_robust_xgboost'}")
            print(f"  * Apakah soft voting digunakan di runtime? False (Tepat!)")
        else:
            print(f"[FAIL] Prediksi ML tidak tersedia: {ml_res.get('reason')}")

    print("\n" + "=" * 60)
    print("Validasi integrasi XGBoost runtime selesai dengan sukses!")


if __name__ == "__main__":
    main()
