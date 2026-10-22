from typing import Any

from fastmcp import FastMCP
from wezas_core.payment import generate_payment_link


def register(mcp: FastMCP) -> None:
    @mcp.tool(
        name="generer_paiement_mobile_money",
        description=(
            "Génère un lien profond, une syntaxe USSD et un QR payload Mobile Money "
            "(Wave, Orange Money, MTN MoMo, M-Pesa, Airtel Money). / "
            "Generate deeplinks, USSD codes and QR payloads for African Mobile Money payments."
        ),
    )
    def generer_paiement_mobile_money_tool(
        operateur: str,
        telephone: str,
        montant: float,
        pays: str,
        reference: str | None = None,
    ) -> dict[str, Any]:
        return generate_payment_link(
            operateur=operateur,
            telephone=telephone,
            montant=montant,
            pays=pays,
            reference=reference,
        ).model_dump(mode="json")
