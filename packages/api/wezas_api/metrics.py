"""Collecte de métriques agrégées et anonymisées en mémoire (WAT-055).

Conforme à la politique de vie privée (spec-volet-2.md) :
- Zéro journalisation de données personnelles ou sensibles (pas de numéro de téléphone, pas de RIB).
- Uniquement des compteurs agrégés par endpoint, statut HTTP, méthode et pays demandé.
"""

from __future__ import annotations

import time
from collections import defaultdict
from typing import Any

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware


class MetricsCollector:
    """Collecteur de métriques système et API en mémoire."""

    def __init__(self) -> None:
        self.start_time = time.time()
        self.total_requests = 0
        self.requests_by_endpoint: dict[str, int] = defaultdict(int)
        self.requests_by_status: dict[int, int] = defaultdict(int)
        self.requests_by_country: dict[str, int] = defaultdict(int)
        self.latencies_ms: list[float] = []

    def record_request(
        self,
        endpoint: str,
        status_code: int,
        latency_ms: float,
        country: str | None = None,
    ) -> None:
        self.total_requests += 1
        self.requests_by_endpoint[endpoint] += 1
        self.requests_by_status[status_code] += 1
        if country:
            self.requests_by_country[country.upper()] += 1

        # Conserver les 1000 dernières latences pour le calcul de moyenne
        self.latencies_ms.append(latency_ms)
        if len(self.latencies_ms) > 1000:
            self.latencies_ms.pop(0)

    def get_summary(self) -> dict[str, Any]:
        uptime_seconds = int(time.time() - self.start_time)
        avg_latency = (
            round(sum(self.latencies_ms) / len(self.latencies_ms), 2)
            if self.latencies_ms
            else 0.0
        )

        return {
            "uptime_seconds": uptime_seconds,
            "total_requests": self.total_requests,
            "average_latency_ms": avg_latency,
            "requests_by_status": dict(self.requests_by_status),
            "top_endpoints": dict(
                sorted(
                    self.requests_by_endpoint.items(),
                    key=lambda x: x[1],
                    reverse=True,
                )[:10]
            ),
            "requests_by_country": dict(
                sorted(
                    self.requests_by_country.items(),
                    key=lambda x: x[1],
                    reverse=True,
                )[:15]
            ),
        }


metrics_collector = MetricsCollector()


class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Any) -> Response:
        start_time = time.time()
        response = await call_next(request)
        latency_ms = (time.time() - start_time) * 1000

        path = request.url.path
        if path not in ["/metrics", "/health", "/openapi.json", "/docs", "/redoc", "/scalar"]:
            # Détection d'un code pays éventuel dans le chemin (ex: /v1/country/CI)
            country = None
            parts = path.strip("/").split("/")
            if len(parts) >= 3 and parts[0] == "v1" and parts[1] == "country":
                country = parts[2]

            metrics_collector.record_request(
                endpoint=path,
                status_code=response.status_code,
                latency_ms=latency_ms,
                country=country,
            )

        return response
