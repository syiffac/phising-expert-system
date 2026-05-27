from urllib.parse import urlparse
import ipaddress
import re


SHORTENING_SERVICES = {
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly",
    "is.gd", "buff.ly", "adf.ly", "bitly.com", "cutt.ly",
    "s.id", "rebrand.ly"
}

PATH_TLD_PATTERN = re.compile(
    r"\.(?:com|net|org|id|co|biz|info|io|gov|edu|ac|me|xyz)(?:/|$)",
    re.IGNORECASE,
)


def normalize_url(url: str) -> str:
    url = url.strip()

    if not url.startswith(("http://", "https://")):
        url = "http://" + url

    return url


def is_ip_address(hostname: str) -> bool:
    try:
        ipaddress.ip_address(hostname)
        return True
    except ValueError:
        return False


def count_subdomains(hostname: str) -> int:
    if not hostname or is_ip_address(hostname):
        return 0

    hostname = hostname.lower()

    if hostname.startswith("www."):
        hostname = hostname[4:]

    parts = hostname.split(".")

    if len(parts) <= 2:
        return 0

    return len(parts) - 2


def has_double_slash_redirect(url: str) -> bool:
    protocol_index = url.find("://")

    if protocol_index == -1:
        return "//" in url

    after_protocol = url[protocol_index + 3:]
    return "//" in after_protocol


def has_tld_in_path(path: str) -> bool:
    return bool(PATH_TLD_PATTERN.search(path))


def extract_features_from_url(url: str) -> dict:
    normalized_url = normalize_url(url)
    parsed = urlparse(normalized_url)
    hostname = parsed.hostname or ""
    hostname = hostname.lower()

    facts = {f"F{i:02d}": 1 for i in range(1, 31)}

    # F01 - Have IP Address
    facts["F01"] = -1 if is_ip_address(hostname) else 1

    # F02 - URL Length
    url_length = len(normalized_url)
    if url_length < 54:
        facts["F02"] = 1
    elif 54 <= url_length <= 75:
        facts["F02"] = 0
    else:
        facts["F02"] = -1

    # F03 - Shortening Service
    facts["F03"] = -1 if hostname in SHORTENING_SERVICES else 1

    # F04 - Having @ Symbol
    facts["F04"] = -1 if "@" in normalized_url else 1

    # F05 - Double Slash Redirecting
    facts["F05"] = -1 if has_double_slash_redirect(normalized_url) else 1

    # F06 - Prefix-Suffix
    facts["F06"] = -1 if "-" in hostname else 1

    # F07 - Having Subdomain
    subdomain_count = count_subdomains(hostname)
    if subdomain_count <= 1:
        facts["F07"] = 1
    elif subdomain_count == 2:
        facts["F07"] = 0
    else:
        facts["F07"] = -1

    # F08 - TLD in Path
    facts["F08"] = -1 if has_tld_in_path(parsed.path) else 1

    # F12 - HTTPS Token
    url_without_scheme = normalized_url.replace("https://", "").replace("http://", "")
    facts["F12"] = -1 if "https" in url_without_scheme.lower() else 1

    # F29 - External Hyperlink Ratio requires fetched HTML, not only a URL.
    facts["F29"] = None

    return {
        "original_url": url,
        "normalized_url": normalized_url,
        "hostname": hostname,
        "facts": facts,
        "evaluated_features": ["F01", "F02", "F03", "F04", "F05", "F06", "F07", "F08", "F12"],
        "note": "F29 External Hyperlink Ratio tidak tersedia pada mode URL manual karena halaman belum diambil dan diparsing. Fitur eksternal lain seperti umur domain, DNS record, Google Index, Page Rank, dan Statistical Report juga belum dicek secara real-time."
    }
