from wezas_core.payment import generate_payment_link


def test_generate_payment_link_wave_senegal():
    res = generate_payment_link(
        operateur="Wave",
        telephone="771234567",
        montant=5000,
        pays="Sénégal",
        reference="CMD-994",
    ).model_dump(mode="json")

    assert res["ok"] is True
    data = res["data"]
    assert data["operateur"] == "Wave Mobile Money"
    assert "https://wave.com/send" in data["deeplink"]
    assert "recipient=%2B221771234567" in data["deeplink"] or "+221771234567" in data["deeplink"]
    assert "CMD-994" in data["qr_payload"]


def test_generate_payment_link_orange_money_cameroun():
    res = generate_payment_link(
        operateur="Orange Money",
        telephone="691234567",
        montant=15000,
        pays="CM",
    ).model_dump(mode="json")

    assert res["ok"] is True
    data = res["data"]
    assert data["code_ussd"] is not None
    assert "#150*" in data["code_ussd"]


def test_generate_payment_link_invalid_amount():
    res = generate_payment_link(
        operateur="Wave",
        telephone="771234567",
        montant=-500,
        pays="SN",
    ).model_dump(mode="json")

    assert res["ok"] is False
    assert res["error"]["code"] == "MONTANT_INVALIDE"


def test_generate_payment_link_unsupported_network_in_country():
    # Wave n'est pas au Cameroun
    res = generate_payment_link(
        operateur="Wave",
        telephone="691234567",
        montant=1000,
        pays="CM",
    ).model_dump(mode="json")

    assert res["ok"] is False
    assert res["error"]["code"] == "DONNEES_INDISPONIBLES"
