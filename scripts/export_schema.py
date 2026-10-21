"""Exporte le JSON Schema d'un pays vers data/schema/country.schema.json."""

import json
from pathlib import Path

from wezas_core.models import Country

OUT = Path(__file__).resolve().parent.parent / "data" / "schema" / "country.schema.json"

if __name__ == "__main__":
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(Country.model_json_schema(), indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Écrit : {OUT}")
