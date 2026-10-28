"""Tests unitaires pour la génération et le décodage de QR codes de paiement (EMVCo & Mobile Money)."""

from wezas_core.qrcode import compute_crc16_ccitt, decode_payment_qr, generate_emv_qr


def test_compute_crc16_ccitt():
    # Test vector standard EMVCo
    # Pour un payload se terminant par '6304'
    payload = "0002010102122612012345678901520400005303952540815000.005802CI5910SUPERMARCH6007ABIDJAN6304"
    crc = compute_crc16_ccitt(payload)
    assert len(crc) == 4
    assert crc.isalnum()


def test_generate_emv_qr_success_dynamic():
    env = generate_emv_qr(
        merchant_name="Boutique Dakar",
        merchant_city="Dakar",
        country="SN",
        merchant_account="01234567890",
        currency="XOF",
        amount=5000,
        reference="CMD-994",
    )
    assert env.ok is True
    data = env.data
    assert data["norme"] == "EMVCo Merchant-Presented Mode (ISO/IEC 18004)"
    assert data["marchand"]["pays"] == "SN"
    assert data["devise"] == "XOF"
    assert data["code_devise_iso"] == "952"
    assert data["montant"] == "5000.00"
    assert data["type_initiation"] == "dynamic"
    payload = data["payload"]
    assert payload.startswith("000201")
    assert "Dakar" in payload


def test_decode_emv_qr_success():
    gen_env = generate_emv_qr(
        merchant_name="Supermarche Abidjan",
        merchant_city="Abidjan",
        country="CI",
        merchant_account="ACC123",
        currency="XOF",
        amount=12500,
    )
    payload = gen_env.data["payload"]

    dec_env = decode_payment_qr(payload)
    assert dec_env.ok is True
    dec_data = dec_env.data
    assert dec_data["type"] == "emvco"
    assert dec_data["valide_crc"] is True
    assert dec_data["marchand"]["nom"] == "Supermarche Abidjan"
    assert dec_data["marchand"]["ville"] == "Abidjan"
    assert dec_data["marchand"]["pays"] == "CI"
    assert dec_data["devise"] == "XOF"
    assert dec_data["montant"] == "12500.00"


def test_decode_mobile_money_qr():
    # Format Wave
    wave_env = decode_payment_qr("WAVE:+221771234567:2500:Facture42")
    assert wave_env.ok is True
    assert wave_env.data["type"] == "mobile_money_direct"
    assert wave_env.data["operateur"] == "Wave"
    assert wave_env.data["telephone"] == "+221771234567"
    assert wave_env.data["montant"] == "2500"
    assert wave_env.data["reference"] == "Facture42"

    # Format Orange Money
    om_env = decode_payment_qr("OM:+2250700000000:10000:CMD1")
    assert om_env.ok is True
    assert om_env.data["operateur"] == "Orange Money"

    # Format MTN MoMo
    momo_env = decode_payment_qr("MOMO:+237670000000:5000")
    assert momo_env.ok is True
    assert momo_env.data["operateur"] == "MTN MoMo"


def test_decode_unrecognized_qr():
    env = decode_payment_qr("UNRECOGNIZED_QR_CODE_DATA")
    assert env.ok is False
    assert env.error.code == "ENTREE_INVALIDE"


def test_generate_emv_qr_invalid_currency():
    env = generate_emv_qr(
        merchant_name="Test",
        merchant_city="Test",
        country="GA",
        merchant_account="123",
        currency="XYZ",
    )
    assert env.ok is False
    assert env.error.code == "DEVISE_NON_SUPPORTEE"
