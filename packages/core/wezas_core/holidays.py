"""Calculs et résolutions des jours fériés légaux (chrétiens et musulmans) pour l'Afrique."""

from __future__ import annotations

import datetime as dt
from typing import Any

from wezas_core.models import Country


def calculate_easter(year: int) -> dt.date:
    """Algorithme de Butcher / Meeus pour le calcul de la date du dimanche de Pâques grégorien."""
    a = year % 19
    b = year // 100
    c = year % 100
    d = b // 4
    e = b % 4
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i = c // 4
    k = c % 4
    l_var = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l_var) // 451
    month = (h + l_var - 7 * m + 114) // 31
    day = ((h + l_var - 7 * m + 114) % 31) + 1
    return dt.date(year, month, day)


def get_country_holidays(country: Country, year: int) -> list[dict[str, Any]]:
    """Retourne la liste ordonnée des jours fériés pour une année donnée."""
    holidays: list[dict[str, Any]] = []

    # 1. Jours fériés à date fixe
    for fh in country.holidays.fixed:
        try:
            month, day = map(int, fh.date.split("-"))
            d = dt.date(year, month, day)
            holidays.append({
                "date": d.isoformat(),
                "nom": fh.name.fr,
                "nom_en": fh.name.en,
                "type": "fixe",
            })
        except ValueError:
            continue

    # 2. Jours fériés mobiles basés sur Pâques (Lundi de Pâques, Ascension, Pentecôte...)
    easter = calculate_easter(year)
    for eb in country.holidays.easter_based:
        d = easter + dt.timedelta(days=eb.offset_days)
        holidays.append({
            "date": d.isoformat(),
            "nom": eb.name.fr,
            "nom_en": eb.name.en,
            "type": "mobile_chretien",
        })

    # 3. Jours fériés musulmans enregistrés pour l'année
    if year in country.holidays.islamic:
        for ih in country.holidays.islamic[year]:
            holidays.append({
                "date": ih.date.isoformat(),
                "nom": ih.name.fr,
                "nom_en": ih.name.en,
                "type": "mobile_islamique",
            })

    # Trier chronologiquement par date
    holidays.sort(key=lambda x: x["date"])
    return holidays
