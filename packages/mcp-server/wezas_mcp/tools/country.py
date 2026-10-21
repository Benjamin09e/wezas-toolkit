"""Outil MCP `info_pays` (WAT-027)."""

from __future__ import annotations

from typing import Any

from fastmcp import FastMCP
from wezas_core.country import get_country_info
from wezas_core.log import get_logger

log = get_logger("tools.country")


def register(mcp: FastMCP) -> None:
    @mcp.tool
    def info_pays(
        pays: str,
        annee: int | None = None,
        champs: list[str] | None = None,
    ) -> dict[str, Any]:
        """Retourne les informations clés d'un pays africain (indicatif, devise, fériés).
        Returns key information for an African country (dial code, currency, holidays).

        Args:
            pays: Nom ou code ISO du pays (ex. 'Gabon', 'GA', 'Côte d'Ivoire', 'CI').
            annee: Année pour les jours fériés (optionnel, année en cours par défaut).
            champs: Champs spécifiques à retourner (optionnel, ex. ['devise', 'jours_feries']).
        """
        log.debug("info_pays pays=%s annee=%s champs=%s", pays, annee, champs)
        env = get_country_info(pays, annee=annee, champs=champs)
        log.debug("info_pays ok=%s", env.ok)
        return env.model_dump(mode="json")
