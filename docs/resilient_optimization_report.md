# Laporan Optimasi Resilient F01-F30

## Status

Quality gate belum terpenuhi, sehingga model resilient tidak diterapkan ke backend runtime.

## Model Terbaik Sementara

- Nama: robust_xgboost
- Clean accuracy: 0.8666
- Clean F1-score: 0.8645
- Robust accuracy: 0.8622
- Robust F1-score: 0.8547
- Stability gap: 0.0098

## Optimasi yang Dicoba

| Threshold Profile | Failure Rate | Best Model | Clean F1 | Robust F1 | Composite | Gate |
|---|---:|---|---:|---:|---:|---|
| baseline | 0.15 | robust_random_forest | 0.8678 | 0.8289 | 0.7596 | False |
| f18_b | 0.05 | robust_xgboost | 0.8645 | 0.8547 | 0.7727 | False |
| f29_b | 0.1 | robust_random_forest | 0.8683 | 0.8472 | 0.7699 | False |
| f18_b+f29_b | 0.15 | robust_random_forest | 0.8654 | 0.8344 | 0.7618 | False |

Optimasi mencakup threshold F18 opsi B, threshold F29 opsi B, dan failure rate mild/moderate/strong. `n_iter` tetap 8 agar training realistis di perangkat pengembangan.

## Feature Importance

- Fitur teratas: F18 (0.1569), F01 (0.1272), F28 (0.0766), F15 (0.0667), F14 (0.0601), F04 (0.0462), F24 (0.0394), F07 (0.0394)
- Fitur dengan importance sangat rendah (`<= 0.005`): F16, F11
- Low variance dari distribusi fitur: ['F16', 'F17']

## Rekomendasi Berikutnya

Jangan mengganti fitur otomatis. Analisis lanjutan sebaiknya fokus pada threshold berbasis validasi akademik, penambahan rule agregasi risiko, dan kalibrasi keputusan hybrid agar clean performance tidak dikorbankan oleh robust augmentation.
