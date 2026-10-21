"""Calcul de TVA et taxes locales en Afrique subsaharienne (WAT-041)."""

from __future__ import annotations

from decimal import Decimal, InvalidOperation
from importlib import resources
from typing import Any, Literal

import yaml

from wezas_core.envelope import Envelope, ErrorCode, failure, success
from wezas_core.i18n import t
from wezas_core.normalize import country_not_found, resolve_country

_VAT_CACHE: dict[str, Any] | None = None
MAX_AMOUNT = Decimal("1e15")


def _pair(key: str, **params: Any) -> tuple[str, str]:
    m = t(key, **params)
    return m.fr, m.en


def _get_vat_data() -> dict[str, Any]:
    global _VAT_CACHE
    if _VAT_CACHE is None:
        try:
            data_file = resources.files("wezas_core").joinpath("data").joinpath("vat.yaml")
            content = data_file.read_text(encoding="utf-8")
            _VAT_CACHE = yaml.safe_load(content).get("vat_rates", {})
        except Exception:
            _VAT_CACHE = {}
    return _VAT_CACHE or {}


def _to_decimal(amount: Any) -> Decimal:
    if isinstance(amount, bool):
        raise ValueError("booléen non accepté")
    raw = str(amount).strip().replace(" ", "").replace("\u00a0", "").replace("\u202f", "")
    if "," in raw and "." not in raw:
        raw = raw.replace(",", ".")
    elif "," in raw and "." in raw:
        if raw.rfind(".") > raw.rfind(","):
            raw = raw.replace(",", "")
        else:
            raw = raw.replace(".", "").replace(",", ".")
    val = Decimal(raw)
    if not val.is_finite():
        raise ValueError("non fini")
    return val


def calculate_vat(
    montant: Any,
    pays: str,
    type_taux: Literal["standard", "reduit", "super_reduit"] = "standard",
    mode: Literal["ht", "ttc"] = "ht",
    taux_personnalise: float | str | None = None,
) -> Envelope:
    """Calcule la TVA (HT vers TTC ou TTC vers HT) pour un pays donné."""
    country_obj = resolve_country(pays)
    if not country_obj:
        return country_not_found(pays)

    # Validation du montant
    try:
        val = _to_decimal(montant)
    except (InvalidOperation, ValueError, TypeError):
        return failure(
            ErrorCode.MONTANT_INVALIDE,
            *_pair("AMOUNT_UNREADABLE", entree=montant),
            details={"entree": str(montant)},
        )

    if val < 0 or val > MAX_AMOUNT:
        return failure(
            ErrorCode.MONTANT_INVALIDE,
            *_pair("AMOUNT_OUT_OF_RANGE"),
            details={"entree": str(montant)},
        )

    vat_data = _get_vat_data()
    country_vat = vat_data.get(country_obj.iso2)

    taux_decimal: Decimal
    source: str
    nom_taxe: str = "TVA"

    if taux_personnalise is not None:
        try:
            taux_decimal = _to_decimal(taux_personnalise)
            if taux_decimal < 0 or taux_decimal > Decimal("1"):
                raise ValueError()
        except (InvalidOperation, ValueError, TypeError):
            return failure(
                ErrorCode.TAUX_INVALIDE,
                *_pair("RATE_INVALID"),
                details={"taux_fourni": str(taux_personnalise)},
            )
        source = "Taux personnalisé fourni par l'utilisateur"
    else:
        if not country_vat:
            return failure(
                ErrorCode.DONNEES_INDISPONIBLES,
                *_pair("COUNTRY_UNKNOWN", entree=f"TVA {country_obj.iso2}"),
                details={"pays": country_obj.iso2},
            )

        if type_taux not in country_vat:
            type_taux = "standard"

        raw_rate = country_vat.get(type_taux, country_vat.get("standard", 0.18))
        taux_decimal = Decimal(str(raw_rate))
        source = country_vat.get("source", "Code Général des Impôts")
        nom_taxe = country_vat.get("nom_local", "TVA")

    # Calculs HT, TTC et Montant Taxe
    # Décimales selon la devise du pays
    # En zone XAF/XOF : généralement arrondi à l'entier (0 décimales)
    decimals = 0 if country_obj.currency in ("XAF", "XOF") else 2
    quantize_format = Decimal("1") if decimals == 0 else Decimal("10") ** -decimals

    if mode == "ht":
        ht = val
        taxe = (ht * taux_decimal).quantize(quantize_format)
        ttc = ht + taxe
    else:  # mode == "ttc"
        ttc = val
        ht = (ttc / (Decimal("1") + taux_decimal)).quantize(quantize_format)
        taxe = ttc - ht

    out_data = {
        "pays": country_obj.iso2,
        "devise": country_obj.currency,
        "mode": mode,
        "nom_taxe": nom_taxe,
        "type_taux": type_taux,
        "taux": float(taux_decimal),
        "taux_pourcentage": f"{taux_decimal * 100:.2f}%".rstrip("0").rstrip("."),
        "montant_ht": str(ht.quantize(quantize_format)),
        "montant_taxe": str(taxe.quantize(quantize_format)),
        "montant_ttc": str(ttc.quantize(quantize_format)),
    }

    return success(
        out_data,
        source=source,
        derniere_verification=country_obj.last_verified,
        confiance="haute",
    )
