"""Validation et calcul d'algorithme NUBAN (Nigeria Uniform Bank Account Number).

Spécification officielle de la Central Bank of Nigeria (CBN) :
- Code banque (3 chiffres pour DMB ou 6 chiffres pour OFI/MFB)
- Numéro de compte série (9 premiers chiffres du compte à 10 chiffres)
- Algorithme Modulo 10 avec poids cycliques (3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3...)
- Clé de contrôle = 10 - (Somme % 10) (si résultat == 10, alors 0)
"""

from __future__ import annotations

import re
from typing import Any

from wezas_core.envelope import Envelope, ErrorCode, Warning_, failure, success
from wezas_core.i18n import t
from wezas_core.rib import _get_banks_data


def compute_nuban_check_digit(bank_code: str, serial_number: str) -> int:
    """
    Calcule le chiffre de contrôle NUBAN selon la formule officielle CBN :
    1. Si bank_code fait 3 chiffres, il est préfixé par 000 (ou utilisé directement avec poids).
    2. Format standard CBN :
       Code banque (3 chiffres) + Numéro de série (9 chiffres) = 12 chiffres au total.
       Poids CBN : [3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3]
       Si code OFI/MFB à 6 chiffres : [3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3]
    """
    clean_bank = re.sub(r"\D", "", bank_code)
    clean_serial = re.sub(r"\D", "", serial_number)

    if len(clean_bank) == 3:
        # Standard CBN DMB (Commercial Banks) : 3 chiffres + 9 chiffres = 12 chiffres
        weights = [3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3]
        digits_str = clean_bank + clean_serial
    elif len(clean_bank) == 5 or len(clean_bank) == 6:
        # OFI / MFB (Microfinance & FinTech) : 5 ou 6 chiffres + 9 chiffres
        padded_bank = clean_bank.zfill(6)
        weights = [3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3, 3, 7, 3]
        digits_str = padded_bank + clean_serial
    else:
        # Poids alternés standards
        digits_str = clean_bank + clean_serial
        weights = [3 if i % 2 == 0 else 7 for i in range(len(digits_str))]

    total = sum(int(d) * w for d, w in zip(digits_str, weights, strict=False))
    remainder = total % 10
    check_digit = 0 if remainder == 0 else 10 - remainder
    return check_digit


def validate_nuban(
    bank_code: str,
    account_number: str,
    country: str = "NG",
) -> Envelope:
    """
    Valide un compte NUBAN à 10 chiffres pour le Nigeria (CBN) ou le Ghana (BoG).
    """
    clean_bank = re.sub(r"\D", "", bank_code)
    clean_acc = re.sub(r"\s+", "", account_number)

    if not (3 <= len(clean_bank) <= 6):
        return failure(
            ErrorCode.ENTREE_INVALIDE,
            f"Code banque invalide (attendu: 3 ou 5-6 chiffres, reçu: '{bank_code}').",
            f"Invalid bank code (expected: 3 or 5-6 digits, got: '{bank_code}').",
            details={"composante": "bank_code", "valeur": bank_code},
        )

    if len(clean_acc) != 10 or not clean_acc.isdigit():
        return failure(
            ErrorCode.ENTREE_INVALIDE,
            f"Numéro de compte NUBAN invalide (attendu: 10 chiffres, reçu: '{clean_acc}').",
            f"Invalid NUBAN account number (expected: 10 digits, got: '{clean_acc}').",
            details={"composante": "account_number", "valeur": clean_acc},
        )

    serial = clean_acc[:9]
    provided_check_digit = int(clean_acc[9])
    calculated_check_digit = compute_nuban_check_digit(clean_bank, serial)

    valide = (provided_check_digit == calculated_check_digit)

    # Lookup dans la base de banques
    banks_repo = _get_banks_data()
    # Recherche par cbn_code ou clé formatée (ex: NG044 ou NG090267)
    found_bank: dict[str, Any] | None = None
    target_key = f"{country.upper()}{clean_bank}"
    if target_key in banks_repo:
        found_bank = banks_repo[target_key]
    else:
        for b_entry in banks_repo.values():
            if b_entry.get("pays") == country.upper() and b_entry.get("cbn_code") == clean_bank:
                found_bank = b_entry
                break

    warnings: list[Warning_] = []
    if not found_bank:
        warnings.append(
            Warning_(
                code="BANQUE_NON_REPERTORIEE",
                message=t("BANK_NOT_FOUND", code=clean_bank),
            )
        )

    data: dict[str, Any] = {
        "valide": valide,
        "compte_complet": clean_acc,
        "code_banque": clean_bank,
        "numero_serie": serial,
        "cle_fournie": str(provided_check_digit),
        "cle_calculee": str(calculated_check_digit),
        "norme": "CBN NUBAN (Nigeria Uniform Bank Account Number)",
        "banque": {
            "nom": found_bank.get("nom") if found_bank else "Banque inconnue",
            "bic": found_bank.get("bic") if found_bank else None,
            "pays": country.upper(),
            "zone": found_bank.get("zone", "CBN") if found_bank else "CBN",
        },
    }

    if not valide:
        msg_fr = (
            f"Clé de contrôle NUBAN invalide. Chiffre fourni: {provided_check_digit}, "
            f"calculé: {calculated_check_digit}."
        )
        msg_en = (
            f"Invalid NUBAN check digit. Provided: {provided_check_digit}, "
            f"expected: {calculated_check_digit}."
        )
        return failure(
            ErrorCode.IDENTIFIANT_INVALIDE,
            msg_fr,
            msg_en,
            details=data,
            suggestions=[f"{serial}{calculated_check_digit}"],
        )

    return success(
        data,
        source="Central Bank of Nigeria (CBN) Revised NUBAN Standards & BOZ/BOG Specifications",
        confiance="haute" if found_bank else "moyenne",
        avertissements=warnings,
    )
