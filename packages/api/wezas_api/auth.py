import hashlib
import hmac
from typing import Optional
from fastapi import Header, HTTPException, status
from wezas_api.config import settings


def hash_api_key(key: str) -> str:
    """Hash une clé API avec le sel configuré (SHA-256)."""
    return hmac.new(
        settings.api_secret_salt.encode(),
        key.encode(),
        hashlib.sha256,
    ).hexdigest()


async def verify_api_key(x_api_key: Optional[str] = Header(default=None)) -> Optional[str]:
    """
    Vérifie la clé API optionnelle.
    En l'absence de clé, l'accès public (avec rate limiting restrictif) est autorisé.
    """
    if x_api_key is None:
        return None

    if not (x_api_key.startswith("wz_live_") or x_api_key.startswith("wz_test_")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_API_KEY_FORMAT", "message": "Format de clé API invalide"},
        )

    return x_api_key
