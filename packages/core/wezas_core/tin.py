"""Validation et normalisation des identifiants fiscaux d'entreprises africaines (NIF/TIN/NCC)."""

from __future__ import annotations

import datetime as dt
import re
from typing import Any

from wezas_core.envelope import Envelope, ErrorCode, failure, success
from wezas_core.normalize import country_not_found, resolve_country

# Spécifications fiscales officielles par pays
TAX_CONFIGS: dict[str, dict[str, Any]] = {
    "CI": {
        "nom_taxe": "NCC (Numéro de Compte Contribuable)",
        "autorite": "Direction Générale des Impôts de Côte d'Ivoire (DGI)",
        "pattern": r"^(\d{7})\s*([A-Za-z])$",
        "description": "7 chiffres suivis d'une lettre clé de contrôle",
        "format_func": lambda m: f"{m.group(1)} {m.group(2).upper()}",
        "source": "DGI Côte d'Ivoire - Décret n° 2001-213 portant institution du NCC",
        "exemples": ["1234567 A", "0123456 Z"],
    },
    "SN": {
        "nom_taxe": "NINEA (Numéro d'Identification Nationale)",
        "autorite": "Direction Générale des Impôts et des Domaines du Sénégal (DGID)",
        "pattern": r"^(\d{9})(?:\s*([0-9A-Za-z]{3}))?$",
        "description": "9 chiffres obligatoires, facultativement suivis du COFI (3 caractères)",
        "format_func": lambda m: f"{m.group(1)}" + (f" {m.group(2).upper()}" if m.group(2) else ""),
        "source": "DGID Sénégal / ANSD - Registre National des Entreprises",
        "exemples": ["001234567", "001234567 2V2"],
    },
    "CM": {
        "nom_taxe": "NIU (Numéro d'Identifiant Unique)",
        "autorite": "Direction Générale des Impôts du Cameroun (DGI)",
        "pattern": r"^([MPmp])\s*(\d{12,13})\s*([A-Za-z])$",
        "description": "Commence par M ou P, suivi de 12-13 chiffres et 1 lettre clé",
        "format_func": lambda m: f"{m.group(1).upper()}{m.group(2)}{m.group(3).upper()}",
        "source": "Direction Générale des Impôts du Cameroun - Loi de Finances art. L1 CGI",
        "exemples": ["M012345678912A", "P1234567890123Z"],
    },
    "GA": {
        "nom_taxe": "NIF (Numéro d'Identification Fiscale)",
        "autorite": "Direction Générale des Impôts du Gabon (DGI)",
        "pattern": r"^(\d{7})\s*([A-Za-z])$",
        "description": "7 chiffres suivis d'une lettre alphabétique",
        "format_func": lambda m: f"{m.group(1)} {m.group(2).upper()}",
        "source": "Code Général des Impôts du Gabon - DGI",
        "exemples": ["1234567 X", "7654321 A"],
    },
    "KE": {
        "nom_taxe": "KRA PIN (Personal Identification Number)",
        "autorite": "Kenya Revenue Authority (KRA)",
        "pattern": r"^([APap])\s*(\d{9})\s*([A-Za-z])$",
        "description": "1 lettre (A individu, P société), 9 chiffres, 1 lettre finale",
        "format_func": lambda m: f"{m.group(1).upper()}{m.group(2)}{m.group(3).upper()}",
        "source": "Kenya Revenue Authority (KRA) - Tax Procedures Act",
        "exemples": ["P051234567Z", "A012345678X"],
    },
    "NG": {
        "nom_taxe": "TIN (Taxpayer Identification Number)",
        "autorite": "Federal Inland Revenue Service (FIRS / Joint Tax Board)",
        "pattern": r"^(\d{8,10})(?:-(\d{4}))?$",
        "description": "8 à 10 chiffres (FIRS / JTB), parfois complété de 4 chiffres",
        "format_func": lambda m: f"{m.group(1)}" + (f"-{m.group(2)}" if m.group(2) else ""),
        "source": "Federal Inland Revenue Service (FIRS) / Joint Tax Board (JTB) Nigeria",
        "exemples": ["12345678-0001", "2345678901"],
    },
    "GH": {
        "nom_taxe": "Ghana TIN / Ghana Card PIN",
        "autorite": "Ghana Revenue Authority (GRA)",
        "pattern": r"^(?:(GHA)-(\d{9})-(\d)|(C\d{9,11}))$(?i)",
        "description": "Format Ghana Card (GHA-XXXXXXXXX-X) ou identifiant GRA C-XXXXXXXXXX",
        "format_func": lambda m: m.group(0).upper(),
        "source": "Ghana Revenue Authority (GRA) Revenue Administration Act",
        "exemples": ["GHA-123456789-1", "C0012345678"],
    },
    "CD": {
        "nom_taxe": "NIF (Numéro d'Identification Fiscale)",
        "autorite": "Direction Générale des Impôts de RDC (DGI)",
        "pattern": r"^([A-Za-z])\s*(\d{7})\s*([A-Za-z])$",
        "description": "1 lettre initiale, 7 chiffres, 1 lettre de contrôle",
        "format_func": lambda m: f"{m.group(1).upper()}{m.group(2)}{m.group(3).upper()}",
        "source": "Direction Générale des Impôts de RDC - Loi portant réforme fiscale",
        "exemples": ["A0123456Z", "B7654321A"],
    },
    "RW": {
        "nom_taxe": "TIN (Taxpayer Identification Number)",
        "autorite": "Rwanda Revenue Authority (RRA)",
        "pattern": r"^(\d{9})$",
        "description": "9 chiffres attribués par la Rwanda Revenue Authority",
        "format_func": lambda m: m.group(1),
        "source": "Rwanda Revenue Authority (RRA) Tax Administration",
        "exemples": ["123456789", "987654321"],
    },
    "MG": {
        "nom_taxe": "NIF (Numéro d'Identification Fiscale)",
        "autorite": "Direction Générale des Impôts de Madagascar (DGI)",
        "pattern": r"^(\d{10})$",
        "description": "10 chiffres délivrés par la Direction Générale des Impôts",
        "format_func": lambda m: m.group(1),
        "source": "Direction Générale des Impôts de Madagascar - CGI art. 20",
        "exemples": ["1234567890", "9876543210"],
    },
    "MA": {
        "nom_taxe": "ICE (Identifiant Commun de l'Entreprise) / IF",
        "autorite": "Direction Générale des Impôts et OMPIC Maroc",
        "pattern": r"^(?:(\d{15})|(\d{7,8}))$(?i)",
        "description": "ICE officiel à 15 chiffres (ou IF à 7-8 chiffres)",
        "format_func": lambda m: m.group(0),
        "source": "Direction Générale des Impôts du Maroc / OMPIC - Décret relatif à l'ICE",
        "exemples": ["001234567000089", "12345678"],
    },
}


