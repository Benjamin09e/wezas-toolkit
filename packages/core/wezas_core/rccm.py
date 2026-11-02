"""Validation et analyse des numéros RCCM (Registre du Commerce et du Crédit Mobilier) OHADA.

Standard OHADA (Traité relatif à l'harmonisation du droit des affaires en Afrique) :
17 pays membres : Bénin, Burkina Faso, Cameroun, Centrafrique, Comores, Congo, Côte d'Ivoire,
Gabon, Guinée, Guinée-Bissau, Guinée Équatoriale, Mali, Niger, RDC, Sénégal, Tchad, Togo.

Format officiel OHADA révisé (Acte uniforme portant sur le droit commercial général art. 37) :
[CODE_PAYS]-[VILLE/TRIBUNAL]-[ANNEE]-[TYPE_PERSONNE]-[NUMERO_CHRONO]
Exemples :
- CI-ABJ-2024-B-12345 (Personne Morale à Abidjan, 2024)
- SN-DKR-2023-A-09876 (Personne Physique à Dakar, 2023)
- CM-DLA-2022-M-00123 (Succursale à Douala, 2022)
"""

from __future__ import annotations

import datetime as dt
import re
from typing import Any

from wezas_core.envelope import Envelope, ErrorCode, failure, success

# Codes pays membres OHADA reconnus
OHADA_PAYS: dict[str, str] = {
    "BJ": "Bénin",
    "BF": "Burkina Faso",
    "CM": "Cameroun",
    "CF": "Centrafrique",
    "KM": "Comores",
    "CG": "Congo (Brazzaville)",
    "CI": "Côte d'Ivoire",
    "GA": "Gabon",
    "GN": "Guinée",
    "GW": "Guinée-Bissau",
    "GQ": "Guinée Équatoriale",
    "ML": "Mali",
    "NE": "Niger",
    "CD": "RD Congo",
    "SN": "Sénégal",
    "TD": "Tchad",
    "TG": "Togo",
}

# Principaux tribunaux de commerce / greffes OHADA
OHADA_JURIDICTIONS: dict[str, dict[str, str]] = {
    "CI": {"ABJ": "Tribunal de Commerce d'Abidjan", "BKE": "Bouaké", "SPK": "San Pedro"},
    "SN": {"DKR": "Tribunal de Commerce Hors Classe de Dakar", "THS": "Thiès", "STL": "Saint-Louis"},
    "CM": {"DLA": "Tribunal de Première Instance de Douala", "YDE": "Yaoundé", "BFX": "Bafoussam"},
    "GA": {"LBV": "Tribunal de Commerce de Libreville", "POG": "Port-Gentil"},
    "BJ": {"COT": "Tribunal de Commerce de Cotonou", "PNO": "Porto-Novo"},
    "BF": {"OUA": "Tribunal de Commerce de Ouagadougou", "BOB": "Bobo-Dioulasso"},
    "ML": {"BKO": "Tribunal de Commerce de Bamako"},
    "TG": {"LOM": "Tribunal de Commerce de Lomé"},
    "NE": {"NMY": "Tribunal de Commerce de Niamey"},
    "CD": {"KIN": "Tribunal de Commerce de Kinshasa / Gombe", "LBI": "Lubumbashi"},
}

TYPES_ENTITE: dict[str, str] = {
    "A": "Personne Physique (Commerçant individuel, Entreprise individuelle)",
    "B": "Personne Morale (SARL, SAS, SA, Société commerciale)",
    "M": "Succursale ou Établissement secondaire",
    "C": "Groupement d'Intérêt Économique (GIE)",
}

# Regex standard moderne : CI-ABJ-2024-B-12345 ou variantes avec slash / espaces
REGEX_RCCM_STRICT = re.compile(
    r"^([A-Z]{2})[-/\s]?([A-Z]{3,4})[-/\s]?(\d{4})[-/\s]?([ABMCabmc])[-/\s]?(\d{1,7})$",
    re.IGNORECASE,
)

