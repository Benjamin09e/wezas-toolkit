"""Validation et décodage des identifiants bancaires IBAN pour les pays africains (ISO 13616).

Pays africains utilisant la norme officielle ISO IBAN :
- MA (Maroc) : 28 caractères (MA + 2 chiffres clé + 24 caractères BBAN/RIB)
- TN (Tunisie) : 24 caractères (TN + 2 chiffres clé + 20 caractères BBAN/RIB)
- MR (Mauritanie) : 27 caractères (MR + 2 chiffres clé + 23 caractères BBAN)
- MU (Maurice) : 30 caractères (MU + 2 chiffres clé + 26 caractères BBAN)
- SC (Seychelles) : 31 caractères (SC + 2 chiffres clé + 27 caractères BBAN)
- ST (Sao Tomé-et-Principe) : 25 caractères (ST + 2 chiffres clé + 21 caractères BBAN)
- EG (Égypte) : 29 caractères (EG + 2 chiffres clé + 25 caractères BBAN)
- SD (Soudan) : 18 caractères (SD + 2 chiffres clé + 14 caractères BBAN)
- SO (Somalie) : 23 caractères (SO + 2 chiffres clé + 19 caractères BBAN)
- LY (Libye) : 25 caractères (LY + 2 chiffres clé + 21 caractères BBAN)
"""

from __future__ import annotations

import re
from typing import Any

from wezas_core.envelope import Envelope, ErrorCode, Warning_, failure, success
from wezas_core.i18n import t
from wezas_core.rib import _get_banks_data

# Spécifications de longueur et décomposition IBAN africains selon l'annuaire SWIFT / ISO 13616
AFRICAN_IBAN_SPECS: dict[str, dict[str, Any]] = {
    "MA": {
        "pays": "Maroc",
        "length": 28,
        "bank_slice": (4, 7),     # 3 chiffres banque
        "branch_slice": (7, 11),  # 4 chiffres guichet/ville
        "account_slice": (11, 26),
        "national_key_slice": (26, 28),
    },
    "TN": {
        "pays": "Tunisie",
        "length": 24,
        "bank_slice": (4, 6),     # 2 chiffres banque
        "branch_slice": (6, 9),   # 3 chiffres guichet
        "account_slice": (9, 22), # 13 chiffres compte
        "national_key_slice": (22, 24),
    },
    "MR": {
        "pays": "Mauritanie",
        "length": 27,
        "bank_slice": (4, 9),
        "branch_slice": (9, 14),
        "account_slice": (14, 25),
        "national_key_slice": (25, 27),
    },
    "EG": {
        "pays": "Égypte",
        "length": 29,
        "bank_slice": (4, 8),
        "branch_slice": (8, 12),
        "account_slice": (12, 29),
        "national_key_slice": None,
    },
    "MU": {
        "pays": "Maurice",
        "length": 30,
        "bank_slice": (4, 8),
        "branch_slice": (8, 10),
        "account_slice": (10, 28),
        "national_key_slice": None,
    },
    "SC": {
        "pays": "Seychelles",
        "length": 31,
        "bank_slice": (4, 8),
        "branch_slice": (8, 12),
        "account_slice": (12, 28),
        "national_key_slice": None,
    },
}


def compute_iban_mod97(iban: str) -> int:
    """
    Calcule le reste modulo 97 de l'IBAN selon ISO/IEC 7064 (MOD 97-10) :
    1. Déplacer les 4 premiers caractères (code pays + clé) à la fin.
    2. Convertir les lettres en chiffres (A=10, B=11 ... Z=35).
    3. Calculer n % 97.
    """
    rearranged = iban[4:] + iban[:4]
    numeric_str = "".join(
        str(ord(c) - 55) if c.isalpha() else c
        for c in rearranged.upper()
    )
    return int(numeric_str) % 97


