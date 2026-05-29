from __future__ import annotations

import ipaddress
import re
import socket
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urljoin, urlparse

import httpx

try:
    import dns.exception
    import dns.resolver
except ImportError:  # pragma: no cover - guarded for incomplete installations
    dns = None

try:
    from bs4 import BeautifulSoup
except ImportError:  # pragma: no cover - reported as a missing optional runtime dependency
    BeautifulSoup = None


FEATURE_CODES = [f"F{number:02d}" for number in range(1, 31)]
SHORTENING_SERVICES = {
    "bit.ly",
    "tinyurl.com",
    "goo.gl",
    "t.co",
    "ow.ly",
    "is.gd",
    "buff.ly",
    "adf.ly",
    "bitly.com",
    "cutt.ly",
    "s.id",
    "rebrand.ly",
}
PATH_TLD_PATTERN = re.compile(
    r"\.(?:ac|biz|co|com|edu|gov|id|info|io|me|net|org|xyz)(?:/|$)",
    re.IGNORECASE,
)
USER_AGENT = "Mozilla/5.0 (compatible; PhishGuardExpertSystem/1.0; educational-analysis)"
PHISHING_HINTS = (
    "login",
    "verify",
    "secure",
    "account",
    "update",
    "bank",
    "password",
    "confirm",
    "billing",
    "payment",
    "wallet",
    "otp",
    "token",
    "signin",
    "sign-in",
)
BRAND_HINTS = (
    "google",
    "facebook",
    "instagram",
    "paypal",
    "apple",
    "microsoft",
    "amazon",
    "netflix",
    "bca",
    "bri",
    "bni",
    "mandiri",
    "dana",
    "ovo",
    "gopay",
    "shopee",
    "tokopedia",
)
SUSPICIOUS_TLDS = {
    "xyz",
    "top",
    "club",
    "online",
    "site",
    "live",
    "click",
    "link",
    "work",
    "zip",
    "country",
    "stream",
    "gq",
    "tk",
    "ml",
    "ga",
    "cf",
}
HTML_FEATURES = [
    "F10", "F13", "F14", "F15", "F16", "F17", "F19", "F20", "F21",
    "F22", "F23", "F28", "F29", "F30",
]
FEATURE_SOURCES = {
    "F01": "url_string",
    "F02": "url_string",
    "F03": "url_string",
    "F04": "url_string",
    "F05": "url_string",
    "F06": "url_string",
    "F07": "url_string",
    "F08": "url_string",
    "F09": "whois_or_rdap",
    "F10": "html_parsing",
    "F11": "url_string",
    "F12": "url_string",
    "F13": "html_parsing",
    "F14": "html_parsing",
    "F15": "html_parsing",
    "F16": "html_parsing",
    "F17": "html_parsing",
    "F18": "url_string+html_parsing",
    "F19": "html_parsing",
    "F20": "html_parsing",
    "F21": "html_parsing",
    "F22": "html_parsing",
    "F23": "html_parsing",
    "F24": "whois_or_rdap",
    "F25": "dns_lookup",
    "F26": "url_string",
    "F27": "url_string",
    "F28": "html_parsing",
    "F29": "html_parsing",
    "F30": "html_parsing",
}


def normalize_url(url: str) -> str:
    value = url.strip()
    if not value.startswith(("http://", "https://")):
        value = "http://" + value
    return value


def is_ip_address(hostname: str) -> bool:
    try:
        ipaddress.ip_address(hostname)
        return True
    except ValueError:
        return False


def count_subdomains(hostname: str) -> int:
    if not hostname or is_ip_address(hostname):
        return 0
    parts = hostname.removeprefix("www.").split(".")
    return max(len(parts) - 2, 0)


def has_double_slash_redirect(url: str) -> bool:
    separator = url.find("://")
    remaining = url if separator == -1 else url[separator + 3 :]
    return "//" in remaining


def has_tld_in_path(path: str) -> bool:
    return bool(PATH_TLD_PATTERN.search(path))


def _contains_hint(text: str, hint: str) -> bool:
    return bool(
        re.search(rf"(?<![a-z0-9]){re.escape(hint)}(?![a-z0-9])", text.lower())
    )


