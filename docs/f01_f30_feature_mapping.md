# Mapping Fitur Sistem Pakar F01-F30

## Tujuan

Dokumen ini memetakan kolom dataset asli ke fitur/gejala sistem pakar F01-F30 sebagai dasar penyusunan data training final. Mapping hanya menggunakan kolom yang tersedia atau transformasi yang eksplisit; fitur yang belum memiliki sumber valid tidak diisi dengan nilai default.

## Ringkasan Dataset

- Sumber data: `dataset/raw/dataset_phishing.csv`
- Jumlah baris: 11430
- Jumlah kolom: 89
- Kolom dataset: `url`, `length_url`, `length_hostname`, `ip`, `nb_dots`, `nb_hyphens`, `nb_at`, `nb_qm`, `nb_and`, `nb_or`, `nb_eq`, `nb_underscore`, `nb_tilde`, `nb_percent`, `nb_slash`, `nb_star`, `nb_colon`, `nb_comma`, `nb_semicolumn`, `nb_dollar`, `nb_space`, `nb_www`, `nb_com`, `nb_dslash`, `http_in_path`, `https_token`, `ratio_digits_url`, `ratio_digits_host`, `punycode`, `port`, `tld_in_path`, `tld_in_subdomain`, `abnormal_subdomain`, `nb_subdomains`, `prefix_suffix`, `random_domain`, `shortening_service`, `path_extension`, `nb_redirection`, `nb_external_redirection`, `length_words_raw`, `char_repeat`, `shortest_words_raw`, `shortest_word_host`, `shortest_word_path`, `longest_words_raw`, `longest_word_host`, `longest_word_path`, `avg_words_raw`, `avg_word_host`, `avg_word_path`, `phish_hints`, `domain_in_brand`, `brand_in_subdomain`, `brand_in_path`, `suspecious_tld`, `statistical_report`, `nb_hyperlinks`, `ratio_intHyperlinks`, `ratio_extHyperlinks`, `ratio_nullHyperlinks`, `nb_extCSS`, `ratio_intRedirection`, `ratio_extRedirection`, `ratio_intErrors`, `ratio_extErrors`, `login_form`, `external_favicon`, `links_in_tags`, `submit_email`, `ratio_intMedia`, `ratio_extMedia`, `sfh`, `iframe`, `popup_window`, `safe_anchor`, `onmouseover`, `right_clic`, `empty_title`, `domain_in_title`, `domain_with_copyright`, `whois_registered_domain`, `domain_registration_length`, `domain_age`, `web_traffic`, `dns_record`, `google_index`, `page_rank`, `status`

## Ringkasan Mapping

- Total fitur F01-F30: 30
- Fitur trainable: 30
- Direct: 30
- Derived: 0
- External required: 0
- Unmapped: 0

F08, F12, dan F29 tetap diselaraskan dengan kolom `tld_in_path`, `https_token`, dan `ratio_extHyperlinks`. F18, F26, F27, F28, dan F30 kini memakai `phish_hints`, `brand_in_path`, `suspecious_tld`, `domain_in_title`, dan `empty_title`, sehingga input manual dapat memperoleh bukti dari URL atau HTML tanpa mengandalkan traffic, ranking, indexing, atau blacklist pihak ketiga.

Rule base terkait kini berjumlah 24 rule: R19 dan R20 menjelaskan Domain in Title serta Empty Title, sementara R22-R24 menambahkan indikator Phishing Hints, Brand in Path, dan Suspicious TLD.

Rujukan: Hannousse & Yahiouche, *Towards Benchmark Datasets for Machine Learning Based Website Phishing Detection*, https://arxiv.org/abs/2010.12847; Aljofey et al., *An effective detection approach for phishing websites using URL and HTML features*, Scientific Reports 2022, https://pubmed.ncbi.nlm.nih.gov/35614133/; Shaukat et al., *BERT-Based Approaches to Identifying Malicious URLs*, Sensors 2023, https://doi.org/10.3390/s23208499.

## Tabel Mapping