def validate_african_iban(iban_str: str) -> Envelope:
    """Valide et extrait les composants d'un IBAN pour un pays africain."""
    clean_iban = re.sub(r"\s+", "", iban_str).upper()

    if len(clean_iban) < 4:
        return failure(
            ErrorCode.ENTREE_INVALIDE,
            "IBAN trop court.",
            "IBAN is too short.",
            details={"iban": clean_iban},
        )

    iso_country = clean_iban[:2]
    if not iso_country.isalpha():
        return failure(
            ErrorCode.ENTREE_INVALIDE,
            "L'IBAN doit débuter par un code pays ISO à 2 lettres.",
            "IBAN must start with a 2-letter ISO country code.",
            details={"iban": clean_iban},
        )

    spec = AFRICAN_IBAN_SPECS.get(iso_country)
    if not spec:
        return failure(
            ErrorCode.DONNEES_INDISPONIBLES,
            f"Le pays '{iso_country}' n'utilise pas la norme IBAN ou n'est pas encore supporté.",
            f"Country '{iso_country}' does not use IBAN standard or is not supported yet.",
            details={"pays": iso_country},
            suggestions=list(AFRICAN_IBAN_SPECS.keys()),
        )

    expected_len = spec["length"]
    if len(clean_iban) != expected_len:
        msg_fr = (
            f"Longueur IBAN invalide pour {spec['pays']} "
            f"(attendu: {expected_len} caractères, reçu: {len(clean_iban)})."
        )
        msg_en = (
            f"Invalid IBAN length for {spec['pays']} "
            f"(expected: {expected_len} chars, got: {len(clean_iban)})."
        )
        return failure(
            ErrorCode.ENTREE_INVALIDE,
            msg_fr,
            msg_en,
            details={
                "pays": iso_country,
                "longueur_recue": len(clean_iban),
                "longueur_attendue": expected_len,
            },
        )

    # Vérification Modulo 97 (MOD 97-10 standard ISO 7064)
    # Pour un IBAN valide, compute_iban_mod97 doit valoir 1
    mod97_res = compute_iban_mod97(clean_iban)
    is_checksum_valid = (mod97_res == 1)

    # Décomposition des composants BBAN
    b_start, b_end = spec["bank_slice"]
    code_banque = clean_iban[b_start:b_end]

    code_guichet = None
    if spec.get("branch_slice"):
        g_start, g_end = spec["branch_slice"]
        code_guichet = clean_iban[g_start:g_end]

    num_compte = None
    if spec.get("account_slice"):
        a_start, a_end = spec["account_slice"]
        num_compte = clean_iban[a_start:a_end]

    cle_nationale = None
    if spec.get("national_key_slice"):
        k_start, k_end = spec["national_key_slice"]
        cle_nationale = clean_iban[k_start:k_end]

    # Recherche dans le référentiel des banques
    banks_repo = _get_banks_data()
    bank_key = f"{iso_country}{code_banque}"
    bank_entry = banks_repo.get(bank_key)

    warnings: list[Warning_] = []
    if not bank_entry:
        warnings.append(
            Warning_(
                code="BANQUE_NON_REPERTORIEE",
                message=t("BANK_NOT_FOUND", code=f"{iso_country}{code_banque}"),
            )
        )

    formatted_iban = " ".join(clean_iban[i:i + 4] for i in range(0, len(clean_iban), 4))

    data: dict[str, Any] = {
        "valide": is_checksum_valid,
        "iban_formate": formatted_iban,
        "iban_brut": clean_iban,
        "pays": {
            "iso2": iso_country,
            "nom": spec["pays"],
        },
        "cle_iban": clean_iban[2:4],
        "code_banque": code_banque,
        "code_guichet": code_guichet,
        "numero_compte": num_compte,
        "cle_rib_nationale": cle_nationale,
        "banque": {
            "nom": bank_entry.get("nom") if bank_entry else f"Banque {code_banque}",
            "bic": bank_entry.get("bic") if bank_entry else None,
            "zone": "IBAN",
        },
    }

    if not is_checksum_valid:
        return failure(
            ErrorCode.IDENTIFIANT_INVALIDE,
            "Clé de contrôle IBAN invalide (échec de l'algorithme MOD 97-10).",
            "Invalid IBAN check digits (MOD 97-10 validation failed).",
            details=data,
        )

    return success(
        data,
        source="Norme bancaire internationale ISO 13616 & Registre SWIFT IBAN",
        confiance="haute" if bank_entry else "moyenne",
        avertissements=warnings,
    )
