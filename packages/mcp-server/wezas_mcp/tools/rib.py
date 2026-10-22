"""Outil MCP pour valider et décoder un RIB bancaire UEMOA ou CEMAC."""

from __future__ import annotations

from typing import Any

from wezas_core.rib import validate_rib


def register_tool(mcp: Any) -> None:
    @mcp.tool(
        name="valider_rib",
        description=(
            "Valide et décode un Relevé d'Identité Bancaire (RIB) pour les pays de la zone "
            "UEMOA (BCEAO - CI, SN, BJ, BF...) et CEMAC (BEAC - CM, GA, CG...). "
            "Contrôle la clé de sécurité par l'algorithme modulo 97 officiel et identifie la banque et le pays."
        ),
    )
    def tool_valider_rib(
        code_banque: str,
        code_guichet: str,
        numero_compte: str,
        cle_rib: str,
    ) -> dict[str, Any]:
        """
        Valide un RIB bancaire africain (UEMOA / CEMAC).

        Args:
            code_banque: Code banque à 5 caractères (ex: CI008, SN012, GA040).
            code_guichet: Code guichet de l'agence à 5 chiffres (ex: 01111).
            numero_compte: Numéro de compte bancaire à 11 ou 12 caractères.
            cle_rib: Clé de contrôle RIB à 2 chiffres.
        """
        envelope = validate_rib(
            code_banque=code_banque,
            code_guichet=code_guichet,
            numero_compte=numero_compte,
            cle_rib=cle_rib,
        )
        return envelope.model_dump()
