from wezas_core.envelope import ErrorCode
from wezas_core.format_amount import format_amount


def test_format_amount_xaf_default():
    env = format_amount(15000, "XAF")
    assert env.ok is True
    assert env.data["montant_formate"] == "15 000 FCFA"
    assert env.data["devise"] == "XAF"
    assert env.data["decimales"] == 0


def test_format_amount_with_country():
    env = format_amount("2500000", pays="Sénégal")
    assert env.ok is True
    assert env.data["montant_formate"] == "2 500 000 FCFA"
    assert env.data["devise"] == "XOF"
    assert env.data["pays"] == "SN"


def test_format_amount_eur():
    env = format_amount(1234.5, "EUR")
    assert env.ok is True
    assert env.data["montant_formate"] == "1 234,50 €"
    assert env.data["devise"] == "EUR"


def test_format_amount_usd():
    env = format_amount(1234.5, "USD")
    assert env.ok is True
    assert env.data["montant_formate"] == "$1,234.50"
    assert env.data["devise"] == "USD"


def test_format_amount_without_symbol():
    env = format_amount(50000, "XAF", inclure_symbole=False)
    assert env.ok is True
    assert env.data["montant_formate"] == "50 000"


def test_format_amount_custom_decimals():
    env = format_amount(50.5, "EUR", decimales=3)
    assert env.ok is True
    assert env.data["montant_formate"] == "50,500 €"


def test_format_amount_ambiguous_fcfa_without_country():
    env = format_amount(1000, devise="FCFA")
    assert env.ok is False
    assert env.error.code == ErrorCode.DEVISE_NON_SUPPORTEE
    assert "XAF" in env.error.suggestions
    assert "XOF" in env.error.suggestions


def test_format_amount_ambiguous_fcfa_resolved_by_country():
    env = format_amount(1000, devise="FCFA", pays="Gabon")
    assert env.ok is True
    assert env.data["devise"] == "XAF"
    assert env.data["montant_formate"] == "1 000 FCFA"


def test_format_amount_invalid_inputs():
    assert format_amount("abc", "XAF").ok is False
    assert format_amount(True, "XAF").ok is False
    assert format_amount(-10, "XAF").ok is False
    assert format_amount(100, pays="Atlantide").ok is False
    assert format_amount(100, devise="XYZ").ok is False
