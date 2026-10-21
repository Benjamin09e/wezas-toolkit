"""Script de validation CI des fichiers de données pays (WAT-030)."""

from __future__ import annotations

import sys
from pathlib import Path

from wezas_core.loader import DataError, load_country_file

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "countries"


def validate_all_countries() -> int:
    files = sorted(DATA_DIR.glob("*.yaml"))
    if not files:
        print("ERREUR: Aucun fichier pays trouvé dans data/countries/")
        return 1

    errors: list[str] = []
    print(f"Validation de {len(files)} fichiers pays...")

    for f in files:
        try:
            country = load_country_file(f)
            # Vérifications spécifiques de rigueur
            if not country.sources:
                errors.append(f"{f.name}: champ 'sources' manquant ou vide")
            if not country.last_verified:
                errors.append(f"{f.name}: champ 'last_verified' manquant")
            if not country.numbering_plan.ranges:
                errors.append(f"{f.name}: aucune plage de numérotation renseignée")
            print(f"  OK {f.name} -> {country.iso2} ({country.name.fr})")
        except DataError as err:
            errors.append(f"{f.name}: {err}")
        except Exception as exc:
            errors.append(f"{f.name}: Erreur inattendue ({exc})")

    if errors:
        print("\n--- ERREURS DE VALIDATION DES DONNÉES ---")
        for e in errors:
            print(f"  ❌ {e}")
        return 1

    print(f"\n Succès : les {len(files)} pays sont conformes au schéma et sourcés.")
    return 0


if __name__ == "__main__":
    sys.exit(validate_all_countries())
