"""Normalisation des entrées : pays (nom FR/EN, ISO-2, ISO-3) et numéros de téléphone."""

from __future__ import annotations

import difflib
import re
import unicodedata
from collections.abc import Mapping
from dataclasses import dataclass

from wezas_core.envelope import Envelope, ErrorCode, failure
from wezas_core.i18n import t
from wezas_core.loader import get_countries
from wezas_core.models import Country


def _fold(text: str) -> str:
    """Minuscules, sans accents, ponctuation et espaces normalisés."""
    decomposed = unicodedata.normalize("NFKD", text.strip())
    no_accents = "".join(c for c in decomposed if not unicodedata.combining(c))
    return re.sub(r"[\s'’`\-_.]+", " ", no_accents.casefold()).strip()


def _index(countries: Mapping[str, Country]) -> dict[str, str]:
    """Clé normalisée -> ISO2, pour ISO2, ISO3 et noms FR/EN."""
    keys: dict[str, str] = {}
    for iso2, country in countries.items():
        for alias in (iso2, country.iso3, country.name.fr, country.name.en):
            keys[_fold(alias)] = iso2
    return keys


def resolve_country(
    query: str, countries: Mapping[str, Country] | None = None
) -> Country | None:
    """Retrouve un pays à partir de « Gabon », « gabon », « GA », « GAB », « Côte d'Ivoire »…"""
    pool = get_countries() if countries is None else countries
    iso2 = _index(pool).get(_fold(query)) if query and query.strip() else None
    return pool[iso2] if iso2 else None


def suggest_countries(
    query: str, countries: Mapping[str, Country] | None = None, limit: int = 3
) -> list[str]:
    """Pays proches de la saisie, au format « GA (Gabon) »."""
    pool = get_countries() if countries is None else countries
    index = _index(pool)
    folded = _fold(query or "")
    close = difflib.get_close_matches(folded, list(index), n=limit * 2, cutoff=0.6)
    seen: list[str] = []
    for key in close:
        iso2 = index[key]
        if iso2 not in seen:
            seen.append(iso2)
    return [f"{iso2} ({pool[iso2].name.fr})" for iso2 in seen[:limit]]


def _pair(key: str, **params: object) -> tuple[str, str]:
    m = t(key, **params)
    return m.fr, m.en


def country_not_found(query: str, countries: Mapping[str, Country] | None = None) -> Envelope:
    """Enveloppe d'erreur PAYS_INCONNU avec suggestions."""
    pool = get_countries() if countries is None else countries
    suggestions = suggest_countries(query, pool)
    return failure(
        ErrorCode.PAYS_INCONNU,
        *_pair("COUNTRY_UNKNOWN", entree=query),
        details={"entree": query, "pays_disponibles": sorted(pool)},
        suggestions=suggestions,
    )


class PhoneFormatError(ValueError):
    """Numéro illisible (caractères inattendus, vide)."""


@dataclass(frozen=True)
class NormalizedPhone:
    international: bool  # saisi avec « + » ou « 00 »
    digits: str  # chiffres uniquement, sans « + » ni « 00 »


_SEPARATORS = re.compile(r"[\s\u00a0\u202f.\-/]")


def normalize_phone(raw: str) -> NormalizedPhone:
    """Nettoie un numéro : espaces, points, tirets, parenthèses, « (0) », chiffres non latins.

    `+241 06 12 34 56` et `00241 06-12-34-56` donnent `international=True`.
    """
    if not isinstance(raw, str) or not raw.strip():
        raise PhoneFormatError("numéro vide")

    text = unicodedata.normalize("NFKC", raw.strip())
    text = re.sub(r"\(\s*0\s*\)", "", text)  # « +241 (0)6… »
    text = text.replace("(", "").replace(")", "")
    text = _SEPARATORS.sub("", text)

    international = False
    if text.startswith("+"):
        international, text = True, text[1:]
    elif text.startswith("00"):
        international, text = True, text[2:]

    if not text or not all(c.isdigit() for c in text):
        raise PhoneFormatError("caractères non numériques dans le numéro")
    digits = "".join(str(unicodedata.digit(c)) for c in text)  # chiffres arabes, etc. -> ASCII
    return NormalizedPhone(international=international, digits=digits)
