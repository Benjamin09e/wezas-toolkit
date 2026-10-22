"""Module métier `info_pays` pour les builders africains (Epic E5)."""

from __future__ import annotations

import datetime as dt
from typing import Any
from zoneinfo import ZoneInfo

from wezas_core.envelope import Envelope, Warning_, success
from wezas_core.holidays import get_country_holidays
from wezas_core.i18n import t
from wezas_core.normalize import country_not_found, resolve_country

CURRENCY_INFO: dict[str, dict[str, str]] = {
    "XAF": {
        "code": "XAF",
        "nom": "Franc CFA (BEAC)",
        "symbole": "FCFA",
        "banque_centrale": "Banque des États de l'Afrique Centrale",
    },
    "XOF": {
        "code": "XOF",
        "nom": "Franc CFA (BCEAO)",
        "symbole": "FCFA",
        "banque_centrale": "Banque Centrale des États de l'Afrique de l'Ouest",
    },
    "NGN": {
        "code": "NGN",
        "nom": "Naira nigérian",
        "symbole": "₦",
        "banque_centrale": "Central Bank of Nigeria",
    },
    "GHS": {
        "code": "GHS",
        "nom": "Cedi ghanéen",
        "symbole": "GH₵",
        "banque_centrale": "Bank of Ghana",
    },
    "KES": {
        "code": "KES",
        "nom": "Shilling kényan",
        "symbole": "KSh",
        "banque_centrale": "Central Bank of Kenya",
    },
    "CDF": {
        "code": "CDF",
        "nom": "Franc congolais",
        "symbole": "FC",
        "banque_centrale": "Banque Centrale du Congo",
    },
    "RWF": {
        "code": "RWF",
        "nom": "Franc rwandais",
        "symbole": "FRw",
        "banque_centrale": "Banque Nationale du Rwanda",
    },
    "MGA": {
        "code": "MGA",
        "nom": "Ariary malgache",
        "symbole": "Ar",
        "banque_centrale": "Banky Foiben'i Madagasikara",
    },
    "MAD": {
        "code": "MAD",
        "nom": "Dirham marocain",
        "symbole": "DH",
        "banque_centrale": "Bank Al-Maghrib",
    },
    "GNF": {
        "code": "GNF",
        "nom": "Franc guinéen",
        "symbole": "FG",
        "banque_centrale": "Banque Centrale de la République de Guinée",
    },
}


def get_country_info(
    pays: str,
    annee: int | None = None,
    champs: list[str] | None = None,
) -> Envelope:
    """Retourne les informations d'un pays : indicatif, devise, fuseau, langues, jours fériés."""
    country = resolve_country(pays)
    if not country:
        return country_not_found(pays)

    target_year = annee or dt.date.today().year

    # Heures locales pour chaque fuseau horaire
    timezones_info: list[dict[str, Any]] = []
    now_utc = dt.datetime.now(dt.timezone.utc)

    for tz_name in country.timezones:
        try:
            tz = ZoneInfo(tz_name)
            local_time = now_utc.astimezone(tz)
            offset = local_time.strftime("%z")
            formatted_offset = f"UTC{offset[:3]}:{offset[3:]}" if offset else "UTC+00:00"
            timezones_info.append(
                {
                    "fuseau": tz_name,
                    "decalage_utc": formatted_offset,
                    "heure_locale": local_time.strftime("%Y-%m-%d %H:%M:%S"),
                }
            )
        except Exception:
            timezones_info.append(
                {
                    "fuseau": tz_name,
                    "decalage_utc": "Inconnu",
                    "heure_locale": "Inconnue",
                }
            )

    # Informations sur la devise
    curr_code = country.currency
    curr_details = CURRENCY_INFO.get(
        curr_code,
        {"code": curr_code, "nom": curr_code, "symbole": curr_code},
    )

    # Récupération des jours fériés
    holidays = get_country_holidays(country, target_year)

    warnings: list[Warning_] = []
    # Avertissement si aucune date islamique n'est disponible pour l'année demandée
    if country.holidays.islamic and target_year not in country.holidays.islamic:
        warnings.append(
            Warning_(
                code="FETES_LUNAIRES_NON_RENSEIGNEES",
                message=t("LUNAR_HOLIDAYS_MISSING"),
            )
        )

    all_data: dict[str, Any] = {
        "pays": {
            "iso2": country.iso2,
            "iso3": country.iso3,
            "nom": country.name.fr,
            "nom_en": country.name.en,
            "capitale": country.capital,
        },
        "indicatif": country.dial_code,
        "devise": curr_details,
        "langues": country.languages,
        "fuseaux_horaires": timezones_info,
        "mobile_money": country.mobile_money,
        "annee_feries": target_year,
        "jours_feries": holidays,
    }

    # Filtrage des champs si demandé
    if champs:
        filtered_data = {k: v for k, v in all_data.items() if k in champs or k == "pays"}
    else:
        filtered_data = all_data

    return success(
        filtered_data,
        source=country.sources[0].label if country.sources else None,
        derniere_verification=country.last_verified,
        confiance="haute",
        avertissements=warnings,
    )
