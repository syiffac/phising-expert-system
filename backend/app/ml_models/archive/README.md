# Archive - Model Prototype, Baseline, & Candidates

Folder ini berisi model prototype, baseline, dataset-feature model, dan candidate model yang tidak digunakan sebagai runtime utama.

## Kebijakan Runtime
Runtime utama menggunakan model **Augmented Robust XGBoost** (`final_augmented_robust_xgboost.joblib`) dengan model **Augmented Robust Random Forest** (`final_augmented_robust_random_forest.joblib`) sebagai pembanding empiris independen. Seluruh file model di folder ini disimpan untuk dokumentasi sejarah riset perkembangan proyek.

## Daftar File yang Diarsipkan
1. **Model Files (.joblib)**:
   - `random_forest_model.joblib` (Model baseline RF F01-F30)
   - `xgboost_model.joblib` (Model baseline XGB F01-F30)
   - `random_forest_dataset_model.joblib` (Model RF berbasis data mentah dataset)
   - `xgboost_dataset_model.joblib` (Model XGB berbasis data mentah dataset)
   - `final_random_forest_f01_f30.joblib` (Model final RF F01-F30 lama)
   - `final_xgboost_f01_f30.joblib` (Model final XGB F01-F30 lama)
   - `final_optimized_hybrid_model.joblib` (Model hybrid versi awal/salinan)
2. **Metadata Files (.json)**:
   - `final_optimized_hybrid_model_type.json`
   - `final_augmented_robust_xgboost_model_type.json`
   - `final_augmented_robust_random_forest_model_type.json`
   - `feature_columns.json`
   - `final_feature_columns.json`
   - `augmented_feature_columns.json`
   - `dataset_feature_columns.json`
3. **Metric Files (.json)**:
   - `metrics.json`
   - `dataset_metrics.json`
   - `final_metrics.json`
   - `resilient_metrics.json`
4. **Feature Importance & Distribution Files (.json)**:
   - `final_feature_importance.json`
   - `final_feature_distribution.json`
   - `resilient_feature_importance.json`