def validate_tax_id(pays: str, identifiant: str) -> Envelope:
    """Valide et normalise un numéro d'identifiant fiscal d'entreprise pour un pays africain."""
    country_obj = resolve_country(pays)
    if not country_obj:
        return country_not_found(pays)

    iso2 = country_obj.iso2
    cfg = TAX_CONFIGS.get(iso2)

    if not cfg:
        return failure(
            ErrorCode.DONNEES_INDISPONIBLES,
            f"Spécifications fiscales pour {country_obj.name.fr} ({iso2}) non tabulées.",
            f"Tax ID specifications for {country_obj.name.en} ({iso2}) are not tabulated yet.",
            details={"pays": iso2},
            suggestions=list(TAX_CONFIGS.keys()),
        )

    raw_clean = identifiant.strip()
    match = re.match(cfg["pattern"], raw_clean)

    if not match:
        return failure(
            ErrorCode.IDENTIFIANT_INVALIDE,
            f"Format {cfg['nom_taxe']} invalide pour {country_obj.name.fr} ({cfg['description']}).",
            f"Invalid {cfg['nom_taxe']} format for {country_obj.name.en} ({cfg['description']}).",
            details={"identifiant_soumis": raw_clean, "format_attendu": cfg["description"]},
            suggestions=cfg["exemples"],
        )

    formatted = cfg["format_func"](match)

    return success(
        {
            "valide": True,
            "pays": {
                "iso2": country_obj.iso2,
                "nom": country_obj.name.fr,
            },
            "type_identifiant": cfg["nom_taxe"],
            "autorite_fiscale": cfg["autorite"],
            "identifiant_formate": formatted,
            "identifiant_brut": raw_clean,
        },
        source=cfg["source"],
        derniere_verification=dt.date(2026, 10, 21),
        confiance="haute",
    )
