# Project Cleanup & Structure Notes

Dokumen ini mendokumentasikan hasil pembersihan (clean code) dan pengorganisasian folder proyek **PhishGuard Expert System** setelah integrasi model final utama berhasil dilakukan.

---

## 1. Model Runtime yang Digunakan (Wajib Dipertahankan)
Seluruh berkas model runtime final berikut tetap berada di direktori utama `backend/app/ml_models/` untuk menjamin stabilitas performa sistem:
* **`final_augmented_robust_xgboost.joblib`**: Model machine learning utama (Augmented Robust XGBoost).
* **`final_augmented_robust_random_forest.joblib`**: Model machine learning pembanding (Augmented Robust Random Forest).
* **`optimized_hybrid_feature_columns.json`**: Rincian 91 kolom fitur yang digunakan oleh model.
* **`optimized_hybrid_metrics.json`**: Metrik evaluasi lengkap untuk kedua model.
* **`optimized_hybrid_feature_importance.json`**: Nilai feature importance dari fitur terpenting.

---

## 2. File Lama & Kandidat yang Diarsipkan
Seluruh berkas eksperimen, prototype, dan model kandidat terdahulu telah dipindahkan secara aman ke folder `archive/` untuk menjaga kerapian direktori root.

### A. Folder `backend/scripts/archive/`
Berisi 7 script eksperimen training dan validasi awal:
* `train_models.py`
* `train_models_from_dataset_features.py`
* `train_final_f01_f30_models.py`
* `train_resilient_f01_f30_models.py`
* `validate_final_models.py`
* `validate_resilient_model.py`
* `inspect_dataset.py`

### B. Folder `backend/app/ml_models/archive/`
Berisi 21 file model baseline, candidate, serta metadata lama:
* Model files: `random_forest_model.joblib`, `xgboost_model.joblib`, `random_forest_dataset_model.joblib`, `xgboost_dataset_model.joblib`, `final_random_forest_f01_f30.joblib`, `final_xgboost_f01_f30.joblib`, `final_optimized_hybrid_model.joblib`
* Metadata & Columns: `final_optimized_hybrid_model_type.json`, `final_augmented_robust_xgboost_model_type.json`, `final_augmented_robust_random_forest_model_type.json`, `feature_columns.json`, `final_feature_columns.json`, `augmented_feature_columns.json`, `dataset_feature_columns.json`
* Metrics & Importance: `metrics.json`, `dataset_metrics.json`, `final_metrics.json`, `resilient_metrics.json`, `final_feature_importance.json`, `final_feature_distribution.json`, `resilient_feature_importance.json`

---

## 3. Hasil Validasi Pasca-Cleanup
Setelah proses reorganisasi folder dan pembersihan cache (`__pycache__` & `.pyc`), sistem backend telah divalidasi end-to-end dengan hasil 100% sukses:

* **Skenario Feature Mapping**: Validasi `validate_feature_mapping.py` sukses mendeteksi 30 fitur simbolik F01-F30 dalam kondisi trainable, direct, dan 0 unmapped.
* **Manual Feature Extractor (`test_manual_feature_extractor.py --network`)**: Sukses memperoleh 30/30 fitur available untuk URL reachable (`google.com`, `example.com`) dan gracefully mendegradasi ke resilient mode dengan 16 `imputed_unknown` untuk URL dummy.
* **Integrasi Runtime (`validate_xgboost_runtime_integration.py`)**: Sukses memuat model utama XGBoost dan model pembanding Random Forest serta memprediksi dengan benar dengan kriteria asersi terpenuhi.
* **Live API Endpoint (`test_api_endpoints.py`)**:
  * **GET `/api/evaluation/`**: Sukses mengembalikan status "augmented_robust_xgboost" sebagai selected runtime model.
  * **POST `/api/detect/`**: Berhasil mengembalikan keputusan terpadu dengan analysis_mode `manual_url_optimized_hybrid_xgboost`, menampilkan `feature_quality`, `expert_system`, `machine_learning`, dan `final_result`.
