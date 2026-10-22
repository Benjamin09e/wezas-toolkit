"""Tests unitaires pour la validation et le décodage de RIB bancaires UEMOA / CEMAC."""

from wezas_core.rib import compute_rib_key, validate_rib


def test_compute_rib_key():
    # Exemple SGCI Côte d'Ivoire (CI008)
    # Banque: CI008, Guichet: 01111, Compte: 01234567890
    cle = compute_rib_key("CI008", "01111", "01234567890")
    assert len(cle) == 2
    assert cle.isdigit()


def test_validate_rib_valid():
    code_b = "CI008"
    code_g = "01111"
    compte = "01234567890"
    cle = compute_rib_key(code_b, code_g, compte)

    res = validate_rib(code_b, code_g, compte, cle)
    assert res.ok is True
    assert res.data["valide"] is True
    assert res.data["banque"]["nom"] == "Société Générale Côte d'Ivoire (SGCI)"
    assert res.data["banque"]["pays"] == "CI"
    assert res.data["banque"]["zone"] == "UEMOA"
    assert res.data["banque"]["bic"] == "SGBICIAB"


def test_validate_rib_invalid_key():
    code_b = "SN012"
    code_g = "01001"
    compte = "01234567890"
    cle_theorique = compute_rib_key(code_b, code_g, compte)
    cle_fausse = "00" if cle_theorique != "00" else "99"

    res = validate_rib(code_b, code_g, compte, cle_fausse)
    assert res.ok is False
    assert res.error.code.value == "IDENTIFIANT_INVALIDE"
    assert res.error.details["cle_calculee"] == cle_theorique


def test_validate_rib_unknown_bank_warning():
    code_b = "GA999"  # Gabon non répertorié
    code_g = "00100"
    compte = "12345678901"
    cle = compute_rib_key(code_b, code_g, compte)

    res = validate_rib(code_b, code_g, compte, cle)
    assert res.ok is True
    assert res.data["valide"] is True
    assert res.data["banque"]["pays"] == "GA"
    assert res.data["banque"]["zone"] == "CEMAC"
    assert len(res.avertissements) == 1
    assert res.avertissements[0].code == "BANQUE_NON_REPERTORIEE"
