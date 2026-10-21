import datetime as dt

import pytest
from pydantic import ValidationError
from wezas_core.envelope import Envelope, ErrorCode, Warning_, failure, success
from wezas_core.models import LocalizedName

_ERR = {"code": "ERREUR_INTERNE", "message": {"fr": "x", "en": "y"}}


def test_success_envelope():
    env = success(
        {"valide": True},
        source="ARCEP",
        derniere_verification=dt.date(2026, 10, 21),
        confiance="haute",
        avertissements=[Warning_(code="PORTABILITE", message=LocalizedName(fr="a", en="b"))],
    )
    dumped = env.model_dump(mode="json")
    assert dumped["ok"] is True and dumped["error"] is None
    assert dumped["derniere_verification"] == "2026-10-21"
    assert dumped["avertissements"][0]["code"] == "PORTABILITE"


def test_failure_envelope():
    env = failure(
        ErrorCode.PAYS_INCONNU,
        "Pays inconnu",
        "Unknown country",
        suggestions=["GA", "CM"],
    )
    dumped = env.model_dump(mode="json")
    assert dumped["ok"] is False and dumped["data"] is None
    assert dumped["error"]["code"] == "PAYS_INCONNU"
    assert dumped["error"]["message"]["en"] == "Unknown country"


@pytest.mark.parametrize(
    "kwargs",
    [
        {"ok": True},
        {"ok": False},
        {"ok": True, "data": {}, "error": _ERR},
        {"ok": False, "data": {}, "error": _ERR},
        {"ok": True, "data": {}, "confiance": "certaine"},
        {"ok": True, "data": {}, "extra": 1},
    ],
)
def test_invalid_envelopes_rejected(kwargs):
    with pytest.raises(ValidationError):
        Envelope(**kwargs)


def test_invalid_warning_code_rejected():
    with pytest.raises(ValidationError):
        Warning_(code="minuscule", message=LocalizedName(fr="a", en="b"))