def _count_phishing_hints(text: str) -> int:
    value = text.lower()
    return sum(
        len(re.findall(rf"(?<![a-z0-9]){re.escape(hint)}(?![a-z0-9])", value))
        for hint in PHISHING_HINTS
    )


def _phishing_hint_fact(count: int) -> int:
    return 1 if count == 0 else 0 if count <= 2 else -1


def _same_host(first: str | None, second: str | None) -> bool:
    if not first or not second:
        return False
    return first.lower().removeprefix("www.") == second.lower().removeprefix("www.")


def _set_fact(
    facts: dict[str, int | None],
    status: dict[str, str],
    feature: str,
    value: int,
) -> None:
    if value not in {-1, 0, 1}:
        raise ValueError(f"{feature}: nilai fitur manual tidak valid: {value}")
    facts[feature] = value
    status[feature] = "available"


def _apply_resilient_imputation(
    facts: dict[str, int | None],
    status: dict[str, str],
    notes: list[str],
) -> list[str]:
    imputed_features: list[str] = []
    for feature in FEATURE_CODES:
        if status[feature] == "available":
            continue
        facts[feature] = 0
        status[feature] = "imputed_unknown"
        imputed_features.append(feature)

    if imputed_features:
        notes.append(
            "Resilient mode: fitur gagal diekstrak diisi 0 sebagai unknown/suspicious, "
            "bukan default aman: " + ", ".join(imputed_features) + "."
        )

    return imputed_features


def _safe_public_target(hostname: str, notes: list[str]) -> bool:
    if not hostname:
        notes.append("Fetch HTML dilewati karena hostname tidak tersedia.")
        return False
    if is_ip_address(hostname):
        address = ipaddress.ip_address(hostname)
        if not address.is_global:
            notes.append("Fetch HTML dilewati untuk alamat IP lokal/private/non-global.")
            return False
        return True
    try:
        addresses = {
            info[4][0]
            for info in socket.getaddrinfo(hostname, None, type=socket.SOCK_STREAM)
        }
    except OSError as error:
        notes.append(f"Fetch HTML dilewati karena hostname gagal di-resolve: {error}.")
        return False
    for address_text in addresses:
        if not ipaddress.ip_address(address_text).is_global:
            notes.append("Fetch HTML dilewati karena hostname mengarah ke alamat non-global.")
            return False
    return True


def _external_ratio(references: list[str], base_url: str, hostname: str) -> float | None:
    resolved = [
        urlparse(urljoin(base_url, reference)).hostname
        for reference in references
        if reference and not reference.lower().startswith(("javascript:", "mailto:", "#"))
    ]
    resolved = [host for host in resolved if host]
    if not resolved:
        return None
    external = sum(not _same_host(hostname, host) for host in resolved)
    return external / len(resolved)


def _ratio_fact(ratio: float, safe_limit: float, danger_limit: float) -> int:
    if ratio <= safe_limit:
        return 1
    if ratio <= danger_limit:
        return 0
    return -1


def _fetch_html(
    normalized_url: str,
    hostname: str,
    notes: list[str],
) -> tuple[str, str, int] | None:
    if BeautifulSoup is None:
        notes.append("HTML parsing tidak tersedia karena package beautifulsoup4 belum terpasang.")
        return None
    if not _safe_public_target(hostname, notes):
        return None
    try:
        with httpx.Client(
            follow_redirects=False,
            timeout=8.0,
            headers={"User-Agent": USER_AGENT},
        ) as client:
            current_url = normalized_url
            redirect_count = 0
            while True:
                response = client.get(current_url)
                if response.is_redirect:
                    location = response.headers.get("location")
                    if not location or redirect_count >= 3:
                        notes.append("HTML tidak tersedia karena redirect melebihi batas aman.")
                        return None
                    next_url = str(httpx.URL(current_url).join(location))
                    next_hostname = urlparse(next_url).hostname or ""
                    if not _safe_public_target(next_hostname, notes):
                        notes.append("Redirect menuju target non-publik diblokir.")
                        return None
                    current_url = next_url
                    redirect_count += 1
                    continue
                response.raise_for_status()
                break
    except (httpx.HTTPError, httpx.TooManyRedirects) as error:
        notes.append(f"HTML tidak tersedia: {error}.")
        return None
    content_type = response.headers.get("content-type", "").lower()
    if "html" not in content_type:
        notes.append("Response URL bukan dokumen HTML sehingga fitur halaman tidak diekstrak.")
        return None
    return response.text[:2_000_000], str(response.url), redirect_count


