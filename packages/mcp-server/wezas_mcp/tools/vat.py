"""Outil MCP `calculer_tva` (WAT-041)."""

from __future__ import annotations

from typing import Any, Literal

from fastmcp import FastMCP
from wezas_core.log import get_logger
from wezas_core.vat import calculate_vat

log = get_logger("tools.vat")


def register(mcp: FastMCP) -> None:
    @mcp.tool
    def calculer_tva(
        montant: float | str,
        pays: str,
        type_taux: Literal["standard", "reduit", "super_reduit"] = "standard",
        mode: Literal["ht", "ttc"] = "ht",
        taux_personnalise: float | str | None = None,
    ) -> dict[str, Any]:
        """Calcule la TVA et les montants HT/TTC selon les taux officiels du pays africain.
        Calculates VAT and net/gross amounts according to official African country rates.

        Args:
            montant: Montant de base (nombre ou chaîne, ex. 10000).
            pays: Nom ou code pays (ex. "Gabon", "GA", "Cameroun", "Sénégal").
            type_taux: "standard" (par défaut), "reduit" ou "super_reduit".
            mode: "ht" pour calculer la TVA et le TTC, ou "ttc" pour extraire la TVA et le HT.
            taux_personnalise: Taux décimal personnalisé optionnel (ex. 0.18 pour 18%).
        """
        env = calculate_vat(
            montant=montant,
            pays=pays,
            type_taux=type_taux,
            mode=mode,
            taux_personnalise=taux_personnalise,
        )
        log.debug("calculer_tva ok=%s code=%s", env.ok, env.error.code if env.error else None)
        return env.model_dump(mode="json")
