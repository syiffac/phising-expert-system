import argparse
import os
import sys
from collections import defaultdict
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app.core.manual_feature_extractor import extract_manual_features  # noqa: E402


URLS = [
    "https://www.google.com",
    "https://example.com",
    "http://example.com/login.com/verify",
    "https://example.com/https-login",
    "http://secure-login-bank@verify-update.com",
    "http://login-bank.xyz/paypal/verify-account",
    "https://example.com/paypal/login",
]

RECOMMENDATIONS = {
    "replacement": (
        "Web Traffic, Page Rank, Google Index, dan Statistical Report sudah diganti "
        "dengan fitur URL/HTML yang dapat diekstrak langsung."
    ),
    "network": (
        "F09/F24 tetap membutuhkan RDAP dan F25 membutuhkan DNS; kelengkapan penuh "
        "bergantung pada respons sumber jaringan tersebut."
    ),
}
DISPLAY_FEATURES = ["F13", "F15", "F18", "F26", "F27", "F28", "F30"]


def environment_network_enabled() -> bool:
    return os.getenv("ENABLE_NETWORK", "").strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }


def group_features_by_source(result: dict, availability: str) -> dict[str, list[str]]:
    grouped: dict[str, list[str]] = defaultdict(list)
    for feature, status in result["feature_status"].items():
        if status == availability:
            grouped[result["feature_sources"][feature]].append(feature)
    return dict(grouped)


def print_group(title: str, grouped: dict[str, list[str]]) -> None:
    print(f"- {title}:")
    if not grouped:
        print("  - tidak ada")
        return
    for source, features in grouped.items():
        print(f"  - {source}: {', '.join(features)}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Uji Full Feature Extractor v1 pada URL aman/dummy."
    )
    parser.add_argument(
        "--network",
        action="store_true",
        help="Aktifkan fetch HTML, DNS, dan RDAP untuk domain publik.",
    )
    args = parser.parse_args()
    network_enabled = args.network or environment_network_enabled()

    print(f"Mode jaringan: {'aktif' if network_enabled else 'nonaktif'}")
    print(
        "Sumber mode: "
        + ("--network" if args.network else "ENABLE_NETWORK=true")
        if network_enabled
        else "Sumber mode: default aman tanpa fetch jaringan"
    )
    for url in URLS:
        result = extract_manual_features(url, enable_network=network_enabled)
        facts = result["facts"]
        available_by_source = group_features_by_source(result, "available")
        imputed_by_source = group_features_by_source(result, "imputed_unknown")
        triggered_sample_facts = {
            code: value
            for code, value in facts.items()
            if value in {-1, 0}
        }
        print("\nURL:", url)
        print("- normalized_url:", result["normalized_url"])
        print("- hostname:", result["hostname"])
        print("- available feature count:", result["feature_completeness"]["available"])
        print("- imputed_unknown count:", result["feature_quality"]["imputed_unknown"])
        print("- missing features:", result["feature_completeness"]["missing_features"])
        print("- imputed features:", result["feature_quality"]["imputed_features"])
        print("- F08 value:", facts["F08"])
        print("- F12 value:", facts["F12"])
        for feature in DISPLAY_FEATURES:
            print(
                f"- {feature}: value={facts[feature]}, "
                f"status={result['feature_status'][feature]}, "
                f"source={result['feature_sources'][feature]}"
            )
        print("- triggered sample facts:", triggered_sample_facts)
        print_group("fitur berhasil menurut sumber", available_by_source)
        print_group("fitur imputed_unknown menurut sumber", imputed_by_source)
        if result["notes"]:
            print("- catatan ekstraksi:")
            for note in result["notes"]:
                print("  -", note)

    print("\nRekomendasi operasional agar manual input dapat menjadi full hybrid:")
    for feature, recommendation in RECOMMENDATIONS.items():
        print(f"- {feature}: {recommendation}")


if __name__ == "__main__":
    main()
