"""Validation et décodage de Relevé d'Identité Bancaire (RIB) pour les zones UEMOA et CEMAC."""

from __future__ import annotations

import re
from importlib import resources
from typing import Any

import yaml

from wezas_core.envelope import Envelope, ErrorCode, Warning_, failure, success
from wezas_core.i18n import t

_BANKS_CACHE: dict[str, Any] | None = None

# Table officielle de conversion des lettres en chiffres pour le calcul de la clé RIB (norme bancaire)
# A,J = 1 ; B,K,S = 2 ; C,L,T = 3 ; D,M,U = 4 ; E,N,V = 5 ; F,O,W = 6 ; G,P,X = 7 ; H,Q,Y = 8 ; I,R,Z = 9
LETTER_TO_DIGIT: dict[str, str] = {
    "A": "1", "B": "2", "C": "3", "D": "4", "E": "5", "F": "6", "G": "7", "H": "8", "I": "9",
    "J": "1", "K": "2", "L": "3", "M": "4", "N": "5", "O": "6", "P": "7", "Q": "8", "R": "9",
    "S": "2", "T": "3", "U": "4", "V": "5", "W": "6", "X": "7", "Y": "8", "Z": "9",
}


def _get_banks_data() -> dict[str, Any]:
    global _BANKS_CACHE
    if _BANKS_CACHE is None:
        try:
            data_file = resources.files("wezas_core").joinpath("data").joinpath("banks.yaml")
            content = data_file.read_text(encoding="utf-8")
            _BANKS_CACHE = yaml.safe_load(content).get("banks", {})
        except Exception:
            _BANKS_CACHE = {}
    return _BANKS_CACHE or {}


def _transliterate_to_digits(val: str) -> str:
    """Remplace chaque lettre par son équivalent numérique bancaire."""
    res: list[str] = []
    for char in val.upper():
        if char.isdigit():
            res.append(char)
        elif char in LETTER_TO_DIGIT:
            res.append(char[0] if char.isdigit() else LETTER_TO_DIGIT[char])
        else:
            res.append("0")
    return "".join(res)


def compute_rib_key(code_banque: str, code_guichet: str, numero_compte: str) -> str:
    """
    Calcule la clé RIB officielle par l'algorithme modulo 97 :
    Clé = 97 - ((89 * Banque + 15 * Guichet + 3 * Compte) % 97)
    """
    b_num = int(_transliterate_to_digits(code_banque))
    g_num = int(_transliterate_to_digits(code_guichet))
    c_num = int(_transliterate_to_digits(numero_compte))

    reste = (89 * b_num + 15 * g_num + 3 * c_num) % 97
    cle = 97 - reste
    return f"{cle:02d}"


def validate_rib(
    code_banque: str,
    code_guichet: str,
    numero_compte: str,
    cle_rib: str,
) -> Envelope:
    """
    Valide et décode les composantes d'un RIB bancaire UEMOA ou CEMAC.
    """
    clean_banque = re.sub(r"\s+", "", code_banque).upper()
    clean_guichet = re.sub(r"\s+", "", code_guichet).upper()
    clean_compte = re.sub(r"\s+", "", numero_compte).upper()
    clean_cle = re.sub(r"\s+", "", cle_rib).strip()

    # Vérification des longueurs standards (Banque: 5 car, Guichet: 5 car, Compte: 11-12 car, Clé: 2 car)
    if len(clean_banque) != 5:
        return failure(
            ErrorCode.ENTREE_INVALIDE,
            f"Code banque invalide (attendu: 5 caractères, reçu: {len(clean_banque)}).",
            f"Invalid bank code (expected: 5 chars, got: {len(clean_banque)}).",
            details={"composante": "code_banque", "valeur": clean_banque},
        )

    if len(clean_guichet) != 5 or not clean_guichet.isdigit():
        return failure(
            ErrorCode.ENTREE_INVALIDE,
            f"Code guichet invalide (attendu: 5 chiffres, reçu: {clean_guichet}).",
            f"Invalid branch code (expected: 5 digits, got: {clean_guichet}).",
            details={"composante": "code_guichet", "valeur": clean_guichet},
        )

    if not (11 <= len(clean_compte) <= 12):
        return failure(
            ErrorCode.ENTREE_INVALIDE,
            f"Numéro de compte invalide (attendu: 11 ou 12 caractères, reçu: {len(clean_compte)}).",
            f"Invalid account number (expected: 11 or 12 chars, got: {len(clean_compte)}).",
            details={"composante": "numero_compte", "valeur": clean_compte},
        )

    if len(clean_cle) != 2 or not clean_cle.isdigit():
        return failure(
            ErrorCode.ENTREE_INVALIDE,
            f"Clé RIB invalide (attendu: 2 chiffres, reçu: '{clean_cle}').",
            f"Invalid RIB key (expected: 2 digits, got: '{clean_cle}').",
            details={"composante": "cle_rib", "valeur": clean_cle},
        )

    # Calcul de la clé théorique
    cle_theorique = compute_rib_key(clean_banque, clean_guichet, clean_compte)
    cle_valide = (cle_theorique == clean_cle)

    # Recherche de la banque dans le référentiel
    banks_repo = _get_banks_data()
    bank_info = banks_repo.get(clean_banque)

    warnings: list[Warning_] = []
    if not bank_info:
        warnings.append(
            Warning_(
                code="BANQUE_NON_REPERTORIEE",
                message=t("BANK_NOT_FOUND", code=clean_banque),
            )
        )

    # Détection du pays si les 2 premières lettres sont un code ISO (ex: CI, SN, GA, CM)
    iso_prefix = clean_banque[:2]
    pays_detecte = bank_info.get("pays") if bank_info else (iso_prefix if iso_prefix.isalpha() else None)
    zone_detectee = bank_info.get("zone") if bank_info else (
        "UEMOA" if pays_detecte in ["CI", "SN", "BJ", "BF", "ML", "TG", "NE", "GW"] else
        "CEMAC" if pays_detecte in ["CM", "GA", "CG", "TD", "CF", "GQ"] else None
    )

    data: dict[str, Any] = {
        "valide": cle_valide,
        "cle_fournie": clean_cle,
        "cle_calculee": cle_theorique,
        "rib_complet": f"{clean_banque} {clean_guichet} {clean_compte} {clean_cle}",
        "code_banque": clean_banque,
        "code_guichet": clean_guichet,
        "numero_compte": clean_compte,
        "banque": {
            "nom": bank_info.get("nom") if bank_info else "Banque inconnue",
            "bic": bank_info.get("bic") if bank_info else None,
            "pays": pays_detecte,
            "zone": zone_detectee,
        },
    }

    if not cle_valide:
        return failure(
            ErrorCode.IDENTIFIANT_INVALIDE,
            f"Clé RIB incorrecte. La clé fournie est '{clean_cle}' alors que la clé calculée est '{cle_theorique}'.",
            f"Incorrect RIB key. Provided key is '{clean_cle}', expected '{cle_theorique}'.",
            details=data,
            suggestions=[f"Corriger la clé RIB en '{cle_theorique}'"],
        )

    return success(
        data,
        source="Norme bancaire UEMOA/CEMAC & Référentiel Wezas",
        confiance="haute" if bank_info else "moyenne",
        avertissements=warnings,
    )
