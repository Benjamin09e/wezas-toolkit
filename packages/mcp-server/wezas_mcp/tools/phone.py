"""Outil MCP `valider_telephone` (WAT-017)."""

from __future__ import annotations

from typing import Any

from fastmcp import FastMCP
from wezas_core.log import get_logger, mask_phone
from wezas_core.phone import validate_phone

log = get_logger("tools.phone")


def register(mcp: FastMCP) -> None:
    @mcp.tool
    def valider_telephone(pays: str, numero: str) -> dict[str, Any]:
        """Valide un numéro de téléphone africain (E.164, opérateur, Mobile Money).
        Validates an African phone number (E.164, operator, Mobile Money).

        Args:
            pays: Nom ou code ISO (ex. 'Gabon', 'GA', 'Sénégal', 'SN', 'CI').
            numero: Numéro local ou international (ex. '066 11 22 33' ou '+24166112233').
        """
        log.debug("valider_telephone pays=%s numero=%s", pays, mask_phone(numero))
        env = validate_phone(pays, numero)
        log.debug("valider_telephone ok=%s", env.ok)
        return env.model_dump(mode="json")
