"""Outil MCP `convertir_devise` (WAT-022)."""

from __future__ import annotations

from typing import Any

from fastmcp import FastMCP
from wezas_core.currency import convert
from wezas_core.log import get_logger

log = get_logger("tools.currency")


def register(mcp: FastMCP) -> None:
    @mcp.tool
    def convertir_devise(
        montant: float | str,
        de: str,
        vers: str,
        taux: float | str | None = None,
    ) -> dict[str, Any]:
        """Convertit un montant entre XAF, XOF, EUR et USD, hors ligne ou avec taux personnalisé.
        Converts an amount between XAF, XOF, EUR and USD, offline or with custom rate.

        Args:
            montant: Montant à convertir (nombre ou texte, ex. 15000 ou "15 000").
            de: Devise source : XAF, XOF, EUR ou USD.
            vers: Devise cible : XAF, XOF, EUR ou USD.
            taux: Taux personnalisé optionnel pour devises flottantes (ex. 610.5 ou 1.08).
        """
        env = convert(montant, de, vers, taux=taux)
        log.debug("convertir_devise ok=%s code=%s", env.ok, env.error.code if env.error else None)
        return env.model_dump(mode="json")