| Kode | Nama Fitur | Status Mapping | Kolom Dataset | Transformasi | Trainable | Catatan |
|---|---|---|---|---|---|---|
| F01 | Have IP Address | direct | ip | Jika ip = 1 (URL menggunakan alamat IP) maka -1; jika ip = 0 maka 1. | Ya | Kolom ip secara langsung menyatakan penggunaan IP address pada hostname URL. |
| F02 | URL Length | direct | length_url | Jika length_url < 54 maka 1; jika 54 <= length_url <= 75 maka 0; jika length_url > 75 maka -1. | Ya | Threshold mengikuti kategorisasi URL Length yang telah digunakan pada prototype ekstraksi URL. |
| F03 | Shortening Service | direct | shortening_service | Jika shortening_service = 1 maka -1; jika shortening_service = 0 maka 1. | Ya | Kolom dataset langsung menandai penggunaan layanan pemendek URL. |
| F04 | Having @ Symbol | direct | nb_at | Jika nb_at = 0 maka 1; jika nb_at >= 1 maka -1. | Ya | Jumlah karakter @ dapat langsung ditransformasikan menjadi indikator keberadaan simbol @. |
| F05 | Double Slash Redirecting | direct | nb_dslash | Jika nb_dslash = 1 (double slash tambahan terdeteksi) maka -1; jika nb_dslash = 0 maka 1. | Ya | Dataset menyediakan indikator double slash tambahan sebagai kolom biner. |
| F06 | Prefix-Suffix | direct | prefix_suffix | Jika prefix_suffix = 1 maka -1; jika prefix_suffix = 0 maka 1. | Ya | Kolom prefix_suffix mewakili penggunaan pola hubung pada domain. |
| F07 | Having Subdomain | direct | nb_subdomains | Jika nb_subdomains = 1 maka 1; jika nb_subdomains = 2 maka 0; jika nb_subdomains >= 3 maka -1. | Ya | Nilai dataset berada pada rentang 1 sampai 3 dan dapat dikategorikan berdasarkan banyaknya subdomain. |
| F08 | TLD in Path | direct | tld_in_path | Jika tld_in_path = 1 maka -1; jika tld_in_path = 0 maka 1. | Ya | Kolom tld_in_path secara langsung menandai pola TLD pada bagian path URL. |
| F09 | Domain Registration Length | direct | domain_registration_length | Jika domain_registration_length > 365 hari maka 1; jika 0 <= domain_registration_length <= 365 hari maka -1; jika nilainya < 0 maka 0 karena informasi tidak tersedia. | Ya | Kolom menyimpan panjang registrasi domain dalam satuan hari; nilai negatif dipertahankan sebagai kondisi data tidak tersedia. |
| F10 | Favicon | direct | external_favicon | Jika external_favicon = 1 maka -1; jika external_favicon = 0 maka 1. | Ya | Kolom menyatakan apakah favicon berasal dari sumber eksternal. |
| F11 | Port | direct | port | Jika port = 1 (indikator port tidak umum tersedia) maka -1; jika port = 0 maka 1. | Ya | Kolom port dipetakan sebagai indikator biner penggunaan port yang mencurigakan. |
| F12 | HTTPS Token | direct | https_token | Jika https_token = 1 maka -1; jika https_token = 0 maka 1. | Ya | Knowledge base diselaraskan dengan kolom https_token untuk mendeteksi token HTTPS yang muncul pada bagian URL yang tidak semestinya. |
| F13 | Request URL | direct | ratio_extMedia | Jika ratio_extMedia < 22 maka 1; jika 22 <= ratio_extMedia <= 61 maka 0; jika ratio_extMedia > 61 maka -1. | Ya | Rasio media eksternal mewakili resource halaman yang diminta dari domain lain. |
| F14 | URL of Anchor | direct | safe_anchor | Jika safe_anchor < 31 maka 1; jika 31 <= safe_anchor <= 67 maka 0; jika safe_anchor > 67 maka -1. | Ya | Meskipun bernama safe_anchor, definisi sumber dataset menghitung anchor tidak aman seperti #, javascript, atau mailto; rasio tinggi lebih berbahaya. |
| F15 | Links in Tags | direct | links_in_tags | Jika links_in_tags > 81 maka 1; jika 17 <= links_in_tags <= 81 maka 0; jika links_in_tags < 17 maka -1. | Ya | Sumber dataset mendefinisikan fitur sebagai rasio link internal pada tag Link; rasio internal rendah lebih berbahaya. |
| F16 | SFH / Server Form Handler | direct | sfh | Jika sfh = 1 maka -1; jika sfh = 0 maka 1. | Ya | Kolom sfh tersedia langsung, walaupun pada dataset saat ini nilai teramati hanya 0 sehingga daya diskriminasinya perlu dicatat. |
| F17 | Submitting to Email | direct | submit_email | Jika submit_email = 1 maka -1; jika submit_email = 0 maka 1. | Ya | Kolom submit_email tersedia langsung, walaupun pada dataset saat ini nilai teramati hanya 0 sehingga daya diskriminasinya perlu dicatat. |
| F18 | Phishing Hints | direct | phish_hints | Jika phish_hints = 0 maka 1; jika phish_hints = 1 atau 2 maka 0; jika phish_hints > 2 maka -1. | Ya | Kolom phish_hints mengukur indikator kata pemancing yang dapat direproduksi dari URL dan teks HTML. |
| F19 | Redirect | direct | nb_redirection | Jika nb_redirection <= 1 maka 1; jika 2 <= nb_redirection <= 3 maka 0; jika nb_redirection >= 4 maka -1. | Ya | Jumlah redirect tersedia langsung dan dapat dikategorikan berdasarkan tingkat berlebihan. |
| F20 | On MouseOver | direct | onmouseover | Jika onmouseover = 1 maka -1; jika onmouseover = 0 maka 1. | Ya | Kolom langsung menunjukkan penggunaan event onmouseover yang relevan dengan manipulasi tampilan URL. |
| F21 | Right Click Disabled | direct | right_clic | Jika right_clic = 1 maka -1; jika right_clic = 0 maka 1. | Ya | Nama kolom dataset menggunakan right_clic dan memetakan gejala klik kanan dinonaktifkan. |
| F22 | Pop-Up Window | direct | popup_window | Jika popup_window = 1 maka -1; jika popup_window = 0 maka 1. | Ya | Kolom dataset langsung menunjukkan keberadaan pop-up window. |
| F23 | IFrame | direct | iframe | Jika iframe = 1 maka -1; jika iframe = 0 maka 1. | Ya | Kolom dataset langsung menunjukkan keberadaan iframe. |
| F24 | Age of Domain | direct | domain_age | Jika domain_age >= 180 hari maka 1; jika 0 <= domain_age < 180 hari maka -1; jika domain_age < 0 maka 0 karena informasi tidak tersedia. | Ya | Umur domain tersedia dalam hari; nilai negatif tidak dipaksa aman dan diperlakukan sebagai tidak diketahui. |
| F25 | DNS Record | direct | dns_record | Jika dns_record = 1 (domain memiliki DNS record) maka 1; jika dns_record = 0 maka -1. | Ya | Sumber dataset menyatakan DNS record yang hilang sebagai indikator phishing; mapping mempertahankan arti keberadaan record. |
| F26 | Brand in Path | direct | brand_in_path | Jika brand_in_path = 0 maka 1; jika brand_in_path = 1 maka -1. | Ya | Kolom brand_in_path dapat dihitung ulang dari path URL tanpa layanan traffic pihak ketiga. |
| F27 | Suspicious TLD | direct | suspecious_tld | Jika suspecious_tld = 0 maka 1; jika suspecious_tld = 1 maka -1. | Ya | Nama kolom dataset mempertahankan ejaan sumber dan dapat dihitung ulang dari TLD hostname. |
| F28 | Domain in Title | direct | domain_in_title | Jika domain_in_title = 1 maka 1; jika domain_in_title = 0 maka -1. | Ya | Kolom domain_in_title dapat dihitung dari title HTML dan hostname tanpa API indexing. |
| F29 | External Hyperlink Ratio | direct | ratio_extHyperlinks | Deteksi skala ratio_extHyperlinks terlebih dahulu. Jika nilai maksimum <= 1: nilai <= 0.30 maka 1, 0.30 < nilai <= 0.50 maka 0, dan nilai > 0.50 maka -1. Jika nilai maksimum > 1: nilai <= 30 maka 1, 30 < nilai <= 50 maka 0, dan nilai > 50 maka -1. | Ya | Kolom ratio_extHyperlinks tersedia langsung; dataset saat ini menggunakan skala 0 sampai 1 (nilai maksimum teramati 1.0). |
| F30 | Empty Title | direct | empty_title | Jika empty_title = 0 maka 1; jika empty_title = 1 maka -1. | Ya | Kolom empty_title dapat dihitung langsung setelah HTML berhasil diparsing. |
