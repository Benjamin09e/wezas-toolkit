"""Conversion de devises hors ligne : XAF / XOF / EUR à parité fixe (1 EUR = 655,957 XAF/XOF)."""

from __future__ import annotations

from decimal import Decimal, InvalidOperation
from fractions import Fraction
from typing import Any

from wezas_core.envelope import Envelope, ErrorCode, failure, success
from wezas_core.i18n import t

# Unités de chaque devise pour 1 EUR (parité fixe, taux exact).
FIXED_PER_EUR: dict[str, Fraction] = {
    "EUR": Fraction(1),
    "XAF": Fraction(655957, 1000),
    "XOF": Fraction(655957, 1000),
}
DECIMALS: dict[str, int] = {"EUR": 2, "XAF": 0, "XOF": 0}

AMBIGUOUS = {"FCFA": ["XAF", "XOF"], "CFA": ["XAF", "XOF"], "F CFA": ["XAF", "XOF"]}
MAX_AMOUNT = Decimal("1e15")

SOURCE = "Parité fixe 1 EUR = 655,957 XAF = 655,957 XOF (coopération monétaire zone franc)"


def _to_decimal(amount: Any) -> Decimal:
    if isinstance(amount, bool):
        raise ValueError("booléen")
    # str(float) évite les artefacts binaires (0.1 -> 0.1 et non 0.1000000000000000055…)
    value = Decimal(str(amount).strip().replace(",", ".").replace(" ", ""))
    if not value.is_finite():
        raise ValueError("non fini")
    return value


def _quantum(code: str) -> Decimal:
    return Decimal(1).scaleb(-DECIMALS[code])


def _fraction_to_decimal(value: Fraction, places: int) -> Decimal:
    scaled = value * 10**places
    q, r = divmod(scaled.numerator, scaled.denominator)
    if 2 * r >= scaled.denominator:  # arrondi au plus proche, moitié vers le haut
        q += 1
    return Decimal(q).scaleb(-places)


def _pair(key: str, **params: Any) -> tuple[str, str]:
    m = t(key, **params)
    return m.fr, m.en


def convert(amount: Any, de: str, vers: str) -> Envelope:
    """Convertit `amount` de la devise `de` vers `vers` (XAF, XOF, EUR)."""
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
        if code not in FIXED_PER_EUR:
            return failure(
                ErrorCode.DEVISE_NON_SUPPORTEE,
                *_pair("CURRENCY_UNSUPPORTED", entree=raw, disponibles="XAF, XOF, EUR"),
                details={"parametre": label, "entree": raw},
                suggestions=sorted(FIXED_PER_EUR),
            )
        codes.append(code)
    src, dst = codes

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

    rate = FIXED_PER_EUR[dst] / FIXED_PER_EUR[src]
    exact = Fraction(value) * rate
    result = _fraction_to_decimal(exact, DECIMALS[dst])

    return success(
        {
            "montant": str(value),
            "de": src,
            "vers": dst,
            "resultat": str(result),
            "taux": str(_fraction_to_decimal(rate, 10).normalize()),
            "parite_fixe": True,
        },
        source=SOURCE,
        confiance="haute",
    )
