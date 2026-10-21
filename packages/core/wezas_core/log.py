"""Journalisation locale (WAT-008).

- Les logs vont sur **stderr** : en transport stdio, stdout est réservé au protocole MCP.
- Niveau via `WEZAS_LOG_LEVEL` (défaut WARNING). Aucune télémétrie, aucun accès réseau.
- Les numéros de téléphone ne sont jamais journalisés en clair (`mask_phone`).
"""

from __future__ import annotations

import logging
import os
import sys

LOGGER_NAME = "wezas"
ENV_VAR = "WEZAS_LOG_LEVEL"
_FORMAT = "%(asctime)s %(levelname)s %(name)s: %(message)s"


def get_logger(name: str | None = None) -> logging.Logger:
    return logging.getLogger(f"{LOGGER_NAME}.{name}" if name else LOGGER_NAME)


def configure_logging(level: str | None = None) -> logging.Logger:
    """Configure le logger `wezas` (idempotent). Un niveau invalide retombe sur WARNING."""
    raw = (level or os.environ.get(ENV_VAR) or "WARNING").upper()
    resolved = logging.getLevelName(raw)
    numeric = resolved if isinstance(resolved, int) else logging.WARNING

    logger = logging.getLogger(LOGGER_NAME)
    logger.setLevel(numeric)
    logger.propagate = False
    if not any(getattr(h, "_wezas", False) for h in logger.handlers):
        handler = logging.StreamHandler(sys.stderr)
        handler.setFormatter(logging.Formatter(_FORMAT))
        handler._wezas = True  # type: ignore[attr-defined]
        logger.addHandler(handler)
    return logger


def mask_phone(number: str) -> str:
    """Masque un numéro pour les logs : garde les 2 derniers chiffres."""
    digits = [c for c in number if c.isdigit()]
    if len(digits) <= 2:
        return "***"
    return "*" * (len(digits) - 2) + "".join(digits[-2:])
