from wezas_core.tin import validate_tax_id


def test_validate_tax_id_cote_divoire_ncc():
    # Valide avec espace ou sans
    res = validate_tax_id("CI", "1234567 A").model_dump(mode="json")
    assert res["ok"] is True
    assert res["data"]["identifiant_formate"] == "1234567 A"
    assert "DGI" in res["data"]["autorite_fiscale"]

    res_tight = validate_tax_id("CI", "0123456z").model_dump(mode="json")
    assert res_tight["ok"] is True
    assert res_tight["data"]["identifiant_formate"] == "0123456 Z"

    # Invalide
    res_bad = validate_tax_id("CI", "123456").model_dump(mode="json")
    assert res_bad["ok"] is False
    assert res_bad["error"]["code"] == "IDENTIFIANT_INVALIDE"


def test_validate_tax_id_senegal_ninea():
    res = validate_tax_id("Sénégal", "001234567").model_dump(mode="json")
    assert res["ok"] is True
    assert res["data"]["identifiant_formate"] == "001234567"

    # Avec code COFI
    res_cofi = validate_tax_id("SN", "001234567 2v2").model_dump(mode="json")
    assert res_cofi["ok"] is True
    assert res_cofi["data"]["identifiant_formate"] == "001234567 2V2"


def test_validate_tax_id_cameroun_niu():
    res = validate_tax_id("Cameroun", "M012345678912A").model_dump(mode="json")
    assert res["ok"] is True
    assert res["data"]["identifiant_formate"] == "M012345678912A"


def test_validate_tax_id_kenya_kra_pin():
    res = validate_tax_id("Kenya", "P051234567Z").model_dump(mode="json")
    assert res["ok"] is True
    assert res["data"]["identifiant_formate"] == "P051234567Z"


def test_validate_tax_id_unsupported_country():
    res = validate_tax_id("GQ", "12345").model_dump(mode="json")
    assert res["ok"] is False
    assert res["error"]["code"] == "DONNEES_INDISPONIBLES"
