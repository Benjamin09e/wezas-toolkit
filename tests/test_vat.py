from wezas_core.vat import calculate_vat


def test_calculate_vat_gabon_standard_ht():
    # Gabon standard TVA: 18%
    env = calculate_vat(10000, pays="Gabon", mode="ht")
    assert env.ok is True
    assert env.data["pays"] == "GA"
    assert env.data["taux"] == 0.18
    assert env.data["montant_ht"] == "10000"
    assert env.data["montant_taxe"] == "1800"
    assert env.data["montant_ttc"] == "11800"
    assert "DGI" in env.source


def test_calculate_vat_cameroun_with_cac():
    # Cameroun: 19.25% (17.5% + CAC)
    env = calculate_vat(100000, pays="CM", mode="ht")
    assert env.ok is True
    assert env.data["pays"] == "CM"
    assert env.data["taux"] == 0.1925
    assert env.data["montant_ht"] == "100000"
    assert env.data["montant_taxe"] == "19250"
    assert env.data["montant_ttc"] == "119250"


def test_calculate_vat_mode_ttc():
    # TTC vers HT au Gabon (18%)
    env = calculate_vat(11800, pays="GA", mode="ttc")
    assert env.ok is True
    assert env.data["montant_ttc"] == "11800"
    assert env.data["montant_ht"] == "10000"
    assert env.data["montant_taxe"] == "1800"


def test_calculate_vat_reduit():
    # Gabon taux réduit: 10%
    env = calculate_vat(10000, pays="GA", type_taux="reduit")
    assert env.ok is True
    assert env.data["taux"] == 0.10
    assert env.data["montant_taxe"] == "1000"
    assert env.data["montant_ttc"] == "11000"


def test_calculate_vat_custom_rate():
    env = calculate_vat(10000, pays="CI", taux_personnalise=0.05)
    assert env.ok is True
    assert env.data["taux"] == 0.05
    assert env.data["montant_taxe"] == "500"
    assert env.data["montant_ttc"] == "10500"


def test_calculate_vat_invalid():
    assert calculate_vat(-100, pays="GA").ok is False
    assert calculate_vat("abc", pays="GA").ok is False
    assert calculate_vat(1000, pays="Inconnu").ok is False
    assert calculate_vat(1000, pays="GA", taux_personnalise=2.5).ok is False
