"""Conversion de devises hors ligne : XAF / XOF / EUR / USD (Epic E4)."""

from __future__ import annotations

import datetime as dt
from decimal import Decimal, InvalidOperation
from fractions import Fraction
from importlib import resources
from typing import Any

import yaml

from wezas_core.envelope import Envelope, ErrorCode, Warning_, failure, success
from wezas_core.i18n import t

# Unités de chaque devise pour 1 EUR (parité fixe, taux exact).
FIXED_PER_EUR: dict[str, Fraction] = {
    "EUR": Fraction(1),
    "XAF": Fraction(655957, 1000),
    "XOF": Fraction(655957, 1000),
}
DECIMALS: dict[str, int] = {"EUR": 2, "USD": 2, "XAF": 0, "XOF": 0}

AMBIGUOUS = {"FCFA": ["XAF", "XOF"], "CFA": ["XAF", "XOF"], "F CFA": ["XAF", "XOF"]}
SUPPORTED_CURRENCIES = ["EUR", "XAF", "XOF", "USD"]
MAX_AMOUNT = Decimal("1e15")

SOURCE_FIXED = "Parité fixe 1 EUR = 655,957 XAF = 655,957 XOF (coopération monétaire zone franc)"

# Chargement paresseux des taux flottants de repli
_RATES_CACHE: dict[str, Any] | None = None


def _get_rates_data() -> dict[str, Any]:
    global _RATES_CACHE
    if _RATES_CACHE is None:
        try:
            data_file = resources.files("wezas_core").joinpath("data").joinpath("rates.yaml")
            content = data_file.read_text(encoding="utf-8")
            _RATES_CACHE = yaml.safe_load(content).get("rates", {})
        except Exception:
            _RATES_CACHE = {}
    return _RATES_CACHE or {}


def _to_decimal(amount: Any) -> Decimal:
    if isinstance(amount, bool):
        raise ValueError("booléen")
    value = Decimal(str(amount).strip().replace(",", ".").replace(" ", ""))
    if not value.is_finite():
        raise ValueError("non fini")
    return value


def _fraction_to_decimal(value: Fraction, places: int) -> Decimal:
    scaled = value * 10**places
    q, r = divmod(scaled.numerator, scaled.denominator)
    if 2 * r >= scaled.denominator:  # arrondi au plus proche, moitié vers le haut
        q += 1
    return Decimal(q).scaleb(-places)


def _pair(key: str, **params: Any) -> tuple[str, str]:
    m = t(key, **params)
    return m.fr, m.en


def convert(
    amount: Any,
    de: str,
    vers: str,
    taux: float | str | None = None,
) -> Envelope:
    """Convertit `amount` de la devise `de` vers `vers` (XAF, XOF, EUR, USD)."""
    codes: list[str] = []
    for label, raw in (("de", de), ("vers", vers)):
        code = (raw or "").strip().upper() if isinstance(raw, str) else ""
        if code in AMBIGUOUS:
            return failure(
                ErrorCode.DEVISE_NON_SUPPORTEE,
                *_pair("CURRENCY_AMBIGUOUS", entree=raw),
                details={"parametre": label, "entree": raw},
                suggestions=AMBIGUOUS[code],
            )
        if code not in SUPPORTED_CURRENCIES:
            return failure(
                ErrorCode.DEVISE_NON_SUPPORTEE,
                *_pair("CURRENCY_UNSUPPORTED", entree=raw, disponibles="XAF, XOF, EUR, USD"),
                details={"parametre": label, "entree": raw},
                suggestions=sorted(SUPPORTED_CURRENCIES),
            )
        codes.append(code)
    src, dst = codes

    # Validation du montant
    try:
        value = _to_decimal(amount)
    except (InvalidOperation, ValueError, TypeError):
        return failure(
            ErrorCode.MONTANT_INVALIDE,
            *_pair("AMOUNT_UNREADABLE", entree=amount),
            details={"entree": str(amount)},
        )
    if value < 0 or value > MAX_AMOUNT:
        return failure(
            ErrorCode.MONTANT_INVALIDE,
            *_pair("AMOUNT_OUT_OF_RANGE"),
            details={"entree": str(amount)},
        )

    # Déterminer les taux par rapport à EUR
    rates_dict = dict(FIXED_PER_EUR)
    warnings: list[Warning_] = []
    source = SOURCE_FIXED
    confiance: str = "haute"
    date_taux: str | None = None
    is_custom_rate = False

    # Validation du taux personnalisé (WAT-020)
    if taux is not None:
        try:
            custom_rate = _to_decimal(taux)
            if custom_rate <= 0:
                raise ValueError()
        except (InvalidOperation, ValueError, TypeError):
            return failure(
                ErrorCode.TAUX_INVALIDE,
                *_pair("RATE_INVALID"),
                details={"taux_fourni": str(taux)},
            )
        is_custom_rate = True

    # Gestion de l'USD (WAT-019)
    if "USD" in (src, dst):
        if is_custom_rate:
            # L'utilisateur a fourni le taux direct de conversion (de -> vers)
            rate_frac = Fraction(custom_rate)
            exact = Fraction(value) * rate_frac
            result = _fraction_to_decimal(exact, DECIMALS[dst])
            return success(
                {
                    "montant": str(value),
                    "de": src,
                    "vers": dst,
                    "resultat": str(result),
                    "taux": str(_fraction_to_decimal(rate_frac, 10).normalize()),
                    "taux_personnalise": True,
                    "parite_fixe": False,
                },
                source="Taux personnalisé fourni par l'utilisateur",
                confiance="haute",
            )
        else:
            # Utilisation du taux de repli hors ligne
            rates_data = _get_rates_data()
            usd_info = rates_data.get("USD", {})
            usd_per_eur = usd_info.get("per_eur", 1.0850)
            date_taux = str(usd_info.get("date", "2026-10-21"))
            source = usd_info.get("source", "Taux indicatif hors ligne")
            rates_dict["USD"] = Fraction(str(usd_per_eur))
            confiance = "moyenne"

            warnings.append(
                Warning_(
                    code="TAUX_INDICATIF_HORS_LIGNE",
                    message=t("CURRENCY_RATE_OUTDATED", devise="USD", date=date_taux),
                )
            )

    rate = rates_dict[dst] / rates_dict[src]
    exact = Fraction(value) * rate
    result = _fraction_to_decimal(exact, DECIMALS[dst])

    out_data: dict[str, Any] = {
        "montant": str(value),
        "de": src,
        "vers": dst,
        "resultat": str(result),
        "taux": str(_fraction_to_decimal(rate, 10).normalize()),
        "parite_fixe": ("USD" not in (src, dst)),
    }
    if date_taux:
        out_data["date_taux"] = date_taux

    return success(
        out_data,
        source=source,
        derniere_verification=dt.date.fromisoformat(date_taux) if date_taux else None,
        confiance=confiance,  # type: ignore[arg-type]
        avertissements=warnings,
    )
