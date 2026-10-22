"""Génération de liens profonds (deeplinks), codes USSD et payloads Mobile Money africain."""

from __future__ import annotations

import datetime as dt
from decimal import Decimal, InvalidOperation
from typing import Any

from wezas_core.envelope import Envelope, ErrorCode, failure, success
from wezas_core.normalize import country_not_found, resolve_country
from wezas_core.phone import validate_phone

# Données des standards de paiement Mobile Money par pays et opérateur
PAYMENT_CONFIGS: dict[str, dict[str, Any]] = {
    "wave": {
        "nom": "Wave Mobile Money",
        "type": "deeplink",
        "pays": ["SN", "CI"],
        "generer": lambda phone, amount, ref: {
            "deeplink": (
                f"https://wave.com/send?recipient={phone}&amount={amount}"
                + (f"&note={ref}" if ref else "")
            ),
            "ussd": None,
            "instruction": f"Ouvrez l'application Wave pour régler {amount} au {phone}.",
            "qr_payload": f"WAVE:{phone}:{amount}" + (f":{ref}" if ref else ""),
        },
    },
    "orange_money": {
        "nom": "Orange Money",
        "type": "ussd_and_link",
        "pays": ["SN", "CI", "CM", "GA", "ML", "BF", "CF"],
        "ussd_syntax": {
            "SN": "#144#",
            "CI": "#144*1*{phone}*{amount}#",
            "CM": "#150*1*1*{phone}*{amount}#",
            "GA": "*150#",
            "ML": "#144#",
            "BF": "*144#",
            "CF": "#144#",
        },
        "generer": lambda phone, amount, ref, iso2: {
            "deeplink": f"https://om.orange.com/pay?to={phone}&amount={amount}",
            "ussd": (
                PAYMENT_CONFIGS["orange_money"]["ussd_syntax"]
                .get(iso2, "#144#")
                .format(phone=phone, amount=amount)
            ),
            "instruction": (
                f"Composez le code USSD Orange Money ou validez le transfert vers le {phone}."
            ),
            "qr_payload": f"OM:{phone}:{amount}" + (f":{ref}" if ref else ""),
        },
    },
    "mtn_momo": {
        "nom": "MTN MoMo (Mobile Money)",
        "type": "ussd",
        "pays": ["CI", "CM", "BJ", "CG", "GH", "NG"],
        "ussd_syntax": {
            "CI": "*133#",
            "CM": "*126*1*1*{phone}*{amount}#",
            "BJ": "*880#",
            "CG": "*105#",
            "GH": "*170#",
            "NG": "*671#",
        },
        "generer": lambda phone, amount, ref, iso2: {
            "deeplink": None,
            "ussd": (
                PAYMENT_CONFIGS["mtn_momo"]["ussd_syntax"]
                .get(iso2, "*126#")
                .format(phone=phone, amount=amount)
            ),
            "instruction": (
                f"Composez la syntaxe USSD MTN MoMo pour transférer {amount} au {phone}."
            ),
            "qr_payload": f"MOMO:{phone}:{amount}" + (f":{ref}" if ref else ""),
        },
    },
    "mpesa": {
        "nom": "M-Pesa (Safaricom)",
        "type": "ussd_and_stk",
        "pays": ["KE"],
        "generer": lambda phone, amount, ref: {
            "deeplink": f"mpesa://pay?phone={phone}&amount={amount}",
            "ussd": "*334#",
            "instruction": (
                f"Initiez le paiement M-Pesa de {amount} KES vers le {phone} (ou tapez *334#)."
            ),
            "qr_payload": f"MPESA:{phone}:{amount}" + (f":{ref}" if ref else ""),
        },
    },
    "airtel_money": {
        "nom": "Airtel Money",
        "type": "ussd",
        "pays": ["GA", "CG", "TD", "KE", "NE"],
        "generer": lambda phone, amount, ref: {
            "deeplink": None,
            "ussd": "*150#",
            "instruction": (
                f"Composez *150# sur Airtel pour valider le transfert de {amount} vers {phone}."
            ),
            "qr_payload": f"AIRTEL:{phone}:{amount}" + (f":{ref}" if ref else ""),
        },
    },
}


def generate_payment_link(
    operateur: str,
    telephone: str,
    montant: float | int | str,
    pays: str,
    reference: str | None = None,
) -> Envelope:
    """Génère un lien profond, un code USSD et un QR payload pour paiement Mobile Money."""
    country_obj = resolve_country(pays)
    if not country_obj:
        return country_not_found(pays)

    # Validation du montant
    try:
        val = Decimal(str(montant).replace(" ", "").replace(",", "."))
        if val <= 0:
            raise ValueError()
    except (InvalidOperation, ValueError, TypeError):
        return failure(
            ErrorCode.MONTANT_INVALIDE,
            f"Montant invalide pour le paiement Mobile Money : {montant}",
            f"Invalid amount for Mobile Money payment: {montant}",
        )

    # Validation du numéro de téléphone de destination
    phone_res = validate_phone(country_obj.iso2, telephone)
    if not phone_res.ok or not phone_res.data:
        return failure(
            ErrorCode.NUMERO_INVALIDE,
            f"Numéro de téléphone bénéficiaire invalide : « {telephone} » ({country_obj.name.fr}).",
            f"Beneficiary phone number '{telephone}' is invalid for {country_obj.name.en}.",
        )

    e164 = phone_res.data["e164"]
    clean_national = phone_res.data["format_national"].replace(" ", "")

    op_key = operateur.lower().strip().replace("-", "_").replace(" ", "_")

    # Mapping tolérant pour les noms courants
    if "wave" in op_key:
        cfg_key = "wave"
    elif "orange" in op_key:
        cfg_key = "orange_money"
    elif "momo" in op_key or "mtn" in op_key:
        cfg_key = "mtn_momo"
    elif "mpesa" in op_key or "safaricom" in op_key:
        cfg_key = "mpesa"
    elif "airtel" in op_key:
        cfg_key = "airtel_money"
    else:
        return failure(
            ErrorCode.OPERATEUR_INCONNU,
            f"Opérateur Mobile Money non reconnu : {operateur}. Supportés : Wave, OM, MoMo...",
            f"Unrecognized Mobile Money operator: {operateur}. Supported: Wave, OM, MoMo...",
            suggestions=["wave", "orange_money", "mtn_momo", "mpesa", "airtel_money"],
        )

    config = PAYMENT_CONFIGS[cfg_key]

    if country_obj.iso2 not in config["pays"]:
        return failure(
            ErrorCode.DONNEES_INDISPONIBLES,
            f"Le service {config['nom']} n'est pas répertorié en {country_obj.name.fr}.",
            f"Service {config['nom']} is not listed in {country_obj.name.en}.",
            suggestions=config["pays"],
        )

    # Génération des payloads selon l'opérateur
    if cfg_key in ("orange_money", "mtn_momo"):
        payloads = config["generer"](clean_national, str(val), reference, country_obj.iso2)
    else:
        payloads = config["generer"](e164, str(val), reference)

    return success(
        {
            "operateur": config["nom"],
            "pays": country_obj.iso2,
            "devise": country_obj.currency,
            "beneficiaire_e164": e164,
            "montant": str(val),
            "reference": reference,
            "deeplink": payloads.get("deeplink"),
            "code_ussd": payloads.get("ussd"),
            "instruction": payloads.get("instruction"),
            "qr_payload": payloads.get("qr_payload"),
        },
        source="Spécifications protocolaires des opérateurs télécoms et agrégateurs Mobile Money",
        derniere_verification=dt.date(2026, 10, 21),
        confiance="haute",
    )
