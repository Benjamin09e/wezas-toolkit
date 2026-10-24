import hashlib
import hmac
from collections.abc import Callable

from fastapi import Header, HTTPException, status

from wezas_api.config import settings
from wezas_api.keys import ApiKeyRecord, ScopeType, api_key_repo


def hash_api_key(key: str) -> str:
    """Hash une clé API avec le sel configuré (SHA-256)."""
    return hmac.new(
        settings.api_secret_salt.encode(),
        key.encode(),
        hashlib.sha256,
    ).hexdigest()


async def verify_api_key(x_api_key: str | None = Header(default=None)) -> str | None:
    """
    Vérifie la clé API optionnelle.
    En l'absence de clé, l'accès public (avec rate limiting restrictif) est autorisé.
    Si fournie, vérifie le format et l'existence en base active.
    """
    if x_api_key is None:
        return None

    if not (x_api_key.startswith("wz_live_") or x_api_key.startswith("wz_test_")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_API_KEY_FORMAT", "message": "Format de clé API invalide"},
        )

    # Vérification en base
    record = api_key_repo.get_by_secret_key(x_api_key)
    if not record or not record.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "API_KEY_REVOKED_OR_UNKNOWN",
                "message": "Clé API inconnue ou révoquée",
            },
        )

    return x_api_key


def require_scope(required_scope: ScopeType) -> Callable:
    """Dépendance FastAPI exigeant un scope de permission particulier."""

    async def _scope_checker(x_api_key: str | None = Header(default=None)) -> ApiKeyRecord:
        if x_api_key is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "code": "API_KEY_REQUIRED",
                    "message": "Clé API obligatoire pour cette opération",
                },
            )

        record = api_key_repo.get_by_secret_key(x_api_key)
        if not record or not record.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "code": "API_KEY_REVOKED_OR_UNKNOWN",
                    "message": "Clé API inconnue ou révoquée",
                },
            )

        if required_scope not in record.scopes and "admin" not in record.scopes:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "INSUFFICIENT_SCOPE",
                    "message": f"Scope requis '{required_scope}' manquant",
                    "scopes_disponibles": record.scopes,
                },
            )

        return record

    return _scope_checker