def _apply_html_features(
    html: str,
    page_url: str,
    hostname: str,
    redirect_count: int,
    facts: dict[str, int | None],
    status: dict[str, str],
    notes: list[str],
    url_hint_count: int,
) -> None:
    soup = BeautifulSoup(html, "html.parser")
    text = html.lower()
    visible_text = soup.get_text(" ", strip=True)
    _set_fact(
        facts,
        status,
        "F18",
        _phishing_hint_fact(url_hint_count + _count_phishing_hints(visible_text)),
    )

    icon_refs = [
        link.get("href", "")
        for link in soup.find_all("link")
        if "icon" in " ".join(link.get("rel", [])).lower()
    ]
    external_icon = any(
        not _same_host(hostname, urlparse(urljoin(page_url, ref)).hostname)
        for ref in icon_refs
        if ref
    )
    _set_fact(facts, status, "F10", -1 if external_icon else 1)

    media_refs = [
        element.get("src", "")
        for element in soup.find_all(["img", "audio", "video", "source"])
        if element.get("src")
    ]
    media_ratio = _external_ratio(media_refs, page_url, hostname)
    if media_ratio is None:
        media_ratio = 0.0
        notes.append("F13 diukur sebagai rasio 0 karena HTML tersedia tanpa resource media terukur.")
    _set_fact(facts, status, "F13", _ratio_fact(media_ratio, 0.22, 0.61))

    anchor_refs = [anchor.get("href", "") for anchor in soup.find_all("a") if anchor.get("href")]
    if anchor_refs:
        unsafe_anchors = sum(
            href.strip().lower().startswith(("#", "javascript:", "mailto:"))
            for href in anchor_refs
        )
        unsafe_ratio = unsafe_anchors / len(anchor_refs)
        _set_fact(
            facts,
            status,
            "F14",
            1 if unsafe_ratio < 0.31 else 0 if unsafe_ratio <= 0.67 else -1,
        )
        hyperlink_ratio = _external_ratio(anchor_refs, page_url, hostname)
        _set_fact(
            facts,
            status,
            "F29",
            _ratio_fact(hyperlink_ratio if hyperlink_ratio is not None else 0.0, 0.30, 0.50),
        )
    else:
        _set_fact(facts, status, "F14", 1)
        _set_fact(facts, status, "F29", 1)
        notes.append("F14 dan F29 diukur sebagai rasio 0 karena HTML tersedia tanpa anchor.")

    tag_refs = [
        element.get("href") or element.get("src")
        for element in soup.find_all(["link", "script"])
        if element.get("href") or element.get("src")
    ]
    for meta in soup.find_all("meta"):
        match = re.search(r"url\s*=\s*([^;]+)", meta.get("content", ""), re.IGNORECASE)
        if match:
            tag_refs.append(match.group(1).strip("'\" "))
    external_tag_ratio = _external_ratio(tag_refs, page_url, hostname)
    internal_ratio = 0.0 if external_tag_ratio is None else 1 - external_tag_ratio
    if external_tag_ratio is None:
        notes.append("F15 diukur sebagai rasio 0 karena HTML tersedia tanpa tag resource terukur.")
    _set_fact(
        facts,
        status,
        "F15",
        1 if internal_ratio > 0.81 else 0 if internal_ratio >= 0.17 else -1,
    )

    forms = soup.find_all("form")
    suspicious_form = False
    submits_email = False
    for form in forms:
        action = (form.get("action") or "").strip()
        action_lower = action.lower()
        submits_email = submits_email or action_lower.startswith("mailto:")
        if not action or action_lower in {"about:blank", "#"} or action_lower.startswith("mailto:"):
            suspicious_form = True
        else:
            action_host = urlparse(urljoin(page_url, action)).hostname
            suspicious_form = suspicious_form or not _same_host(hostname, action_host)
    _set_fact(facts, status, "F16", -1 if suspicious_form else 1)
    _set_fact(facts, status, "F17", -1 if submits_email else 1)
    _set_fact(facts, status, "F19", 1 if redirect_count <= 1 else 0 if redirect_count <= 3 else -1)
    _set_fact(
        facts,
        status,
        "F20",
        -1 if "onmouseover" in text and ("window.status" in text or "status=" in text) else 1,
    )
    _set_fact(
        facts,
        status,
        "F21",
        -1 if "oncontextmenu" in text or ("contextmenu" in text and "preventdefault" in text) else 1,
    )
    _set_fact(facts, status, "F22", -1 if re.search(r"\bwindow\.open\s*\(", text) else 1)
    _set_fact(facts, status, "F23", -1 if soup.find("iframe") else 1)
    title_text = soup.title.get_text(" ", strip=True) if soup.title else ""
    _set_fact(facts, status, "F30", -1 if not title_text else 1)
    domain = _registrable_domain(hostname).lower()
    domain_label = domain.split(".", 1)[0]
    title_lower = title_text.lower()
    title_matches_domain = bool(title_text) and (
        domain in title_lower or domain_label in title_lower
    )
    _set_fact(facts, status, "F28", 1 if title_matches_domain else -1)


