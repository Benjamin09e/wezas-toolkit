"""Outil MCP `formater_montant` (WAT-040)."""

from __future__ import annotations

from typing import Any

from fastmcp import FastMCP
from wezas_core.format_amount import format_amount
from wezas_core.log import get_logger

log = get_logger("tools.format_amount")


def register(mcp: FastMCP) -> None:
    @mcp.tool
    def formater_montant(
        montant: float | str,
        devise: str | None = None,
        pays: str | None = None,
        inclure_symbole: bool = True,
        decimales: int | None = None,
    ) -> dict[str, Any]:
        """Formate un montant avec les séparateurs et symboles monétaires locaux.
        Formats an amount with local currency symbols and grouping separators.

        Args:
            montant: Montant numérique ou texte à formater (ex. 1000000, "15000.5").
            devise: Code devise (XAF, XOF, EUR, USD). Optionnel si `pays` est fourni.
            pays: Nom ou code ISO du pays (ex. "Gabon", "CI") pour déduire la devise.
            inclure_symbole: Inclure le symbole monétaire dans la sortie (True par défaut).
            decimales: Nombre spécifique de décimales (optionnel, déduit de la devise par défaut).
        """
        env = format_amount(
            amount=montant,
            devise=devise,
            pays=pays,
            inclure_symbole=inclure_symbole,
            decimales=decimales,
        )
        log.debug("formater_montant ok=%s code=%s", env.ok, env.error.code if env.error else None)
        return env.model_dump(mode="json")
