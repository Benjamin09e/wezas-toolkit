"""Outil MCP pour valider et décoder RIB (UEMOA/CEMAC), NUBAN (NG/GH) et IBAN."""

from __future__ import annotations

from typing import Any

from wezas_core.iban import validate_african_iban
from wezas_core.nuban import validate_nuban
from wezas_core.rib import validate_rib


def register_tool(mcp: Any) -> None:
    @mcp.tool(
        name="valider_rib",
        description=(
            "Valide et décode un Relevé d'Identité Bancaire (RIB) pour les pays de la zone "
            "UEMOA (BCEAO - CI, SN, BJ, BF...) et CEMAC (BEAC - CM, GA, CG...). "
            "Contrôle la clé de sécurité par l'algorithme modulo 97 officiel."
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

    @mcp.tool(
        name="valider_nuban",
        description=(
            "Valide un compte bancaire NUBAN à 10 chiffres (Nigeria CBN, Ghana BoG). "
            "Vérifie la clé de contrôle officielle par l'algorithme Modulo 10 pondéré."
        ),
    )
    def tool_valider_nuban(
        code_banque: str,
        numero_compte: str,
        pays: str = "NG",
    ) -> dict[str, Any]:
        """
        Valide un compte NUBAN à 10 chiffres.

        Args:
            code_banque: Code CBN de la banque (ex: 044 Access Bank, 058 GTBank, 090267 Kuda).
            numero_compte: Numéro de compte complet à 10 chiffres.
            pays: Code pays ISO (défaut: NG).
        """
        envelope = validate_nuban(
            bank_code=code_banque,
            account_number=numero_compte,
            country=pays,
        )
        return envelope.model_dump()

    @mcp.tool(
        name="valider_iban_afrique",
        description=(
            "Valide et extrait les composants d'un IBAN pour les pays africains utilisant la norme "
            "ISO 13616 (Maroc MA, Tunisie TN, Mauritanie MR, Égypte EG, Maurice MU...). "
            "Vérifie la clé de contrôle par l'algorithme MOD 97-10."
        ),
    )
    def tool_valider_iban(
        iban: str,
    ) -> dict[str, Any]:
        """
        Valide un IBAN bancaire africain.

        Args:
            iban: Numéro de compte IBAN complet (ex: MA64011780000012345678901234).
        """
        envelope = validate_african_iban(iban_str=iban)
        return envelope.model_dump()