def _apply_dns_feature(
    hostname: str,
    facts: dict[str, int | None],
    status: dict[str, str],
    notes: list[str],
) -> None:
    if not hostname or is_ip_address(hostname):
        notes.append("F25 DNS Record tidak tersedia untuk hostname kosong atau alamat IP.")
        return
    if dns is None:
        notes.append("F25 DNS Record tidak tersedia karena dnspython belum terpasang.")
        return
    try:
        dns.resolver.resolve(hostname, "A", lifetime=3.0)
        _set_fact(facts, status, "F25", 1)
    except dns.resolver.NXDOMAIN:
        _set_fact(facts, status, "F25", -1)
    except (dns.resolver.NoAnswer, dns.resolver.NoNameservers, dns.exception.Timeout) as error:
        notes.append(f"F25 DNS Record tidak tersedia: {error}.")


def _registrable_domain(hostname: str) -> str:
    parts = hostname.removeprefix("www.").split(".")
    if len(parts) >= 3 and ".".join(parts[-2:]) in {"co.id", "ac.id", "co.uk"}:
        return ".".join(parts[-3:])
    return ".".join(parts[-2:]) if len(parts) >= 2 else hostname


def _parse_rdap_date(events: list[dict[str, Any]], actions: set[str]) -> datetime | None:
    for event in events:
        if str(event.get("eventAction", "")).lower() in actions:
            value = event.get("eventDate")
            if value:
                return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    return None


def _apply_rdap_features(
    hostname: str,
    facts: dict[str, int | None],
    status: dict[str, str],
    notes: list[str],
) -> None:
    if not hostname or is_ip_address(hostname):
        notes.append("F09 dan F24 tidak tersedia untuk hostname kosong atau alamat IP.")
        return
    domain = _registrable_domain(hostname)
    try:
        response = httpx.get(
            f"https://rdap.org/domain/{domain}",
            timeout=5.0,
            follow_redirects=True,
            headers={"User-Agent": USER_AGENT},
        )
        response.raise_for_status()
        events = response.json().get("events", [])
    except (httpx.HTTPError, ValueError) as error:
        notes.append(f"Data RDAP untuk F09/F24 tidak tersedia: {error}.")
        return
    registration = _parse_rdap_date(events, {"registration"})
    expiration = _parse_rdap_date(events, {"expiration", "expiry"})
    if registration is not None:
        age_days = (datetime.now(timezone.utc) - registration).days
        _set_fact(facts, status, "F24", 1 if age_days >= 180 else -1)
    else:
        notes.append("F24 tidak tersedia karena tanggal registrasi RDAP tidak ditemukan.")
    if registration is not None and expiration is not None:
        registration_days = (expiration - registration).days
        _set_fact(facts, status, "F09", 1 if registration_days > 365 else -1)
    else:
        notes.append("F09 tidak tersedia karena rentang registrasi RDAP tidak lengkap.")


