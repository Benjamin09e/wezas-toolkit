"""Modèles de données pays (schéma des fichiers `data/countries/<iso2>.yaml`)."""

from __future__ import annotations

import datetime as dt
import re
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class _Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


class LocalizedName(_Strict):
    fr: str = Field(min_length=1)
    en: str = Field(min_length=1)


class Source(_Strict):
    label: str = Field(min_length=1)
    url: str | None = None


class NumberRange(_Strict):
    """Plage de numéros nationaux (sans indicatif ni préfixe de ligne)."""

    type: Literal["mobile", "fixed"]
    prefixes: list[str] = Field(min_length=1)
    operator: str | None = Field(default=None, description="Identifiant dans operators.yaml")

    @field_validator("prefixes")
    @classmethod
    def _digits_only(cls, v: list[str]) -> list[str]:
        for p in v:
            if not re.fullmatch(r"\d+", p):
                raise ValueError(f"préfixe invalide (chiffres uniquement) : {p!r}")
        return v


class NumberingPlan(_Strict):
    national_length: int = Field(ge=4, le=12, description="Nombre de chiffres du numéro national")
    trunk_prefix: str | None = Field(default=None, pattern=r"^\d{1,2}$")
    ranges: list[NumberRange] = Field(min_length=1)


class FixedHoliday(_Strict):
    date: str = Field(pattern=r"^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$", description="MM-JJ")
    name: LocalizedName


class EasterBasedHoliday(_Strict):
    """Fête mobile calculée à partir de Pâques (ex. Lundi de Pâques = +1)."""

    offset_days: int = Field(ge=-60, le=100)
    name: LocalizedName


class IslamicHoliday(_Strict):
    """Fête musulmane : date stockée par année (dépend de l'observation lunaire)."""

    date: dt.date
    name: LocalizedName


class Holidays(_Strict):
    fixed: list[FixedHoliday] = Field(default_factory=list)
    easter_based: list[EasterBasedHoliday] = Field(default_factory=list)
    islamic: dict[int, list[IslamicHoliday]] = Field(default_factory=dict)

    @model_validator(mode="after")
    def _islamic_year_matches(self) -> Holidays:
        for year, items in self.islamic.items():
            for h in items:
                if h.date.year != year:
                    raise ValueError(f"fête islamique {h.date} classée sous l'année {year}")
        return self


class Country(_Strict):
    iso2: str = Field(pattern=r"^[A-Z]{2}$")
    iso3: str = Field(pattern=r"^[A-Z]{3}$")
    name: LocalizedName
    capital: str | None = None
    dial_code: str = Field(pattern=r"^\+\d{1,3}$")
    currency: str = Field(pattern=r"^[A-Z]{3}$")
    languages: list[str] = Field(min_length=1)
    timezones: list[str] = Field(min_length=1)
    numbering_plan: NumberingPlan
    mobile_money: list[str] = Field(default_factory=list, description="Identifiants de services")
    holidays: Holidays = Field(default_factory=Holidays)
    sources: list[Source] = Field(min_length=1)
    last_verified: dt.date
