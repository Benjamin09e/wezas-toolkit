"""Génération et décodage de QR codes de paiement marchands EMVCo (GHQR, NQR) et Mobile Money."""

from __future__ import annotations

from decimal import Decimal, InvalidOperation

from wezas_core.envelope import Envelope, ErrorCode, failure, success
from wezas_core.normalize import country_not_found, resolve_country

# Devises ISO 4217 numériques courantes pour EMVCo (Tag 53)
CURRENCY_NUMERIC_CODES: dict[str, str] = {
    "XOF": "952",
    "XAF": "950",
    "NGN": "566",
    "GHS": "936",
    "KES": "404",
    "UGX": "800",
    "TZS": "834",
    "RWF": "646",
    "MAD": "504",
    "EGP": "818",
    "ZAR": "710",
    "EUR": "978",
    "USD": "840",
}

NUMERIC_TO_CURRENCY: dict[str, str] = {v: k for k, v in CURRENCY_NUMERIC_CODES.items()}


def compute_crc16_ccitt(payload: str) -> str:
    """
    Calcule le CRC16 CCITT (polynôme 0x1021, valeur initiale 0xFFFF)
    selon la spécification officielle EMVCo Merchant-Presented Mode (Tag 63).
    """
    crc = 0xFFFF
    for char in payload.encode("utf-8"):
        crc ^= char << 8
        for _ in range(8):
            if crc & 0x8000:
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF
            else:
                crc = (crc << 1) & 0xFFFF
    return f"{crc:04X}"


def format_emv_tag(tag: str, value: str) -> str:
    """Formate un champ TLV (Tag, Length à 2 chiffres, Value) pour EMVCo."""
    val_str = str(value)
    return f"{tag}{len(val_str.encode('utf-8')):02d}{val_str}"


def parse_emv_tlv(payload: str) -> dict[str, str]:
    """Parse une chaîne TLV EMVCo en dictionnaire {tag: valeur}."""
    tags: dict[str, str] = {}
    idx = 0
    raw_len = len(payload)
    while idx + 4 <= raw_len:
        tag = payload[idx : idx + 2]
        try:
            length = int(payload[idx + 2 : idx + 4])
        except ValueError:
            break
        idx += 4
        value = payload[idx : idx + length]
        tags[tag] = value
        idx += length
    return tags


def generate_emv_qr(
    merchant_name: str,
    merchant_city: str,
    country: str,
    merchant_account: str,
    currency: str,
    amount: float | str | None = None,
    reference: str | None = None,
    point_of_initiation: str = "12",  # 12 = Dynamic (montant fixe défini), 11 = Static
) -> Envelope:
    """
    Génère un payload QR Code standard EMVCo (conforme GHQR, NQR et standards bancaires africains).
    """
    country_obj = resolve_country(country)
    if not country_obj:
        return country_not_found(country)

    iso2 = country_obj.iso2.upper()
    curr_upper = currency.upper().strip()
    curr_num = CURRENCY_NUMERIC_CODES.get(curr_upper)

    if not curr_num:
        return failure(
            ErrorCode.DEVISE_NON_SUPPORTEE,
            f"Code devise non supporté pour EMVCo : {currency}.",
            f"Unsupported currency code for EMVCo: {currency}.",
            suggestions=list(CURRENCY_NUMERIC_CODES.keys()),
        )

    # Nettoyage et validation montant
    amount_str = None
    if amount is not None:
        try:
            dec_amount = Decimal(str(amount).replace(",", "."))
            if dec_amount <= 0:
                return failure(
                    ErrorCode.MONTANT_INVALIDE,
                    "Le montant doit être supérieur à zéro.",
                    "Amount must be greater than zero.",
                )
            # Formatage avec 2 décimales ou entier selon le besoin
            amount_str = f"{dec_amount:.2f}"
        except (InvalidOperation, ValueError):
            return failure(
                ErrorCode.MONTANT_INVALIDE,
                f"Montant invalide : {amount}.",
                f"Invalid amount: {amount}.",
            )

    # Construction du TLV EMVCo de base
    # Tag 00 : Payload Format Indicator ('01')
    # Tag 01 : Point of Initiation Method ('11' static, '12' dynamic)
    # Tag 26 : Merchant Account Information
    # Tag 52 : Merchant Category Code ('0000' ou générique)
    # Tag 53 : Transaction Currency (numérique ISO)
    # Tag 54 : Transaction Amount (optionnel)
    # Tag 58 : Country Code (ISO 2 lettres)
    # Tag 59 : Merchant Name
    # Tag 60 : Merchant City
    # Tag 62 : Additional Data Field (Reference / Bill ID)
    # Tag 63 : CRC16 Checksum

    tlv_parts: list[str] = [
        format_emv_tag("00", "01"),
        format_emv_tag("01", point_of_initiation if amount_str else "11"),
        format_emv_tag("26", merchant_account.strip()),
        format_emv_tag("52", "0000"),
        format_emv_tag("53", curr_num),
    ]

    if amount_str:
        tlv_parts.append(format_emv_tag("54", amount_str))

    tlv_parts.extend([
        format_emv_tag("58", iso2),
        format_emv_tag("59", merchant_name[:25].strip()),
        format_emv_tag("60", merchant_city[:15].strip()),
    ])

    if reference:
        # Tag 62 sous-tag 01 (Bill Number) ou 05 (Reference)
        sub_ref = format_emv_tag("01", reference[:25].strip())
        tlv_parts.append(format_emv_tag("62", sub_ref))

    pre_payload = "".join(tlv_parts) + "6304"
    crc = compute_crc16_ccitt(pre_payload)
    final_payload = f"{pre_payload}{crc}"

    return success(
        data={
            "payload": final_payload,
            "norme": "EMVCo Merchant-Presented Mode (ISO/IEC 18004)",
            "crc": crc,
            "marchand": {
                "nom": merchant_name.strip(),
                "ville": merchant_city.strip(),
                "compte": merchant_account.strip(),
                "pays": iso2,
            },
            "devise": curr_upper,
            "code_devise_iso": curr_num,
            "montant": amount_str,
            "reference": reference,
            "type_initiation": "dynamic" if amount_str else "static",
        },
        source="EMVCo QR Code Specification for Payment Systems (Merchant-Presented Mode)",
        confiance="haute",
    )


