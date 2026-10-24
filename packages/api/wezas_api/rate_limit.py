"""Middleware de limitation de débit (Rate Limiting) en mémoire (Sliding Window / Token Bucket).

Conforme aux spécifications du Volet 2 (WAT-045 & spec-volet-2.md) :
- Anonyme (sans clé API) : 30 requêtes / minute par IP
- Authentifié (clé `wz_live_...` ou `wz_test_...`) : 600 requêtes / minute par clé
- En-têtes HTTP retournés :
    - X-RateLimit-Limit
    - X-RateLimit-Remaining
    - X-RateLimit-Reset
"""

from __future__ import annotations

import time
from collections import defaultdict
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class RateLimiter:
    """Fenêtre glissante (sliding window) en mémoire pour le rate limiting."""

    def __init__(self, limit_per_minute: int):
        self.limit = limit_per_minute
        self.window = 60.0  # 60 secondes
        self.history: dict[str, list[float]] = defaultdict(list)

    def is_allowed(self, identifier: str) -> tuple[bool, int, int]:
        """
        Vérifie si la requête est autorisée.
        Retourne : (autorisé: bool, restantes: int, reset_dans_secondes: int)
        """
        now = time.time()
        window_start = now - self.window

        # Nettoyage des requêtes antérieures à la fenêtre
        timestamps = [t for t in self.history[identifier] if t > window_start]
        self.history[identifier] = timestamps

        current_count = len(timestamps)

        if current_count >= self.limit:
            oldest = timestamps[0] if timestamps else now
            reset_in = max(1, int(oldest + self.window - now))
            return False, 0, reset_in

        # Enregistrement de la nouvelle requête
        timestamps.append(now)
        remaining = max(0, self.limit - len(timestamps))
        reset_in = int(self.window)
        return True, remaining, reset_in


# Instances globales
RATE_LIMITER_ANONYMOUS = RateLimiter(limit_per_minute=30)
RATE_LIMITER_AUTHENTICATED = RateLimiter(limit_per_minute=600)


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Exempter les routes de documentation et le health check
        path = request.url.path
        exempt_paths = {"/health", "/", "/docs", "/redoc", "/openapi.json"}
        if path in exempt_paths or path.startswith("/static"):
            return await call_next(request)

        # Identifier le client par sa clé API ou son IP
        api_key = request.headers.get("x-api-key") or request.headers.get("X-API-Key")

        if api_key and (api_key.startswith("wz_live_") or api_key.startswith("wz_test_")):
            identifier = f"key:{api_key}"
            limiter = RATE_LIMITER_AUTHENTICATED
            limit_total = 600
        else:
            client_host = request.client.host if request.client else "127.0.0.1"
            # Support des en-têtes proxy (X-Forwarded-For)
            forwarded = request.headers.get("x-forwarded-for")
            ip = forwarded.split(",")[0].strip() if forwarded else client_host
            identifier = f"ip:{ip}"
            limiter = RATE_LIMITER_ANONYMOUS
            limit_total = 30

        allowed, remaining, reset_in = limiter.is_allowed(identifier)

        if not allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "ok": False,
                    "error": {
                        "code": "RATE_LIMIT_EXCEEDED",
                        "message": {
                            "fr": "Limite de requêtes atteinte. Réessayez dans quelques instants.",
                            "en": "Rate limit exceeded. Please try again shortly.",
                        },
                        "details": {
                            "limit": limit_total,
                            "reset_in_seconds": reset_in,
                        },
                    },
                },
                headers={
                    "X-RateLimit-Limit": str(limit_total),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset_in),
                    "Retry-After": str(reset_in),
                },
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit_total)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_in)
        return response