def extract_manual_features(url: str, enable_network: bool = True) -> dict[str, Any]:
    normalized_url = normalize_url(url)
    parsed = urlparse(normalized_url)
    hostname = (parsed.hostname or "").lower()
    facts: dict[str, int | None] = {feature: None for feature in FEATURE_CODES}
    feature_status = {feature: "not_available" for feature in FEATURE_CODES}
    notes: list[str] = []

    _set_fact(facts, feature_status, "F01", -1 if is_ip_address(hostname) else 1)
    length = len(normalized_url)
    _set_fact(facts, feature_status, "F02", 1 if length < 54 else 0 if length <= 75 else -1)
    _set_fact(facts, feature_status, "F03", -1 if hostname in SHORTENING_SERVICES else 1)
    _set_fact(facts, feature_status, "F04", -1 if "@" in normalized_url else 1)
    _set_fact(facts, feature_status, "F05", -1 if has_double_slash_redirect(normalized_url) else 1)
    _set_fact(facts, feature_status, "F06", -1 if "-" in hostname else 1)
    subdomains = count_subdomains(hostname)
    _set_fact(facts, feature_status, "F07", 1 if subdomains <= 1 else 0 if subdomains == 2 else -1)
    _set_fact(facts, feature_status, "F08", -1 if has_tld_in_path(parsed.path) else 1)
    try:
        port = parsed.port
        _set_fact(facts, feature_status, "F11", -1 if port and port not in {80, 443} else 1)
    except ValueError:
        notes.append("F11 Port tidak tersedia karena format port URL tidak valid.")
    without_scheme = normalized_url.split("://", 1)[-1].lower()
    _set_fact(facts, feature_status, "F12", -1 if "https" in without_scheme else 1)
    url_hint_count = _count_phishing_hints(normalized_url)
    _set_fact(facts, feature_status, "F18", _phishing_hint_fact(url_hint_count))
    path_lower = parsed.path.lower()
    brand_in_path = any(_contains_hint(path_lower, brand) for brand in BRAND_HINTS)
    _set_fact(facts, feature_status, "F26", -1 if brand_in_path else 1)
    if hostname and not is_ip_address(hostname) and "." in hostname:
        tld = hostname.rstrip(".").rsplit(".", 1)[-1]
        _set_fact(facts, feature_status, "F27", -1 if tld in SUSPICIOUS_TLDS else 1)
    else:
        notes.append("F27 Suspicious TLD tidak tersedia karena hostname tidak memiliki TLD.")

    if enable_network:
        html_result = _fetch_html(normalized_url, hostname, notes)
        if html_result is not None:
            _apply_html_features(
                html_result[0],
                html_result[1],
                hostname,
                html_result[2],
                facts,
                feature_status,
                notes,
                url_hint_count,
            )
        _apply_dns_feature(hostname, facts, feature_status, notes)
        _apply_rdap_features(hostname, facts, feature_status, notes)
    else:
        notes.append("Ekstraksi jaringan dimatikan; fitur HTML, DNS, redirect, dan RDAP tidak dievaluasi.")

    imputed_features = _apply_resilient_imputation(facts, feature_status, notes)
    available_features = [
        feature for feature in FEATURE_CODES if feature_status[feature] == "available"
    ]
    imputed_count = len(imputed_features)
    feature_quality = {
        "total_features": len(FEATURE_CODES),
        "available": len(available_features),
        "imputed_unknown": imputed_count,
        "is_complete": True,
        "is_resilient_mode": True,
        "imputed_features": imputed_features,
    }
    return {
        "original_url": url,
        "normalized_url": normalized_url,
        "hostname": hostname,
        "facts": facts,
        "feature_status": feature_status,
        "feature_sources": FEATURE_SOURCES,
        "evaluated_features": available_features,
        "feature_quality": feature_quality,
        "feature_completeness": {
            "total_required": len(FEATURE_CODES),
            "available": len(available_features),
            "not_available": 0,
            "imputed_unknown": imputed_count,
            "is_complete": True,
            "missing_features": [],
            "imputed_features": imputed_features,
            "is_resilient_mode": True,
        },
        "notes": notes,
        "note": " ".join(notes),
    }
