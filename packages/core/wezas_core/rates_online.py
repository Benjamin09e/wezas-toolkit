"""Gestion du volet en ligne (WAT-043, WAT-044) avec cache et résilience.

Permet le rafraîchissement des taux de change flottants (ex: USD/EUR)
avec cache TTL et repli automatique garanti en cas de panne réseau ou mode hors ligne.
"""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.request
from dataclasses import dataclass

from wezas_core.log import get_logger

log = get_logger("rates_online")

# Clé d'environnement pour activer explicitement le mode en ligne
ENV_ONLINE_MODE = "WEZAS_ONLINE"
DEFAULT_CACHE_TTL_SECONDS = 3600 * 12  # 12 heures de cache
REQUEST_TIMEOUT_SECONDS = 2.5  # Timeout strict pour ne jamais ralentir un agent MCP

# Endpoint par défaut (Frankfurter API, open-source, gratuit, sans clé, basé sur la BCE)
DEFAULT_RATES_ENDPOINT = "https://api.frankfurter.app/latest?from=EUR&to=USD"


@dataclass
class LiveRateResult:
    rate: float
    date: str
    source: str
    from_cache: bool = False


class RatesProvider:
    """Fournisseur de taux en ligne avec cache mémoire et repli résilient."""

    def __init__(
        self,
        endpoint: str = DEFAULT_RATES_ENDPOINT,
        ttl_seconds: int = DEFAULT_CACHE_TTL_SECONDS,
        timeout: float = REQUEST_TIMEOUT_SECONDS,
    ):
        self.endpoint = endpoint
        self.ttl_seconds = ttl_seconds
        self.timeout = timeout
        self._cached_rates: dict[str, LiveRateResult] = {}
        self._cache_timestamp: float = 0.0

    @property
    def is_online_enabled(self) -> bool:
        """Indique si le mode en ligne est autorisé via variable d'environnement."""
        val = os.getenv(ENV_ONLINE_MODE, "").strip().lower()
        return val in ("1", "true", "yes", "on")

    def get_live_usd_rate(self) -> LiveRateResult | None:
        """Tente de récupérer le taux EUR -> USD en ligne ou depuis le cache."""
        if not self.is_online_enabled:
            log.debug("Mode en ligne désactivé (WEZAS_ONLINE non défini). Repli hors ligne.")
            return None

        now = time.time()
        # 1. Vérification du cache TTL
        if "USD" in self._cached_rates and (now - self._cache_timestamp) < self.ttl_seconds:
            cached = self._cached_rates["USD"]
            log.debug("Taux USD récupéré depuis le cache mémoire (date=%s)", cached.date)
            return LiveRateResult(
                rate=cached.rate,
                date=cached.date,
                source=cached.source,
                from_cache=True,
            )

        # 2. Requête HTTP avec timeout strict
        try:
            req = urllib.request.Request(
                self.endpoint,
                headers={"User-Agent": "Wezas-Africa-Toolkit/0.1 (MCP Server)"},
            )
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    usd_rate = float(data["rates"]["USD"])
                    rate_date = str(data.get("date", ""))
                    result = LiveRateResult(
                        rate=usd_rate,
                        date=rate_date,
                        source=f"BCE / Frankfurter API en direct ({rate_date})",
                        from_cache=False,
                    )
                    self._cached_rates["USD"] = result
                    self._cache_timestamp = now
                    log.info("Taux USD rafraîchi en direct: %s (date=%s)", usd_rate, rate_date)
                    return result
        except (urllib.error.URLError, TimeoutError, KeyError, ValueError, Exception) as exc:
            log.warning("Échec taux USD en direct (%s). Repli cache/hors-ligne.", exc)

        # Si échec mais qu'on a une entrée en cache même expirée, on peut la réutiliser
        if "USD" in self._cached_rates:
            cached = self._cached_rates["USD"]
            return LiveRateResult(
                rate=cached.rate,
                date=cached.date,
                source=f"{cached.source} (cache expiré)",
                from_cache=True,
            )

        return None


# Instance globale
_global_provider = RatesProvider()


def get_live_rate_provider() -> RatesProvider:
    return _global_provider
