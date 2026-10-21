import string

import pytest
from wezas_core.i18n import MESSAGES, pick, t


def _fields(template: str) -> set[str]:
    return {f for _, f, _, _ in string.Formatter().parse(template) if f}


@pytest.mark.parametrize("key", sorted(MESSAGES))
def test_every_message_is_bilingual_and_consistent(key):
    fr, en = MESSAGES[key]
    assert fr.strip() and en.strip() and fr != en
    assert _fields(fr) == _fields(en)


def test_t_substitutes_params():
    m = t("AMOUNT_UNREADABLE", entree="abc")
    assert "abc" in m.fr and "abc" in m.en


def test_t_unknown_key_raises():
    with pytest.raises(KeyError):
        t("NOPE")


def test_pick_language():
    m = t("AMOUNT_OUT_OF_RANGE")
    assert pick(m, "en") == m.en
    assert pick(m, "fr") == m.fr
    assert pick(m) == m.fr
