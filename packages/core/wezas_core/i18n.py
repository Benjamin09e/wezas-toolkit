"""Catalogue de messages bilingues FR/EN (WAT-007).

Tous les messages visibles par l'utilisateur ou l'agent passent par `t()`. Un test vérifie que
chaque entrée existe dans les deux langues avec les mêmes paramètres.
"""

from __future__ import annotations

from typing import Literal

from wezas_core.models import LocalizedName

Lang = Literal["fr", "en"]

MESSAGES: dict[str, tuple[str, str]] = {
    "CURRENCY_AMBIGUOUS": (
        "« {entree} » est ambigu : précisez XAF (Afrique centrale) ou XOF (Afrique de l'Ouest).",
        '"{entree}" is ambiguous: specify XAF (Central Africa) or XOF (West Africa).',
    ),
    "CURRENCY_UNSUPPORTED": (
        "Devise non prise en charge : « {entree} ». Disponibles : {disponibles}.",
        'Unsupported currency: "{entree}". Available: {disponibles}.',
    ),
    "AMOUNT_UNREADABLE": (
        "Montant illisible : « {entree} ».",
        'Unreadable amount: "{entree}".',
    ),
    "AMOUNT_OUT_OF_RANGE": (
        "Le montant doit être compris entre 0 et 10^15.",
        "The amount must be between 0 and 10^15.",
    ),
    "COUNTRY_UNKNOWN": (
        "Pays inconnu ou non pris en charge : « {entree} ».",
        'Unknown or unsupported country: "{entree}".',
    ),
    "PHONE_PORTABILITY": (
        "L'opérateur et la compatibilité Mobile Money sont probables "
        "mais peuvent différer en cas de portabilité.",
        "Operator and Mobile Money compatibility are probable "
        "but may differ in case of portability.",
    ),
    "LUNAR_HOLIDAYS_MISSING": (
        "Les fêtes musulmanes pour l'année demandée ne sont pas encore tabulées "
        "(dépendant de l'observation lunaire).",
        "Islamic holidays for the requested year are not tabulated yet "
        "(depend on lunar observations).",
    ),
    "CURRENCY_RATE_OUTDATED": (
        "Le taux de change indicatif hors ligne pour {devise} date du {date} "
        "(utilisez le paramètre 'taux' pour spécifier un taux récent).",
        "The offline indicative exchange rate for {devise} is from {date} "
        "(use the 'taux' parameter to supply a fresh rate).",
    ),
    "RATE_INVALID": (
        "Le taux personnalisé doit être un nombre strictement positif.",
        "The custom exchange rate must be a strictly positive number.",
    ),
}


def t(key: str, **params: object) -> LocalizedName:
    """Message bilingue pour `key`, avec substitution des paramètres."""
    fr, en = MESSAGES[key]
    return LocalizedName(fr=fr.format(**params), en=en.format(**params))


def pick(name: LocalizedName, lang: Lang = "fr") -> str:
    """Choisit une langue dans un nom ou message bilingue (repli sur le français)."""
    return name.en if lang == "en" else name.fr
