"""Outil MCP `lister_operateurs` (WAT-042)."""

from __future__ import annotations

from typing import Any

from fastmcp import FastMCP
from wezas_core.log import get_logger
from wezas_core.operators import list_operators

log = get_logger("tools.operators")


def register(mcp: FastMCP) -> None:
    @mcp.tool
    def lister_operateurs(
        pays: str | None = None,
        avec_mobile_money_seulement: bool = False,
    ) -> dict[str, Any]:
        """Liste les opérateurs télécoms et services Mobile Money disponibles.
        Lists telecom operators and supported Mobile Money services.

        Args:
            pays: Nom ou code pays optionnel pour filtrer les opérateurs (ex. "Sénégal", "GA").
            avec_mobile_money_seulement: Si True, ne renvoie que ceux avec Mobile Money.
        """
        env = list_operators(
            pays=pays,
            avec_mobile_money_seulement=avec_mobile_money_seulement,
        )
        log.debug("lister_operateurs ok=%s code=%s", env.ok, env.error.code if env.error else None)
        return env.model_dump(mode="json")
