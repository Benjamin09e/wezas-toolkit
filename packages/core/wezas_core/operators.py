"""Listing et consultation des opérateurs télécoms et Mobile Money (WAT-042)."""

from __future__ import annotations

from importlib import resources
from typing import Any

import yaml

from wezas_core.envelope import Envelope, success
from wezas_core.normalize import country_not_found, resolve_country

_OPERATORS_CACHE: dict[str, Any] | None = None


def _get_operators_data() -> dict[str, Any]:
    global _OPERATORS_CACHE
    if _OPERATORS_CACHE is None:
        try:
            data_file = resources.files("wezas_core").joinpath("data").joinpath("operators.yaml")
            content = data_file.read_text(encoding="utf-8")
            _OPERATORS_CACHE = yaml.safe_load(content).get("operators", {})
        except Exception:
            _OPERATORS_CACHE = {}
    return _OPERATORS_CACHE or {}


def list_operators(
    pays: str | None = None,
    avec_mobile_money_seulement: bool = False,
) -> Envelope:
    """Liste les opérateurs télécoms et services Mobile Money disponibles, filtrables par pays."""
    all_operators = _get_operators_data()

    country_obj = None
    target_iso2: str | None = None
    if pays:
        country_obj = resolve_country(pays)
        if not country_obj:
            return country_not_found(pays)
        target_iso2 = country_obj.iso2

    result_list: list[dict[str, Any]] = []

    for op_id, op_info in sorted(all_operators.items(), key=lambda x: x[0]):
        countries = op_info.get("pays", [])
        if target_iso2 and target_iso2 not in countries:
            continue

        mm_services = op_info.get("mobile_money", [])
        if avec_mobile_money_seulement and not mm_services:
            continue

        result_list.append(
            {
                "id": op_id,
                "nom": op_info.get("nom", op_id),
                "pays": countries,
                "mobile_money": mm_services,
                "a_mobile_money": len(mm_services) > 0,
            }
        )

    out_data: dict[str, Any] = {
        "total": len(result_list),
        "operateurs": result_list,
    }
    if country_obj:
        out_data["pays"] = {
            "iso2": country_obj.iso2,
            "iso3": country_obj.iso3,
            "nom": country_obj.name.fr,
        }

    import datetime as dt

    verif_date = country_obj.last_verified if country_obj else dt.date(2026, 10, 21)

    return success(
        out_data,
        source="Catalogue officiel des opérateurs Wezas Africa Toolkit (operators.yaml)",
        derniere_verification=verif_date,
        confiance="haute",
    )