def decode_payment_qr(payload: str) -> Envelope:
    """
    Décode un payload QR Code de paiement, qu'il s'agisse d'un standard EMVCo (GHQR, NQR)
    ou d'un format direct Mobile Money (Wave, Orange Money, MTN MoMo).
    """
    if not payload or not isinstance(payload, str):
        return failure(
            ErrorCode.ENTREE_INVALIDE,
            "Le payload du QR code est requis.",
            "QR code payload is required.",
        )

    clean_payload = payload.strip()

    # Détection des QR codes propriétaires Mobile Money
    if clean_payload.startswith("WAVE:"):
        parts = clean_payload.split(":")
        phone = parts[1] if len(parts) > 1 else ""
        amount = parts[2] if len(parts) > 2 else None
        ref = parts[3] if len(parts) > 3 else None
        return success(
            data={
                "type": "mobile_money_direct",
                "operateur": "Wave",
                "telephone": phone,
                "montant": amount,
                "reference": ref,
                "payload_brut": clean_payload,
            },
            source="Spécification QR Code Wave",
            confiance="haute",
        )

    if clean_payload.startswith("OM:"):
        parts = clean_payload.split(":")
        phone = parts[1] if len(parts) > 1 else ""
        amount = parts[2] if len(parts) > 2 else None
        ref = parts[3] if len(parts) > 3 else None
        return success(
            data={
                "type": "mobile_money_direct",
                "operateur": "Orange Money",
                "telephone": phone,
                "montant": amount,
                "reference": ref,
                "payload_brut": clean_payload,
            },
            source="Spécification QR Code Orange Money",
            confiance="haute",
        )

    if clean_payload.startswith("MOMO:"):
        parts = clean_payload.split(":")
        phone = parts[1] if len(parts) > 1 else ""
        amount = parts[2] if len(parts) > 2 else None
        ref = parts[3] if len(parts) > 3 else None
        return success(
            data={
                "type": "mobile_money_direct",
                "operateur": "MTN MoMo",
                "telephone": phone,
                "montant": amount,
                "reference": ref,
                "payload_brut": clean_payload,
            },
            source="Spécification QR Code MTN MoMo",
            confiance="haute",
        )

    # Vérification EMVCo
    if clean_payload.startswith("000201"):
        tlv = parse_emv_tlv(clean_payload)
        country_code = tlv.get("58", "")
        currency_num = tlv.get("53", "")
        currency_code = NUMERIC_TO_CURRENCY.get(currency_num, currency_num)
        merchant_name = tlv.get("59", "")
        merchant_city = tlv.get("60", "")
        merchant_account = tlv.get("26", "")
        amount = tlv.get("54")
        crc_fourni = tlv.get("63")

        # Vérification CRC
        crc_valide = False
        if crc_fourni and len(crc_fourni) == 4:
            payload_sans_crc_val = clean_payload[:-4]
            crc_calcule = compute_crc16_ccitt(payload_sans_crc_val)
            crc_valide = crc_calcule.upper() == crc_fourni.upper()

        return success(
            data={
                "type": "emvco",
                "norme": "EMVCo Merchant-Presented Mode",
                "valide_crc": crc_valide,
                "crc": crc_fourni,
                "marchand": {
                    "nom": merchant_name,
                    "ville": merchant_city,
                    "compte": merchant_account,
                    "pays": country_code,
                },
                "devise": currency_code,
                "montant": amount,
                "tags_bruts": tlv,
            },
            source="EMVCo Specification Decoder",
            confiance="haute" if crc_valide else "moyenne",
        )

    return failure(
        ErrorCode.ENTREE_INVALIDE,
        "Format de QR code de paiement non reconnu (ni EMVCo, ni standard Mobile Money).",
        "Unrecognized payment QR code format (neither EMVCo nor standard Mobile Money).",
        details={"payload": clean_payload},
    )
