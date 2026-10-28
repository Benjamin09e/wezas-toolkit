"""Tests unitaires pour la validation et détection des cartes bancaires."""

from wezas_core.card import luhn_checksum_valid, mask_card_number, validate_card


def test_luhn_checksum_valid():
    assert luhn_checksum_valid("49927398716") is True
    assert luhn_checksum_valid("49927398717") is False
    assert luhn_checksum_valid("abc") is False


def test_mask_card_number():
    assert mask_card_number("5054851234567890") == "505485******7890"
    assert mask_card_number("4111 1111 1111 1111") == "411111******1111"


def test_validate_card_visa_success():
    # PAN Visa valide (commence par 4 + 16 chiffres + Luhn valide)
    env = validate_card("4000001234567899")
    assert env.ok is True
    data = env.data
    assert data["valide"] is True
    assert data["reseau"]["id"] == "visa"
    assert data["reseau"]["nom"] == "Visa"
    assert data["reseau"]["type"] == "international"
    assert data["bin"] == "400000"
    assert data["derniers_chiffres"] == "7899"
    assert data["luhn_valide"] is True


def test_validate_card_mastercard_success():
    # Mastercard préfixe 51
    env = validate_card("5105105105105100")
    assert env.ok is True
    data = env.data
    assert data["valide"] is True
    assert data["reseau"]["id"] == "mastercard"
    assert data["reseau"]["nom"] == "Mastercard"


def test_validate_card_gimac_cemac():
    # BIN GIMAC 505485 + Luhn valide
    env = validate_card("5054851234567899")
    assert env.ok is True
    data = env.data
    assert data["reseau"]["id"] == "gimac"
    assert "CEMAC" in data["reseau"]["region"]
    assert "CM" in data["reseau"]["pays_associes"]
    assert "GA" in data["reseau"]["pays_associes"]


def test_validate_card_gim_uemoa():
    # BIN GIM-UEMOA 505801 + Luhn valide
    env = validate_card("5058011234567896")
    assert env.ok is True
    data = env.data
    assert data["reseau"]["id"] == "gim_uemoa"
    assert "UEMOA" in data["reseau"]["region"]
    assert "CI" in data["reseau"]["pays_associes"]
    assert "SN" in data["reseau"]["pays_associes"]


def test_validate_card_verve():
    # BIN Verve 506101 + Luhn valide
    env = validate_card("5061011234567891")
    assert env.ok is True
    data = env.data
    assert data["reseau"]["id"] == "verve"
    assert data["reseau"]["nom"] == "Verve"
    assert "NG" in data["reseau"]["pays_associes"]


def test_validate_card_invalid_luhn():
    # 4000001234567892 n'a pas le bon Luhn (9 attendu)
    env = validate_card("4000001234567892")
    assert env.ok is True
    assert env.data["valide"] is False
    assert env.data["luhn_valide"] is False
    assert any(w.code == "CLE_LUHN_INVALIDE" for w in env.avertissements)


def test_validate_card_invalid_characters():
    env = validate_card("4000-0012-34AB-7892")
    assert env.ok is False
    assert env.error.code == "NUMERO_INVALIDE"


def test_validate_card_empty():
    env = validate_card("")
    assert env.ok is False
    assert env.error.code == "ENTREE_INVALIDE"
