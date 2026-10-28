"""Tests unitaires pour le calculateur de taxes transactionnelles et retenues à la source."""

from wezas_core.taxes import calculate_transaction_tax


def test_calculate_e_levy_ghana_with_daily_exemption():
    # Premier transfert de 150 GHS : 100 GHS exonérés, 50 GHS taxables à 1% = 0.50 GHS
    env = calculate_transaction_tax(pays="GH", montant=150, type_taxe="e_levy", cumul_journalier_precedent=0)
    assert env.ok is True
    data = env.data
    assert data["taxe"]["code"] == "e_levy"
    assert data["calcul"]["base_imposable"] == 50.0
    assert data["calcul"]["montant_taxe"] == 0.5
    assert data["calcul"]["montant_apres_taxe"] == 150.5
    assert any(w.code == "EXONERATION_PARTIELLE_E_LEVY" for w in env.avertissements)


def test_calculate_e_levy_ghana_exemption_exhausted():
    # Si le cumul précédent est déjà de 100 GHS, les 200 GHS sont taxables à 1% = 2.00 GHS
    env = calculate_transaction_tax(pays="GH", montant=200, type_taxe="e_levy", cumul_journalier_precedent=100)
    assert env.ok is True
    assert env.data["calcul"]["base_imposable"] == 200.0
    assert env.data["calcul"]["montant_taxe"] == 2.0


def test_calculate_taxe_transfert_argent_cameroun():
    # Taxe 0.2% sur transferts Mobile Money au Cameroun
    env = calculate_transaction_tax(pays="CM", montant=100000, type_taxe="taxe_transfert_argent")
    assert env.ok is True
    data = env.data
    assert data["taxe"]["code"] == "taxe_transfert_argent"
    assert data["calcul"]["montant_taxe"] == 200.0  # 100 000 * 0.002
    assert data["calcul"]["montant_apres_taxe"] == 100200.0


def test_calculate_withholding_tax_cote_divoire():
    # Retenue à la source BRS 7.5% sur prestation de 1 000 000 XOF
    env = calculate_transaction_tax(pays="CI", montant=1000000, type_taxe="brs_services")
    assert env.ok is True
    data = env.data
    assert data["taxe"]["type_prelevement"] == "retenue_a_la_source"
    assert data["calcul"]["montant_taxe"] == 75000.0
    # Net versé au prestataire = 1 000 000 - 75 000 = 925 000
    assert data["calcul"]["montant_apres_taxe"] == 925000.0


def test_calculate_nigeria_emtl_fixed_threshold():
    # En dessous de 10 000 NGN -> 0 taxe
    env_low = calculate_transaction_tax(pays="NG", montant=5000, type_taxe="emtl")
    assert env_low.ok is True
    assert env_low.data["calcul"]["montant_taxe"] == 0.0

    # Au dessus de 10 000 NGN -> 50 NGN forfaitaire
    env_high = calculate_transaction_tax(pays="NG", montant=25000, type_taxe="emtl")
    assert env_high.ok is True
    assert env_high.data["calcul"]["montant_taxe"] == 50.0
    assert env_high.data["calcul"]["montant_apres_taxe"] == 25050.0


def test_calculate_transaction_tax_invalid_amount():
    env = calculate_transaction_tax(pays="CI", montant=-500)
    assert env.ok is False
    assert env.error.code == "MONTANT_INVALIDE"


def test_calculate_transaction_tax_unknown_country():
    env = calculate_transaction_tax(pays="ZZ", montant=1000)
    assert env.ok is False
    assert env.error.code == "PAYS_INCONNU"
