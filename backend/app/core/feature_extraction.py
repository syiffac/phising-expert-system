from app.core.manual_feature_extractor import extract_manual_features


def extract_features_from_url(url: str) -> dict:
    """Compatibility wrapper for the existing manual detection endpoint."""
    return extract_manual_features(url)
