"""Validation et détection des cartes bancaires africaines (GIMAC, GIM-UEMOA, Verve) et internationales (Visa, Mastercard)."""

from __future__ import annotations

import re
from typing import Any

from wezas_core.envelope import Envelope, ErrorCode, Warning_, failure, success
from wezas_core.models import LocalizedName

# Schémas de réseaux de cartes bancaires et plages BIN
CARD_NETWORKS: list[dict[str, Any]] = [
    {
        "id": "gimac",
        "nom": "GIMAC",
        "region": "CEMAC (Afrique Centrale)",
        "pays": ["CM", "GA", "CG", "TD", "CF", "GQ"],
        "type": "regional",
        # Les cartes GIMAC utilisent les BIN préfixes 5054, 6271 ou 9870
        "bin_regex": r"^(505485|505486|505487|505488|627188|9870\d{2})",
        "lengths": [16],
        "luhn": True,
    },
    {
        "id": "gim_uemoa",
        "nom": "GIM-UEMOA",
        "region": "UEMOA (Afrique de l'Ouest)",
        "pays": ["CI", "SN", "BJ", "BF", "ML", "NE", "TG", "GW"],
        "type": "regional",
        # Les cartes interbancaires GIM-UEMOA utilisent notamment les plages BIN 5058, 6272 ou 9871
        "bin_regex": r"^(5058\d{2}|6272\d{2}|9871\d{2})",
        "lengths": [16],
        "luhn": True,
    },
    {
        "id": "verve",
        "nom": "Verve",
        "region": "Nigeria / Pan-africain",
        "pays": ["NG", "GH", "KE", "UG"],
        "type": "regional",
        # Verve card range: 506099-506198, 650002-650027, 507865-507964
        "bin_regex": r"^((506099|5061\d{2}|5078[6-9]\d|5079\d{2})|6500(0[2-9]|[12]\d))",
        "lengths": [16, 18, 19],
        "luhn": True,
    },
    {
        "id": "visa",
        "nom": "Visa",
        "region": "International",
        "pays": [],
        "type": "international",
        "bin_regex": r"^4",
        "lengths": [13, 16, 19],
        "luhn": True,
    },
    {
        "id": "mastercard",
        "nom": "Mastercard",
        "region": "International",
        "pays": [],
        "type": "international",
        # Mastercard ranges: 51-55 or 2221-2720
        "bin_regex": r"^(5[1-5]|2(22[1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720))",
        "lengths": [16],
        "luhn": True,
    },
]


def luhn_checksum_valid(number: str) -> bool:
    """Vérifie la formule de Luhn (modulo 10) standard ISO/IEC 7812-1."""
    if not number.isdigit():
        return False
    digits = [int(d) for d in number]
    checksum = 0
    reverse_digits = digits[::-1]

    for idx, d in enumerate(reverse_digits):
        if idx % 2 == 1:
            doubled = d * 2
            checksum += doubled - 9 if doubled > 9 else doubled
        else:
            checksum += d

    return checksum % 10 == 0


def mask_card_number(pan: str) -> str:
    """Masque le PAN pour respecter la norme PCI-DSS (garde 6 premiers et 4 derniers)."""
    clean = re.sub(r"\D", "", pan)
    if len(clean) <= 10:
        return clean[:2] + "*" * (len(clean) - 4) + clean[-2:] if len(clean) >= 4 else "****"
    return clean[:6] + "*" * (len(clean) - 10) + clean[-4:]


def validate_card(pan: str) -> Envelope:
    """
    Valide un numéro de carte bancaire (PAN), détecte le réseau (GIMAC, GIM-UEMOA, Verve, Visa, Mastercard)
    et applique la vérification Luhn selon ISO/IEC 7812.
    """
    if not pan or not isinstance(pan, str):
        return failure(
            ErrorCode.ENTREE_INVALIDE,
            "Le numéro de carte bancaire est requis et doit être une chaîne.",
            "Card number is required and must be a string.",
        )

    clean_pan = re.sub(r"[\s\-]", "", pan)

    if not clean_pan.isdigit():
        return failure(
            ErrorCode.NUMERO_INVALIDE,
            "Le numéro de carte contient des caractères non numériques.",
            "Card number contains non-numeric characters.",
            suggestions=["Vérifiez et retirez les caractères spéciaux ou lettres."],
        )

    if len(clean_pan) < 12 or len(clean_pan) > 19:
        return failure(
            ErrorCode.NUMERO_INVALIDE,
            f"Longueur de carte invalide ({len(clean_pan)} chiffres au lieu de 12 à 19).",
            f"Invalid card number length ({len(clean_pan)} digits instead of 12 to 19).",
        )

    # Identification du réseau par les plages BIN
    detected_network = None
    for net in CARD_NETWORKS:
        if re.search(net["bin_regex"], clean_pan):
            detected_network = net
            break

    # Vérification de l'algorithme de Luhn
    is_luhn_valid = luhn_checksum_valid(clean_pan)

    bin_number = clean_pan[:6]
    last_four = clean_pan[-4:]
    masked_pan = mask_card_number(clean_pan)

    network_name = detected_network["nom"] if detected_network else "Inconnu / Non répertorié"
    network_id = detected_network["id"] if detected_network else "unknown"
    network_type = detected_network["type"] if detected_network else "unknown"
    network_region = detected_network["region"] if detected_network else None
    supported_countries = detected_network["pays"] if detected_network else []

    length_valid = True
    if detected_network and len(clean_pan) not in detected_network["lengths"]:
        length_valid = False

    is_valid = is_luhn_valid and (length_valid if detected_network else True)

    warnings: list[Warning_] = []
    if detected_network is None:
        warnings.append(
            Warning_(
                code="RESEAU_NON_REPERTORIE",
                message=LocalizedName(
                    fr="Le préfixe BIN ne correspond à aucun réseau régional africain ni international standard.",
                    en="BIN prefix does not match any recognized African regional or standard international network.",
                ),
            )
        )
    elif not length_valid:
        warnings.append(
            Warning_(
                code="LONGUEUR_INATTENDUE",
                message=LocalizedName(
                    fr=f"La longueur {len(clean_pan)} est anormale pour le réseau {network_name}.",
                    en=f"Length {len(clean_pan)} is unusual for network {network_name}.",
                ),
            )
        )

    if not is_luhn_valid:
        warnings.append(
            Warning_(
                code="CLE_LUHN_INVALIDE",
                message=LocalizedName(
                    fr="La clé de contrôle Luhn (Mod 10) est invalide.",
                    en="Luhn checksum (Mod 10) is invalid.",
                ),
            )
        )

    data = {
        "valide": is_valid,
        "pan_masque": masked_pan,
        "bin": bin_number,
        "derniers_chiffres": last_four,
        "longueur": len(clean_pan),
        "reseau": {
            "id": network_id,
            "nom": network_name,
            "type": network_type,
            "region": network_region,
            "pays_associes": supported_countries,
        },
        "luhn_valide": is_luhn_valid,
    }

    return success(
        data=data,
        source="ISO/IEC 7812, spécifications GIMAC / GIM-UEMOA / Interswitch Verve",
        confiance="haute" if (detected_network and is_valid) else "moyenne",
        avertissements=warnings,
    )
