"""Outil MCP `convertir_devise`."""

from __future__ import annotations

from typing import Any

from fastmcp import FastMCP
from wezas_core.currency import convert
from wezas_core.log import get_logger

log = get_logger("tools.currency")


def register(mcp: FastMCP) -> None:
    @mcp.tool
    def convertir_devise(montant: float | str, de: str, vers: str) -> dict[str, Any]:
        """Convertit un montant entre XAF, XOF et EUR (parité fixe 1 EUR = 655,957 CFA), hors ligne.
        Converts an amount between XAF, XOF and EUR (fixed peg 1 EUR = 655.957 CFA), offline.

        Args:
            montant: Montant à convertir (nombre ou texte, ex. "15000"). / Amount to convert.
            de: Devise source : XAF, XOF ou EUR. / Source currency.
            vers: Devise cible : XAF, XOF ou EUR. / Target currency.
        """
        env = convert(montant, de, vers)
        log.debug("convertir_devise ok=%s code=%s", env.ok, env.error.code if env.error else None)
        return env.model_dump(mode="json")
