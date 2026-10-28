"""Outil MCP `calculer_tva` (WAT-041)."""

from __future__ import annotations

from typing import Any, Literal

from fastmcp import FastMCP
from wezas_core.log import get_logger
from wezas_core.taxes import calculate_transaction_tax
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

    @mcp.tool
    def calculer_taxe_transaction(
        pays: str,
        montant: float | str,
        type_taxe: str | None = None,
        cumul_journalier_precedent: float | str = 0,
    ) -> dict[str, Any]:
        """Calcule les taxes transactionnelles, prélèvements Mobile Money (E-Levy Ghana, TSTA Cameroun, EMTL Nigeria)
        et retenues à la source (BRS Côte d'Ivoire/Sénégal, WHT, Digital Services Tax Kenya).

        Args:
            pays: Code ISO ou nom du pays (ex. 'GH', 'CM', 'CI', 'SN', 'KE', 'NG').
            montant: Montant de la transaction ou de la prestation de service.
            type_taxe: Type optionnel (ex. 'e_levy', 'taxe_transfert_argent', 'brs_services', 'emtl', 'dst', 'wht_services').
            cumul_journalier_precedent: Cumul des transactions déjà effectuées aujourd'hui (pour le calcul des franchises journalières ex. E-Levy).
        """
        env = calculate_transaction_tax(
            pays=pays,
            montant=montant,
            type_taxe=type_taxe,
            cumul_journalier_precedent=cumul_journalier_precedent,
        )
        return env.model_dump(mode="json")
