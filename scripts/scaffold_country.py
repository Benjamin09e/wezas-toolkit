"""Script de génération d'un gabarit de données pour un nouveau pays (WAT-034)."""

from __future__ import annotations

import argparse
import datetime as dt
import sys
from pathlib import Path

TEMPLATE = """iso2: {iso2}
iso3: {iso3}
name:
  fr: "{nom_fr}"
  en: "{nom_en}"
capital: "{capitale}"
dial_code: "+{indicatif}"
currency: {devise}
languages:
  - fr
timezones:
  - Africa/{capitale}
numbering_plan:
  national_length: 8
  trunk_prefix: "0"
  ranges:
    - type: mobile
      prefixes: ["6", "7"]
      operator: op1-{iso2_lower}
    - type: fixed
      prefixes: ["1", "2"]
mobile_money:
  - "Service Money"
holidays:
  fixed:
    - date: "01-01"
      name: {{fr: "Jour de l'An", en: "New Year's Day"}}
    - date: "05-01"
      name: {{fr: "Fête du Travail", en: "Labour Day"}}
    - date: "12-25"
      name: {{fr: "Noël", en: "Christmas"}}
  easter_based:
    - offset_days: 1
      name: {{fr: "Lundi de Pâques", en: "Easter Monday"}}
    - offset_days: 39
      name: {{fr: "Ascension", en: "Ascension"}}
  islamic:
    {annee}:
      - date: {annee}-03-20
        name: {{fr: "Aïd el-Fitr", en: "Eid al-Fitr"}}
      - date: {annee}-05-27
        name: {{fr: "Aïd al-Adha (Tabaski)", en: "Eid al-Adha"}}
sources:
  - label: "Autorité de Régulation / UIT Plan National de Numérotation"
    url: "https://www.itu.int"
last_verified: {today}
"""

TARGET_DIR = Path(__file__).resolve().parent.parent / "data" / "countries"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Génère un squelette de pays YAML pour Wezas Toolkit."
    )
    parser.add_argument("--iso", required=True, help="Code ISO2 du pays (ex. MG, RW, GN)")
    parser.add_argument("--nom", default="", help="Nom du pays en français")
    parser.add_argument(
        "--indicatif", default="000", help="Indicatif téléphonique sans le + (ex. 261)"
    )
    parser.add_argument("--devise", default="XAF", help="Code devise ISO (ex. MGA, RWF, GNF)")
    parser.add_argument("--capitale", default="Capitale", help="Nom de la capitale")

    args = parser.parse_args()
    iso2 = args.iso.upper().strip()
    if len(iso2) != 2:
        print("Erreur : le code ISO doit comporter exactement 2 lettres.")
        return 1

    file_path = TARGET_DIR / f"{iso2.lower()}.yaml"
    if file_path.exists():
        print(f"Erreur : le fichier {file_path.name} existe déjà !")
        return 1

    content = TEMPLATE.format(
        iso2=iso2,
        iso2_lower=iso2.lower(),
        iso3=iso2 + "X",
        nom_fr=args.nom or iso2,
        nom_en=args.nom or iso2,
        capitale=args.capitale,
        indicatif=args.indicatif.lstrip("+"),
        devise=args.devise.upper(),
        today=dt.date.today().isoformat(),
        annee=dt.date.today().year,
    )

    file_path.write_text(content, encoding="utf-8")
    print(f" Succès : gabarit créé dans {file_path}")
    print("Veuillez maintenant compléter les plages réelles et sources officielles, puis lancer:")
    print("  uv run python scripts/validate_data.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
