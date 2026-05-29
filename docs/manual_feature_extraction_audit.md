# Audit Ekstraksi Fitur Manual F01-F30

## Tujuan

Audit ini memeriksa apakah setiap gejala knowledge base dapat dibentuk dari URL manual secara sah. Nilai aman hanya diberikan bila kondisi benar-benar dapat diamati; kegagalan fetch, DNS, atau RDAP menghasilkan `None` dengan status `not_available`.

## Sumber dan Batasan

- `url_string`: dihitung langsung dari input URL.
- `html_parsing`: membutuhkan fetch halaman publik dengan timeout maksimal 8 detik.
- `dns_lookup`: membutuhkan lookup DNS terbatas.
- `whois_or_rdap`: membutuhkan metadata registrasi melalui RDAP.

Extractor memblokir fetch target lokal, private, atau non-global. Penggantian fitur F18/F26/F27/F28/F30 menghapus kebutuhan API traffic, Page Rank, Google Index, dan blacklist dari set fitur final manual.

## Tabel Audit

| Kode | Nama Fitur | Sumber Ekstraksi | Bisa Manual? | Metode Ekstraksi | Kesulitan | Catatan |
|---|---|---|---|---|---|---|
| F01 | Have IP Address | url_string | Ya | Parse hostname dan uji alamat IP. | Rendah | Tersedia tanpa jaringan. |
| F02 | URL Length | url_string | Ya | Hitung panjang URL dan terapkan threshold. | Rendah | Tersedia tanpa jaringan. |
| F03 | Shortening Service | url_string | Ya | Cocokkan hostname dengan daftar pemendek. | Rendah | Daftar perlu dirawat. |
| F04 | Having @ Symbol | url_string | Ya | Cari karakter `@`. | Rendah | Tersedia tanpa jaringan. |
| F05 | Double Slash Redirecting | url_string | Ya | Cari `//` setelah skema. | Rendah | Tersedia tanpa jaringan. |
| F06 | Prefix-Suffix | url_string | Ya | Cari tanda hubung pada hostname. | Rendah | Tersedia tanpa jaringan. |
| F07 | Having Subdomain | url_string | Ya | Hitung bagian subdomain. | Rendah | V1 belum memakai public suffix list. |
| F08 | TLD in Path | url_string | Ya | Regex pola TLD pada path. | Rendah | Selaras dengan `tld_in_path`. |
| F09 | Domain Registration Length | whois_or_rdap | Kondisional | Baca tanggal registrasi/kedaluwarsa RDAP. | Sedang | Tidak tersedia bila RDAP gagal atau tidak lengkap. |
| F10 | Favicon | html_parsing | Kondisional | Bandingkan host favicon dengan host halaman. | Sedang | Perlu HTML berhasil di-fetch. |
| F11 | Port | url_string | Ya | Parse port eksplisit. | Rendah | Port selain 80/443 berbahaya. |
| F12 | HTTPS Token | url_string | Ya | Cari `https` setelah skema dihapus. | Rendah | Selaras dengan `https_token`. |
| F13 | Request URL | html_parsing | Kondisional | Hitung rasio media/resource eksternal. | Sedang | Bila HTML tersedia tanpa media, rasio terukur `0` dan fitur tetap available. |
| F14 | URL of Anchor | html_parsing | Kondisional | Hitung rasio anchor tidak aman. | Sedang | Tanpa anchor setelah fetch sukses berarti rasio `0`. |
| F15 | Links in Tags | html_parsing | Kondisional | Hitung rasio link internal pada tag resource. | Sedang | Bila HTML tersedia tanpa tag terukur, rasio `0` dan fitur tetap available. |
| F16 | SFH / Server Form Handler | html_parsing | Kondisional | Periksa `form action`. | Sedang | Aman hanya setelah HTML diperiksa. |
| F17 | Submitting to Email | html_parsing | Kondisional | Periksa `mailto:` pada form. | Sedang | Aman hanya setelah HTML diperiksa. |
| F18 | Phishing Hints | url_string + html_parsing | Ya | Hitung keyword pemancing pada URL dan teks halaman. | Rendah | URL selalu dapat dinilai; HTML menambah bukti bila tersedia. |
| F19 | Redirect | html_parsing | Kondisional | Hitung redirect HTTP saat fetch. | Sedang | Redirect dibatasi dan target diperiksa. |
| F20 | On MouseOver | html_parsing | Kondisional | Cari manipulasi status melalui event. | Sedang | Deteksi statis ringan. |
| F21 | Right Click Disabled | html_parsing | Kondisional | Cari pemblokiran context menu. | Sedang | Tersedia setelah HTML diambil. |
| F22 | Pop-Up Window | html_parsing | Kondisional | Cari `window.open(...)`. | Sedang | Deteksi statis ringan. |
| F23 | IFrame | html_parsing | Kondisional | Deteksi `<iframe>`. | Rendah | Tidak menilai visibilitas lanjutan. |
| F24 | Age of Domain | whois_or_rdap | Kondisional | Hitung umur dari registrasi RDAP. | Sedang | Tidak tersedia bila event tidak ada. |
| F25 | DNS Record | dns_lookup | Kondisional | Resolve DNS A record dengan timeout. | Sedang | NXDOMAIN berbahaya; timeout tetap tidak tersedia. |
| F26 | Brand in Path | url_string | Ya | Cari brand hint hanya pada path URL. | Rendah | Menggantikan Web Traffic. |
| F27 | Suspicious TLD | url_string | Ya | Cocokkan TLD dengan daftar suspicious TLD. | Rendah | Menggantikan Page Rank. |
| F28 | Domain in Title | html_parsing | Kondisional | Bandingkan domain utama dengan title HTML. | Sedang | Menggantikan Google Index. |
| F29 | External Hyperlink Ratio | html_parsing | Kondisional | Hitung rasio anchor menuju host lain. | Sedang | Tanpa anchor setelah fetch sukses berarti rasio `0`. |
| F30 | Empty Title | html_parsing | Kondisional | Uji keberadaan dan isi tag title. | Rendah | Menggantikan Statistical Report. |