# Regex forme historique ou tolérante : RCCM CI-ABJ-03-2024-B12-12345
REGEX_RCCM_SOUPLE = re.compile(
    r"(?:RCCM\s*)?([A-Z]{2})[-/\s]?([A-Z]{3,4})[-/\s]?(?:\d{2}[-/\s]?)?(\d{4})[-/\s]?([ABMCabmc])(?:\d{1,2})?[-/\s]?(\d{1,7})",
    re.IGNORECASE,
)


def valider_rccm(numero_rccm: str) -> Envelope:
    """Valide et décortique un numéro RCCM de l'espace OHADA."""
    if not numero_rccm or not isinstance(numero_rccm, str):
        return failure(
            ErrorCode.ENTREE_INVALIDE,
            "Le numéro RCCM est obligatoire et doit être une chaîne.",
            "RCCM number is required and must be a string.",
            details={"numero_rccm": str(numero_rccm) if numero_rccm is not None else ""},
        )

    nettoye = numero_rccm.strip().upper()
    if nettoye.startswith("RCCM"):
        nettoye = nettoye[4:].strip(": -_")

    match = REGEX_RCCM_STRICT.match(nettoye)
    is_souple = False

    if not match:
        match = REGEX_RCCM_SOUPLE.match(nettoye)
        is_souple = True

    if not match:
        return success(
            {
                "valide": False,
                "numero_brut": numero_rccm,
                "motif_rejet": "Le format ne respecte pas la norme OHADA ([PAYS]-[TRIBUNAL]-[ANNEE]-[TYPE]-[NUMERO]).",
                "exemples_valides": [
                    "CI-ABJ-2024-B-12345",
                    "SN-DKR-2023-A-09876",
                    "CM-DLA-2022-B-00123",
                ],
            },
            source="Secrétariat Permanent de l'OHADA - Acte Uniforme Droit Commercial Général",
            confiance="haute",
        )

    code_pays = match.group(1).upper()
    code_greffe = match.group(2).upper()
    annee = int(match.group(3))
    code_type = match.group(4).upper()
    chrono = match.group(5)

    nom_pays = OHADA_PAYS.get(code_pays)
    if not nom_pays:
        return success(
            {
                "valide": False,
                "numero_brut": numero_rccm,
                "motif_rejet": f"Le code pays '{code_pays}' ne fait pas partie des 17 États membres du traité OHADA.",
            },
            source="Traité OHADA",
            confiance="haute",
        )

    # Vérification plausibilité de l'année (1990 à 2030)
    annee_valide = 1990 <= annee <= 2030
    if not annee_valide:
        return success(
            {
                "valide": False,
                "numero_brut": numero_rccm,
                "motif_rejet": f"L'année d'immatriculation '{annee}' est hors des limites légales OHADA.",
            },
            source="OHADA RCCM",
            confiance="haute",
        )

    juridiction_nom = (
        OHADA_JURIDICTIONS.get(code_pays, {}).get(code_greffe)
        or f"Tribunal de Commerce / Greffe ({code_greffe})"
    )

    format_canonique = f"{code_pays}-{code_greffe}-{annee}-{code_type}-{chrono.zfill(5)}"

    return success(
        {
            "valide": True,
            "rccm_formate": format_canonique,
            "pays": {
                "iso2": code_pays,
                "nom": nom_pays,
                "espace": "OHADA",
            },
            "greffe": {
                "code": code_greffe,
                "nom": juridiction_nom,
            },
            "annee_immatriculation": annee,
            "forme_juridique": {
                "code": code_type,
                "libelle": TYPES_ENTITE.get(code_type, "Entité Commerciale"),
            },
            "numero_ordre": chrono,
            "norme": "Acte Uniforme OHADA révisé (Art. 37 AUDCG)",
            "tolerance_appliquee": is_souple,
        },
        source="OHADA - Registre du Commerce et du Crédit Mobilier (AUDCG Art. 37)",
        derniere_verification=dt.date(2026, 11, 1),
        confiance="haute",
    )
