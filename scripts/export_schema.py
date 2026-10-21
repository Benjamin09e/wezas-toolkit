"""Exporte les JSON Schemas (pays et enveloppe de sortie) vers data/schema/."""

import json
from pathlib import Path

from wezas_core.envelope import Envelope
from wezas_core.models import Country

OUT_DIR = Path(__file__).resolve().parent.parent / "data" / "schema"

SCHEMAS = {
    "country.schema.json": Country,
    "envelope.schema.json": Envelope,
}

if __name__ == "__main__":
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for filename, model in SCHEMAS.items():
        path = OUT_DIR / filename
        path.write_text(
            json.dumps(model.model_json_schema(), indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )
        print(f"Écrit : {path}")