## Keputusan Revisi

F18 sekarang memakai `phish_hints`, F26 memakai `brand_in_path`, F27 memakai `suspecious_tld`, F28 memakai `domain_in_title`, dan F30 memakai `empty_title`. Lima fitur ini tersedia dalam dataset Hannousse & Yahiouche dan dapat dihitung ulang dari URL atau HTML.

Web Traffic, Page Rank, Google Index, dan Statistical Report tidak lagi menjadi fitur final karena memerlukan layanan pihak ketiga yang tidak stabil untuk input manual. Pendekatan URL, HTML, hyperlink, dan textual content ini sejalan dengan Aljofey et al. (Scientific Reports, 2022) serta pendekatan URL/text dari Shaukat et al. (Sensors, 2023).

## Batas Kelengkapan Manual

Semua definisi F01-F30 kini memiliki metode ekstraksi manual yang valid. Namun satu URL baru menjadi lengkap bila HTML berhasil di-fetch, DNS berhasil diperiksa, dan RDAP memberi data F09/F24 yang diperlukan. Kegagalan sumber jaringan tetap ditandai `not_available`, bukan diubah menjadi nilai aman.

## Referensi

- Hannousse & Yahiouche, *Towards Benchmark Datasets for Machine Learning Based Website Phishing Detection*: https://arxiv.org/abs/2010.12847
- Aljofey et al., *An effective detection approach for phishing websites using URL and HTML features*, Scientific Reports (2022): https://pubmed.ncbi.nlm.nih.gov/35614133/
- Shaukat et al., *BERT-Based Approaches to Identifying Malicious URLs*, Sensors (2023): https://doi.org/10.3390/s23208499
