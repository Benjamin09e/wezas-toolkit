"""Tests unitaires pour la validation et l'algorithme NUBAN (Nigeria / Ghana)."""

from wezas_core.nuban import compute_nuban_check_digit, validate_nuban


def test_compute_nuban_check_digit():
    # Access Bank (044) avec série '000001457' -> check digit 9
    check = compute_nuban_check_digit("044", "000001457")
    assert check == 9

    # GTBank (058)
    check_gt = compute_nuban_check_digit("058", "012345678")
    assert 0 <= check_gt <= 9


def test_validate_nuban_valid():
    # Access Bank
    res = validate_nuban("044", "0000014579", country="NG")
    assert res.ok is True
    assert res.data["valide"] is True
    assert res.data["banque"]["nom"] == "Access Bank"
    assert res.data["banque"]["bic"] == "ACENNGMM"
    assert res.data["cle_calculee"] == "9"


def test_validate_nuban_invalid_check_digit():
    res = validate_nuban("044", "0000014570", country="NG")
    assert res.ok is False
    assert res.error.code.value == "IDENTIFIANT_INVALIDE"
    assert res.error.details["cle_calculee"] == "9"
    assert "0000014579" in res.error.suggestions


def test_validate_nuban_invalid_length():
    res = validate_nuban("044", "12345", country="NG")
    assert res.ok is False
    assert res.error.code.value == "ENTREE_INVALIDE"


def test_validate_nuban_fintech_6_digits():
    # Kuda Bank (090267)
    serial = "110001234"
    cd = compute_nuban_check_digit("090267", serial)
    full_acc = f"{serial}{cd}"

    res = validate_nuban("090267", full_acc, country="NG")
    assert res.ok is True
    assert res.data["valide"] is True
    assert res.data["banque"]["nom"] == "Kuda Bank (Microfinance Bank)"
