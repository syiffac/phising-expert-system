# Laporan Pelatihan Model Optimized Hybrid (Symbolic vs Augmented)

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
| symbolic_clean_random_forest | 0.8640 | 0.8622 | 0.7948 | 0.7751 | 0.0871 | 0.7281 |
| symbolic_clean_xgboost | 0.8578 | 0.8551 | 0.7857 | 0.7596 | 0.0955 | 0.7170 |
| symbolic_robust_random_forest | 0.8635 | 0.8629 | 0.8346 | 0.8296 | 0.0333 | 0.7583 |
| symbolic_robust_xgboost | 0.8587 | 0.8571 | 0.8224 | 0.8191 | 0.0381 | 0.7505 |
| augmented_clean_random_forest | 0.9549 | 0.9550 | 0.9401 | 0.9407 | 0.0143 | 0.8516 |
| augmented_clean_xgboost | 0.9589 | 0.9591 | 0.9414 | 0.9422 | 0.0169 | 0.8539 |
| augmented_robust_random_forest | 0.9510 | 0.9507 | 0.9449 | 0.9449 | 0.0058 | 0.8524 |
| augmented_robust_xgboost | 0.9571 | 0.9574 | 0.9510 | 0.9514 | 0.0059 | 0.8584 |


*Composite Score dihitung menggunakan rumus: `(0.45 * Clean F1) + (0.45 * Robust F1) - (0.10 * Stability Gap)`.*

## 4. Evaluasi Quality Gate
- **Passed**: True
- **Failed Reasons**: Tidak ada
- **Penerapan Runtime**: Quality gate terpenuhi. Model optimized hybrid resmi diterapkan ke backend runtime.

## 5. Model Terbaik & Keputusan Runtime
- **Model ML Utama (Primary Runtime)**: `augmented_robust_xgboost`
  - **Clean F1**: ~95.74%
  - **Robust F1**: ~95.14%
  - **Stability Gap**: ~0.59%
  - **Alasan Pemilihan**: Merupakan model individual terbaik dengan performa sangat tinggi dan seimbang antara data bersih maupun data berderau (robust). Sangat efisien untuk inferensi real-time di API.
- **Model ML Pembanding (Comparison Model)**: `augmented_robust_random_forest`
  - **Clean F1**: ~95.07%
  - **Robust F1**: ~94.49%
  - **Alasan Pemilihan**: Digunakan sebagai model pembanding independen untuk mengevaluasi konsistensi prediksi ML secara empiris.

## 6. Analisis Feature Importance
Fitur paling berpengaruh pada model terbaik:
nb_hyperlinks (0.0987), nb_www (0.0662), domain_age (0.0509), longest_word_path (0.0432), ratio_extHyperlinks (0.0417), safe_anchor (0.0358), phish_hints (0.0352), F18 (0.0351)

Laporan lengkap tersimpan pada berkas `backend/app/ml_models/optimized_hybrid_feature_importance.json`.
