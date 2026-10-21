"""Chargement et validation des données pays (hors ligne, données embarquées)."""

from __future__ import annotations

from functools import lru_cache
from importlib import resources
from pathlib import Path

import yaml
from pydantic import ValidationError

from wezas_core.models import Country


class DataError(Exception):
    """Fichier de données invalide ou introuvable."""


def embedded_countries_dir() -> Path:
    """Dossier des données pays embarquées dans le package."""
    return Path(str(resources.files("wezas_core").joinpath("data").joinpath("countries")))


def load_country_file(path: Path) -> Country:
    """Charge et valide un fichier pays. Le nom du fichier doit être `<iso2>.yaml`."""
    try:
        raw = yaml.safe_load(path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as exc:
        raise DataError(f"{path.name} : lecture impossible ({exc})") from exc
    try:
        country = Country.model_validate(raw)
    except ValidationError as exc:
        raise DataError(f"{path.name} : schéma invalide\n{exc}") from exc
    if path.stem.lower() != country.iso2.lower():
        raise DataError(f"{path.name} : le nom du fichier doit être {country.iso2.lower()}.yaml")
    return country


def load_countries(directory: Path | None = None) -> dict[str, Country]:
    """Charge tous les pays d'un dossier (défaut : données embarquées), indexés par ISO2."""
    folder = directory or embedded_countries_dir()
    countries: dict[str, Country] = {}
    if not folder.is_dir():
        return countries
    for path in sorted(folder.glob("*.yaml")):
        country = load_country_file(path)
        if country.iso2 in countries:
            raise DataError(f"{path.name} : pays {country.iso2} en double")
        countries[country.iso2] = country
    return countries


@lru_cache(maxsize=1)
def get_countries() -> dict[str, Country]:
    """Données embarquées, mises en cache en mémoire."""
    return load_countries()
