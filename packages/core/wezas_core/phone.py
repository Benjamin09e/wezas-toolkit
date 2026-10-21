"""Validation et parsing de numéros de téléphone pour l'Afrique (Epic E3)."""

from __future__ import annotations

from typing import Any

import yaml

from wezas_core.envelope import Envelope, ErrorCode, Warning_, failure, success
from wezas_core.i18n import t
from wezas_core.models import NumberRange
from wezas_core.normalize import (
    PhoneFormatError,
    country_not_found,
    normalize_phone,
    resolve_country,
)

# Chargement paresseux du registre des opérateurs
_OPERATORS: dict[str, dict[str, Any]] | None = None


def _get_operators() -> dict[str, dict[str, Any]]:
    global _OPERATORS
    if _OPERATORS is None:
        from importlib import resources

        try:
            data_file = resources.files("wezas_core").joinpath("data").joinpath("operators.yaml")
            content = data_file.read_text(encoding="utf-8")
            _OPERATORS = yaml.safe_load(content).get("operators", {})
        except Exception:
            _OPERATORS = {}
    return _OPERATORS or {}


def validate_phone(pays: str, numero: str) -> Envelope:
    """Valide un numéro de téléphone selon le plan national du pays donné."""
    country = resolve_country(pays)
    if not country:
        return country_not_found(pays)

    try:
        norm = normalize_phone(numero)
    except PhoneFormatError as err:
        return failure(
            ErrorCode.NUMERO_INVALIDE,
            f"Numéro illisible ou mal formé : « {numero} » ({err}).",
            f'Unreadable or malformed phone number: "{numero}" ({err}).',
            details={"entree": numero, "pays": country.iso2},
        )

    digits = norm.digits
    dial = country.dial_code.lstrip("+")

    # Si le numéro a été saisi sous forme internationale ou commence par l'indicatif pays
    if norm.international:
        if not digits.startswith(dial):
            return failure(
                ErrorCode.NUMERO_INVALIDE,
                f"L'indicatif saisi ne correspond pas à celui de "
                f"{country.name.fr} ({country.dial_code}).",
                f"The country code does not match {country.name.en} ({country.dial_code}).",
                details={"entree": numero, "indicatif_attendu": country.dial_code},
            )
        national_digits = digits[len(dial) :]
    else:
        # Vérifier si l'utilisateur a tapé l'indicatif sans le '+'
        if digits.startswith(dial) and len(digits) > country.numbering_plan.national_length:
            national_digits = digits[len(dial) :]
        else:
            national_digits = digits

    # Retirer le préfixe trunk national éventuel si présent (ex: 0 pour Gabon ou Sénégal)
    trunk = country.numbering_plan.trunk_prefix
    if trunk and national_digits.startswith(trunk):
        # Attention: au Gabon ou Congo, si la longueur sans trunk correspond au format E.164 attendu
        if len(national_digits) == country.numbering_plan.national_length + len(trunk):
            national_digits = national_digits[len(trunk) :]

    expected_len = country.numbering_plan.national_length
    if len(national_digits) != expected_len:
        # Le numéro n'a pas la bonne longueur : on renvoie ok=True mais valide=False (cf. WAT-002)
        return success(
            {
                "valide": False,
                "motif": (
                    f"Longueur invalide : {len(national_digits)} chiffres au lieu de {expected_len}"
                ),
                "numero_saisi": numero,
                "pays": country.iso2,
            },
            source=country.sources[0].label if country.sources else None,
            derniere_verification=country.last_verified,
            confiance="haute",
        )

    # Identifier la plage correspondante
    matched_range: NumberRange | None = None
    for r in country.numbering_plan.ranges:
        for p in r.prefixes:
            if national_digits.startswith(p):
                # Choisir la plage la plus spécifique (le préfixe le plus long)
                matched_len = max(
                    len(x) for x in matched_range.prefixes if national_digits.startswith(x)
                ) if matched_range else -1
                if matched_range is None or len(p) > matched_len:
                    matched_range = r

    if not matched_range:
        return success(
            {
                "valide": False,
                "motif": f"Préfixe non reconnu dans le plan de numérotation de {country.name.fr}",
                "numero_saisi": numero,
                "pays": country.iso2,
            },
            source=country.sources[0].label if country.sources else None,
            derniere_verification=country.last_verified,
            confiance="moyenne",
        )

    e164 = f"{country.dial_code}{national_digits}"
    format_national = f"{trunk or ''}{national_digits}"

    # Recherche opérateur et Mobile Money
    op_id = matched_range.operator
    operators_reg = _get_operators()
    op_info = operators_reg.get(op_id, {}) if op_id else {}

    op_nom = op_info.get("nom", op_id) if op_id else None
    mobile_money_list = op_info.get("mobile_money", [])

    warnings: list[Warning_] = []
    if matched_range.type == "mobile":
        warnings.append(
            Warning_(
                code="PORTABILITE_NUMERO",
                message=t("PHONE_PORTABILITY"),
            )
        )

    return success(
        {
            "valide": True,
            "e164": e164,
            "format_national": format_national,
            "type": matched_range.type,
            "operateur_probable": op_nom,
            "mobile_money": mobile_money_list,
            "pays": {
                "iso2": country.iso2,
                "nom": country.name.fr,
            },
        },
        source=country.sources[0].label if country.sources else None,
        derniere_verification=country.last_verified,
        confiance="moyenne" if matched_range.type == "mobile" else "haute",
    )
