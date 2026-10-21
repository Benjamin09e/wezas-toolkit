from pathlib import Path

import pytest
import yaml
from wezas_core.loader import DataError, get_countries, load_countries, load_country_file

FIXTURES = Path(__file__).parent / "fixtures" / "countries"


def test_valid_country_loads():
    c = load_country_file(FIXTURES / "zz.yaml")
    assert c.iso2 == "ZZ"
    assert c.numbering_plan.national_length == 9
    assert c.holidays.islamic[2026][0].date.year == 2026


def test_load_countries_indexed_by_iso2():
    assert set(load_countries(FIXTURES)) == {"ZZ"}


def test_embedded_data_loads_and_is_cached():
    assert get_countries() is get_countries()


def test_missing_directory_gives_empty():
    assert load_countries(FIXTURES / "nope") == {}


def _write(tmp_path, mutate, name="zz.yaml"):
    data = yaml.safe_load((FIXTURES / "zz.yaml").read_text(encoding="utf-8"))
    mutate(data)
    p = tmp_path / name
    p.write_text(yaml.safe_dump(data, allow_unicode=True), encoding="utf-8")
    return p


@pytest.mark.parametrize(
    "mutate",
    [
        lambda d: d.update(sources=[]),
        lambda d: d.update(dial_code="241"),
        lambda d: d.update(unknown_field=1),
        lambda d: d["numbering_plan"]["ranges"][0].update(prefixes=["6a"]),
        lambda d: d.pop("last_verified"),
        lambda d: d["holidays"]["islamic"].update({2027: d["holidays"]["islamic"][2026]}),
    ],
)
def test_invalid_data_rejected(tmp_path, mutate):
    with pytest.raises(DataError):
        load_country_file(_write(tmp_path, mutate))


def test_filename_must_match_iso2(tmp_path):
    with pytest.raises(DataError, match="zz.yaml"):
        load_country_file(_write(tmp_path, lambda d: None, name="ga.yaml"))


def test_duplicate_country_rejected(tmp_path):
    _write(tmp_path, lambda d: None, name="zz.yaml")
    dup = tmp_path / "ZZ.yaml"
    dup.write_text((tmp_path / "zz.yaml").read_text(encoding="utf-8"), encoding="utf-8")
    if len(list(tmp_path.glob("*.yaml"))) == 2:  # FS sensible à la casse
        with pytest.raises(DataError, match="double"):
            load_countries(tmp_path)
