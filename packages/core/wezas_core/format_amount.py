"""Formatage monétaire local pour devises africaines et internationales (WAT-040)."""

from __future__ import annotations

from decimal import Decimal, InvalidOperation
from typing import Any

from wezas_core.envelope import Envelope, ErrorCode, failure, success
from wezas_core.i18n import t
from wezas_core.normalize import resolve_country

# Configuration par défaut selon la devise
DEFAULT_CURRENCY_CONFIG: dict[str, dict[str, Any]] = {
    "XAF": {
        "symbole": "FCFA",
        "position": "apres",
        "decimales": 0,
        "separateur_milliers": " ",
        "separateur_decimal": ",",
    },
    "XOF": {
        "symbole": "FCFA",
        "position": "apres",
        "decimales": 0,
        "separateur_milliers": " ",
        "separateur_decimal": ",",
    },
    "EUR": {
        "symbole": "€",
        "position": "apres",
        "decimales": 2,
        "separateur_milliers": " ",
        "separateur_decimal": ",",
    },
    "USD": {
        "symbole": "$",
        "position": "avant",
        "decimales": 2,
        "separateur_milliers": ",",
        "separateur_decimal": ".",
    },
}

SUPPORTED_CURRENCIES = list(DEFAULT_CURRENCY_CONFIG.keys())
MAX_AMOUNT = Decimal("1e15")


def _pair(key: str, **params: Any) -> tuple[str, str]:
    m = t(key, **params)
    return m.fr, m.en


def _to_decimal(amount: Any) -> Decimal:
    if isinstance(amount, bool):
        raise ValueError("booléen non accepté")
    raw = str(amount).strip().replace(" ", "").replace("\u00a0", "").replace("\u202f", "")
    # Gérer la virgule décimale s'il n'y a pas de point ou si le point est séparateur de milliers
    if "," in raw and "." not in raw:
        raw = raw.replace(",", ".")
    elif "," in raw and "." in raw:
        # Ex: 1,000.50 ou 1.000,50
        if raw.rfind(".") > raw.rfind(","):
            raw = raw.replace(",", "")
        else:
            raw = raw.replace(".", "").replace(",", ".")
    val = Decimal(raw)
    if not val.is_finite():
        raise ValueError("non fini")
    return val


def format_amount(
    amount: Any,
    devise: str | None = None,
    pays: str | None = None,
    inclure_symbole: bool = True,
    decimales: int | None = None,
) -> Envelope:
    """Formate un montant numérique selon les règles locales du pays ou de la devise."""
    # Détermination du pays et de la devise
    currency_code: str | None = None
    country_obj = None

    if pays:
        country_obj = resolve_country(pays)
        if not country_obj:
            return failure(
                ErrorCode.PAYS_INCONNU,
                *_pair("COUNTRY_UNKNOWN", entree=pays),
                details={"pays": pays},
            )
        currency_code = country_obj.currency

    if devise:
        curr_candidate = devise.strip().upper()
        if curr_candidate in ("FCFA", "CFA", "F CFA"):
            if not currency_code:
                # Si le pays n'a pas été précisé pour lever l'ambiguïté XAF / XOF
                return failure(
                    ErrorCode.DEVISE_NON_SUPPORTEE,
                    *_pair("CURRENCY_AMBIGUOUS", entree=devise),
                    details={"devise": devise},
                    suggestions=["XAF", "XOF"],
                )
        else:
            currency_code = curr_candidate

    if not currency_code:
        # Par défaut si ni devise ni pays ne sont fournis
        currency_code = "XAF"

    if currency_code not in DEFAULT_CURRENCY_CONFIG:
        disp = ", ".join(SUPPORTED_CURRENCIES)
        return failure(
            ErrorCode.DEVISE_NON_SUPPORTEE,
            *_pair("CURRENCY_UNSUPPORTED", entree=currency_code, disponibles=disp),
            details={"devise": currency_code},
            suggestions=SUPPORTED_CURRENCIES,
        )

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

    config = DEFAULT_CURRENCY_CONFIG[currency_code]
    nb_decimals = config["decimales"] if decimales is None else decimales
    nb_decimals = max(0, nb_decimals)

    # Arrondi au nombre de décimales souhaité
    quantize_format = Decimal("1") if nb_decimals == 0 else Decimal("10") ** -nb_decimals
    rounded_value = value.quantize(quantize_format)

    # Séparation partie entière et partie décimale
    parts = str(rounded_value).split(".")
    int_part = parts[0]
    dec_part = parts[1] if len(parts) > 1 else ""

    # Ajout du séparateur de milliers
    thousands_sep = config["separateur_milliers"]
    # Groupement par 3 en partant de la droite
    reversed_int = int_part[::-1]
    grouped_reversed = [reversed_int[i : i + 3] for i in range(0, len(reversed_int), 3)]
    formatted_int = thousands_sep.join(grouped_reversed)[::-1]

    # Assemblage avec partie décimale
    if nb_decimals > 0:
        dec_part = dec_part.ljust(nb_decimals, "0")
        number_str = f"{formatted_int}{config['separateur_decimal']}{dec_part}"
    else:
        number_str = formatted_int

    # Ajout du symbole si demandé
    symbole = config["symbole"]
    if inclure_symbole:
        if config["position"] == "avant":
            formatted_full = f"{symbole}{number_str}"
        else:
            formatted_full = f"{number_str} {symbole}"
    else:
        formatted_full = number_str

    out_data = {
        "montant_brut": str(value),
        "montant_formate": formatted_full,
        "devise": currency_code,
        "symbole": symbole,
        "decimales": nb_decimals,
    }
    if country_obj:
        out_data["pays"] = country_obj.iso2

    return success(
        out_data,
        source="Règles locales de formatage Wezas Africa Toolkit",
        confiance="haute",
    )
