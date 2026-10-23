"""Tests unitaires pour la validation d'IBAN africains (Maroc, Tunisie, Égypte...)."""

from wezas_core.iban import compute_iban_mod97, validate_african_iban


def test_compute_iban_mod97_valid():
    # Exemple IBAN Maroc (28 caractères)
    # MA64 011 780 0000123456789012 34
    # Calculons un IBAN synthétique mathématiquement valide
    # Soit MA00 avec BBAN
    bban = "011780000012345678901234"
    # Format rearranged: bban + MA00 (MA -> 2210)
    # 221000
    pre_num = bban + "221000"
    remainder = int(pre_num) % 97
    check = 98 - remainder
    valid_iban = f"MA{check:02d}{bban}"

    assert compute_iban_mod97(valid_iban) == 1
    res = validate_african_iban(valid_iban)
    assert res.ok is True
    assert res.data["valide"] is True
    assert res.data["pays"]["iso2"] == "MA"
    assert res.data["code_banque"] == "011"


def test_validate_african_iban_tunisia():
    # Tunisie (TN) : 24 caractères (TN + 2 chiffres clé + 20 chiffres)
    bban = "10001000123456789012"
    pre_num = bban + "292300"  # TN = 2923
    remainder = int(pre_num) % 97
    check = 98 - remainder
    valid_iban = f"TN{check:02d}{bban}"

    res = validate_african_iban(valid_iban)
    assert res.ok is True
    assert res.data["valide"] is True
    assert res.data["pays"]["iso2"] == "TN"
    assert res.data["code_banque"] == "10"


def test_validate_african_iban_invalid_checksum():
    # Clé erronée 00
    fake_iban = "MA00011780000012345678901234"
    res = validate_african_iban(fake_iban)
    assert res.ok is False
    assert res.error.code.value == "IDENTIFIANT_INVALIDE"


def test_validate_african_iban_unsupported_country():
    res = validate_african_iban("FR7630006000011234567890189")
    assert res.ok is False
    assert res.error.code.value == "DONNEES_INDISPONIBLES"


def test_validate_african_iban_invalid_length():
    res = validate_african_iban("MA12345")
    assert res.ok is False
    assert res.error.code.value == "ENTREE_INVALIDE"
