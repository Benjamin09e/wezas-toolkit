from pathlib import Path

import pytest
import yaml
from wezas_core.loader import load_country_file
from wezas_core.models import Country
from wezas_core.normalize import (
    NormalizedPhone,
    PhoneFormatError,
    country_not_found,
    normalize_phone,
    resolve_country,
    suggest_countries,
)

FIXTURE = Path(__file__).parent / "fixtures" / "countries" / "zz.yaml"


@pytest.fixture
def countries() -> dict[str, Country]:
    zz = load_country_file(FIXTURE)
    data = yaml.safe_load(FIXTURE.read_text(encoding="utf-8"))
    data.update(iso2="ZY", iso3="ZYX", name={"fr": "Côte d'Yonland", "en": "Yonland Coast"})
    zy = Country.model_validate(data)
    return {"ZZ": zz, "ZY": zy}


@pytest.mark.parametrize(
    "query",
    ["ZZ", "zz", " zz ", "ZZZ", "Zedland", "zedland", "ZEDLAND"],
)
def test_resolve_zz(countries, query):
    assert resolve_country(query, countries).iso2 == "ZZ"


@pytest.mark.parametrize(
    "query",
    ["ZY", "côte d'yonland", "Cote d'Yonland", "COTE D YONLAND", "Cote-d'Yonland", "Yonland Coast"],
)
def test_resolve_accents_and_punctuation(countries, query):
    assert resolve_country(query, countries).iso2 == "ZY"


@pytest.mark.parametrize("query", ["", "   ", "Atlantide", "XX"])
def test_resolve_unknown(countries, query):
    assert resolve_country(query, countries) is None


def test_suggestions_for_typo(countries):
    assert suggest_countries("Zedlan", countries) == ["ZZ (Zedland)"]


def test_country_not_found_envelope(countries):
    env = country_not_found("Zedlnd", countries)
    dumped = env.model_dump(mode="json")
    assert dumped["ok"] is False
    assert dumped["error"]["code"] == "PAYS_INCONNU"
    assert "ZZ (Zedland)" in dumped["error"]["suggestions"]
    assert dumped["error"]["details"]["pays_disponibles"] == ["ZY", "ZZ"]


@pytest.mark.parametrize(
    "raw, expected",
    [
        ("+241 06 12 34 56", NormalizedPhone(True, "24106123456")),
        ("00241 06-12-34-56", NormalizedPhone(True, "24106123456")),
        ("06.12.34.56", NormalizedPhone(False, "06123456")),
        ("(+241) 06 12 34 56", NormalizedPhone(True, "24106123456")),
        ("+241 (0)6 12 34 56", NormalizedPhone(True, "2416123456")),
        ("+241\u00a006\u202f12 34 56", NormalizedPhone(True, "24106123456")),
        ("+٢٤١٠٦١٢٣٤٥٦", NormalizedPhone(True, "24106123456")),
        ("+２４１０６１２３４５６", NormalizedPhone(True, "24106123456")),
    ],
)
def test_normalize_phone(raw, expected):
    assert normalize_phone(raw) == expected


@pytest.mark.parametrize("raw", ["", "   ", "abc", "06 12 34 5x", "++241", "+", "00", None, 612])
def test_normalize_phone_rejects(raw):
    with pytest.raises(PhoneFormatError):
        normalize_phone(raw)
