import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
KB_DIR = BASE_DIR / "app" / "knowledge_base"
KB_DIR.mkdir(parents=True, exist_ok=True)

features = [
    {"code": "F01", "name": "Have IP Address", "description": "URL menggunakan IP address sebagai hostname.", "source": "Aljofey et al. (2022); Suwarno & Hardjianto (2024)"},
    {"code": "F02", "name": "URL Length", "description": "Panjang URL berada pada kategori tidak normal atau terlalu panjang.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F03", "name": "Shortening Service", "description": "URL menggunakan layanan pemendek URL.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F04", "name": "Having @ Symbol", "description": "URL mengandung simbol @.", "source": "Aljofey et al. (2022); Suwarno & Hardjianto (2024)"},
    {"code": "F05", "name": "Double Slash Redirecting", "description": "URL memiliki double slash tambahan yang mengarah pada indikasi redirect.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F06", "name": "Prefix-Suffix", "description": "Domain menggunakan tanda hubung atau pola prefix-suffix yang tidak umum.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F07", "name": "Having Subdomain", "description": "Jumlah subdomain berlebihan.", "source": "Aljofey et al. (2022); Suwarno & Hardjianto (2024)"},
    {"code": "F08", "name": "SSL Final State", "description": "Status SSL atau HTTPS tidak valid atau tidak meyakinkan.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F09", "name": "Domain Registration Length", "description": "Masa registrasi domain relatif pendek.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F10", "name": "Favicon", "description": "Favicon berasal dari domain berbeda.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F11", "name": "Port", "description": "Website menggunakan port yang tidak umum atau mencurigakan.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F12", "name": "HTTPS Token", "description": "Terdapat token HTTPS palsu pada bagian domain atau path URL.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F13", "name": "Request URL", "description": "Banyak resource halaman berasal dari domain eksternal.", "source": "Aljofey et al. (2022); Suwarno & Hardjianto (2024)"},
    {"code": "F14", "name": "URL of Anchor", "description": "Anchor pada halaman banyak mengarah ke domain berbeda.", "source": "Aljofey et al. (2022); Suwarno & Hardjianto (2024)"},
    {"code": "F15", "name": "Links in Tags", "description": "Tag HTML memiliki banyak link eksternal yang mencurigakan.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F16", "name": "SFH / Server Form Handler", "description": "Form action kosong, tidak jelas, atau mengarah ke domain berbeda.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F17", "name": "Submitting to Email", "description": "Form mengirim data melalui email.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F18", "name": "Abnormal URL", "description": "Struktur URL tidak normal atau tidak sesuai dengan identitas domain.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F19", "name": "Redirect", "description": "Website memiliki jumlah redirect berlebihan.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F20", "name": "On MouseOver", "description": "Terdapat manipulasi link ketika pointer diarahkan ke elemen tertentu.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F21", "name": "Right Click Disabled", "description": "Klik kanan dinonaktifkan pada halaman website.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F22", "name": "Pop-Up Window", "description": "Website menampilkan pop-up yang mencurigakan.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F23", "name": "IFrame", "description": "Website menggunakan iframe tersembunyi atau mencurigakan.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F24", "name": "Age of Domain", "description": "Umur domain terlalu baru.", "source": "Aljofey et al. (2022); Suwarno & Hardjianto (2024)"},
    {"code": "F25", "name": "DNS Record", "description": "DNS record tidak tersedia atau tidak valid.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F26", "name": "Web Traffic", "description": "Traffic website rendah atau tidak tersedia.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F27", "name": "Page Rank", "description": "Page rank rendah atau tidak tersedia.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F28", "name": "Google Index", "description": "Website tidak terindeks Google.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F29", "name": "Links Pointing to Page", "description": "Jumlah backlink menuju halaman rendah.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "F30", "name": "Statistical Report", "description": "Website masuk laporan atau blacklist phishing.", "source": "Suwarno & Hardjianto (2024)"},
]

rules = [
    {"code": "R01", "conditions": [{"feature": "F01", "operator": "==", "value": -1}], "conclusion": "phishing", "severity": "high", "explanation": "URL menggunakan IP address sebagai hostname sehingga identitas domain asli sulit diverifikasi.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "R02", "conditions": [{"feature": "F02", "operator": "==", "value": -1}], "conclusion": "suspicious", "severity": "medium", "explanation": "URL terlalu panjang sehingga berpotensi digunakan untuk menyamarkan alamat asli.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "R03", "conditions": [{"feature": "F03", "operator": "==", "value": -1}], "conclusion": "suspicious", "severity": "medium", "explanation": "URL menggunakan layanan pemendek URL yang dapat menyembunyikan alamat tujuan sebenarnya.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "R04", "conditions": [{"feature": "F04", "operator": "==", "value": -1}], "conclusion": "phishing", "severity": "high", "explanation": "URL mengandung simbol @ yang sering digunakan untuk mengelabui pembacaan alamat oleh pengguna.", "source": "Aljofey et al. (2022); Suwarno & Hardjianto (2024)"},
    {"code": "R05", "conditions": [{"feature": "F05", "operator": "==", "value": -1}], "conclusion": "phishing", "severity": "high", "explanation": "Terdapat double slash tambahan yang dapat mengindikasikan redirect mencurigakan.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "R06", "conditions": [{"feature": "F06", "operator": "==", "value": -1}], "conclusion": "suspicious", "severity": "medium", "explanation": "Domain menggunakan tanda hubung yang sering dimanfaatkan untuk meniru nama domain resmi.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "R07", "conditions": [{"feature": "F07", "operator": "==", "value": -1}], "conclusion": "phishing", "severity": "high", "explanation": "Jumlah subdomain berlebihan dapat digunakan untuk menyamarkan domain utama.", "source": "Aljofey et al. (2022); Suwarno & Hardjianto (2024)"},
    {"code": "R08", "conditions": [{"feature": "F08", "operator": "==", "value": -1}], "conclusion": "phishing", "severity": "high", "explanation": "SSL tidak valid atau tidak tersedia sehingga keamanan website tidak dapat dipercaya.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "R09", "conditions": [{"feature": "F09", "operator": "==", "value": -1}], "conclusion": "suspicious", "severity": "medium", "explanation": "Masa registrasi domain pendek sehingga kredibilitas domain perlu diperiksa lebih lanjut.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "R10", "conditions": [{"feature": "F10", "operator": "==", "value": -1}], "conclusion": "suspicious", "severity": "medium", "explanation": "Favicon berasal dari domain berbeda, yang dapat menunjukkan peniruan elemen visual website lain.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "R11", "conditions": [{"feature": "F12", "operator": "==", "value": -1}], "conclusion": "phishing", "severity": "high", "explanation": "Token HTTPS muncul pada bagian domain atau path, bukan sebagai protokol yang valid.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "R12", "conditions": [{"feature": "F13", "operator": "==", "value": -1}], "conclusion": "phishing", "severity": "high", "explanation": "Resource halaman terlalu banyak berasal dari domain eksternal.", "source": "Aljofey et al. (2022); Suwarno & Hardjianto (2024)"},
    {"code": "R13", "conditions": [{"feature": "F14", "operator": "==", "value": -1}], "conclusion": "phishing", "severity": "high", "explanation": "Mayoritas anchor mengarah ke domain berbeda sehingga struktur halaman terlihat tidak wajar.", "source": "Aljofey et al. (2022); Suwarno & Hardjianto (2024)"},
    {"code": "R14", "conditions": [{"feature": "F16", "operator": "==", "value": -1}], "conclusion": "phishing", "severity": "high", "explanation": "Form action kosong atau mengarah ke domain berbeda, sehingga berisiko digunakan untuk mengambil data pengguna.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "R15", "conditions": [{"feature": "F17", "operator": "==", "value": -1}], "conclusion": "phishing", "severity": "high", "explanation": "Form mengirim data melalui email, yang dapat menjadi indikasi pencurian data.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "R16", "conditions": [{"feature": "F21", "operator": "==", "value": -1}], "conclusion": "suspicious", "severity": "medium", "explanation": "Klik kanan dinonaktifkan sehingga pengguna lebih sulit memeriksa elemen halaman.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "R17", "conditions": [{"feature": "F24", "operator": "==", "value": -1}], "conclusion": "phishing", "severity": "high", "explanation": "Umur domain terlalu baru sehingga tingkat kepercayaannya rendah.", "source": "Aljofey et al. (2022); Suwarno & Hardjianto (2024)"},
    {"code": "R18", "conditions": [{"feature": "F25", "operator": "==", "value": -1}], "conclusion": "phishing", "severity": "high", "explanation": "DNS record tidak tersedia atau tidak valid.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "R19", "conditions": [{"feature": "F28", "operator": "==", "value": -1}], "conclusion": "suspicious", "severity": "medium", "explanation": "Website tidak terindeks Google sehingga perlu diperiksa lebih lanjut.", "source": "Suwarno & Hardjianto (2024)"},
    {"code": "R20", "conditions": [{"feature": "F30", "operator": "==", "value": -1}], "conclusion": "phishing", "severity": "high", "explanation": "Website masuk laporan atau blacklist phishing.", "source": "Suwarno & Hardjianto (2024)"},
]

with open(KB_DIR / "features.json", "w", encoding="utf-8") as f:
    json.dump(features, f, indent=2, ensure_ascii=False)

with open(KB_DIR / "rules.json", "w", encoding="utf-8") as f:
    json.dump(rules, f, indent=2, ensure_ascii=False)

print("Knowledge base berhasil dibuat.")
print(f"Features: {len(features)} data")
print(f"Rules: {len(rules)} data")