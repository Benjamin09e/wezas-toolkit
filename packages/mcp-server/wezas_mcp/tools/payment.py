from typing import Any

from fastmcp import FastMCP
from wezas_core.payment import generate_payment_link
from wezas_core.qrcode import decode_payment_qr, generate_emv_qr


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

    @mcp.tool(
        name="generer_qr_emvco",
        description=(
            "Génère un payload QR Code conforme au standard officiel EMVCo Merchant-Presented Mode "
            "(utilisé par GHQR au Ghana, NQR au Nigeria et l'interopérabilité bancaire africaine). "
            "Calcule automatiquement la somme de contrôle CRC16 CCITT."
        ),
    )
    def generer_qr_emvco_tool(
        nom_marchand: str,
        ville_marchand: str,
        pays: str,
        compte_marchand: str,
        devise: str,
        montant: float | None = None,
        reference: str | None = None,
    ) -> dict[str, Any]:
        return generate_emv_qr(
            merchant_name=nom_marchand,
            merchant_city=ville_marchand,
            country=pays,
            merchant_account=compte_marchand,
            currency=devise,
            amount=montant,
            reference=reference,
        ).model_dump(mode="json")

    @mcp.tool(
        name="decoder_qr_paiement",
        description=(
            "Décode et valide un payload de QR code de paiement africain, qu'il soit au format "
            "standard EMVCo (avec contrôle d'intégrité CRC16) ou direct Mobile Money (Wave, Orange Money, MoMo)."
        ),
    )
    def decoder_qr_paiement_tool(
        payload: str,
    ) -> dict[str, Any]:
        return decode_payment_qr(payload=payload).model_dump(mode="json")
