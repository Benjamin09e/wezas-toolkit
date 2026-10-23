import asyncio

from fastmcp import Client
from wezas_core.phone import validate_phone
from wezas_mcp.server import mcp


def test_validate_gabon_airtel():
    res = validate_phone("Gabon", "077 12 34 56").model_dump(mode="json")
    assert res["ok"] is True
    assert res["data"]["valide"] is True
    assert res["data"]["e164"] == "+24177123456"
    assert res["data"]["format_national"] == "077123456"
    assert "Airtel" in res["data"]["operateur_probable"]
    assert "Airtel Money" in res["data"]["mobile_money"]


def test_validate_gabon_libertis_international():
    res = validate_phone("GA", "+241 66 12 34 56").model_dump(mode="json")
    assert res["ok"] is True
    assert res["data"]["valide"] is True
    assert res["data"]["e164"] == "+24166123456"
    op = res["data"]["operateur_probable"]
    assert "Moov" in op or "Libertis" in op
    assert "Moov Money" in res["data"]["mobile_money"]


def test_validate_senegal_wave_orange():
    res = validate_phone("Sénégal", "77 123 45 67").model_dump(mode="json")
    assert res["ok"] is True
    assert res["data"]["valide"] is True
    assert res["data"]["e164"] == "+221771234567"
    assert "Orange" in res["data"]["operateur_probable"]
    assert "Wave" in res["data"]["mobile_money"]
    assert "Orange Money" in res["data"]["mobile_money"]


def test_validate_cote_divoire_10_digits():
    res = validate_phone("Côte d'Ivoire", "07 12 34 56 78").model_dump(mode="json")
    assert res["ok"] is True
    assert res["data"]["valide"] is True
    assert res["data"]["e164"] == "+2250712345678"
    assert "Orange" in res["data"]["operateur_probable"]
    assert "Orange Money" in res["data"]["mobile_money"]


def test_validate_benin_10_digits_celtiis():
    res = validate_phone("Bénin", "01 40 12 34 56").model_dump(mode="json")
    assert res["ok"] is True
    assert res["data"]["valide"] is True
    assert res["data"]["e164"] == "+2290140123456"
    assert "Celtiis" in res["data"]["operateur_probable"]
    assert "Celtiis Cash" in res["data"]["mobile_money"]


def test_invalid_length_returns_ok_true_valide_false():
    res = validate_phone("Gabon", "077 12 34").model_dump(mode="json")
    assert res["ok"] is True
    assert res["data"]["valide"] is False
    assert "Longueur invalide" in res["data"]["motif"]


def test_unknown_country_returns_error():
    res = validate_phone("InconnuLand", "077 12 34 56").model_dump(mode="json")
    assert res["ok"] is False
    assert res["error"]["code"] == "PAYS_INCONNU"


def test_unreadable_phone_returns_error():
    res = validate_phone("Gabon", "numero-invalide-abc").model_dump(mode="json")
    assert res["ok"] is False
    assert res["error"]["code"] == "NUMERO_INVALIDE"


def test_validate_phone_expansion_countries():
    # RDC (CD) - Vodacom (81/82)
    res_cd = validate_phone("CD", "081 123 4567").model_dump(mode="json")
    assert res_cd["ok"] is True
    assert res_cd["data"]["e164"] == "+243811234567"
    assert res_cd["data"]["operateur_probable"] == "Vodacom RDC"
    assert "M-Pesa" in res_cd["data"]["mobile_money"]

    # Rwanda (RW) - MTN (78/79)
    res_rw = validate_phone("RW", "078 123 4567").model_dump(mode="json")
    assert res_rw["ok"] is True
    assert res_rw["data"]["e164"] == "+250781234567"
    assert res_rw["data"]["operateur_probable"] == "MTN Rwanda"

    # Madagascar (MG) - Telma (34)
    res_mg = validate_phone("MG", "034 12 345 67").model_dump(mode="json")
    assert res_mg["ok"] is True
    assert res_mg["data"]["e164"] == "+261341234567"
    assert res_mg["data"]["operateur_probable"] == "Telma Madagascar"

    # Maroc (MA) - Orange Maroc (66)
    res_ma = validate_phone("MA", "066 12 34 567").model_dump(mode="json")
    assert res_ma["ok"] is True
    assert res_ma["data"]["e164"] == "+212661234567"
    assert res_ma["data"]["operateur_probable"] == "Orange Maroc"


    # Tanzanie (TZ) - Vodacom (75)
    res_tz = validate_phone("TZ", "0754 12 34 56").model_dump(mode="json")
    assert res_tz["ok"] is True
    assert res_tz["data"]["e164"] == "+255754123456"
    assert "Vodacom" in res_tz["data"]["operateur_probable"]
    assert "M-Pesa" in res_tz["data"]["mobile_money"]

    # Ouganda (UG) - MTN (77)
    res_ug = validate_phone("UG", "0772 12 34 56").model_dump(mode="json")
    assert res_ug["ok"] is True
    assert res_ug["data"]["e164"] == "+256772123456"
    assert "MTN" in res_ug["data"]["operateur_probable"]
    assert "MTN MoMo" in res_ug["data"]["mobile_money"]

    # Afrique du Sud (ZA) - Vodacom (82)
    res_za = validate_phone("ZA", "082 123 4567").model_dump(mode="json")
    assert res_za["ok"] is True
    assert res_za["data"]["e164"] == "+27821234567"
    assert "Vodacom" in res_za["data"]["operateur_probable"]
    assert "Vodapay" in res_za["data"]["mobile_money"]

    # Zambie (ZM) - Airtel (97)
    res_zm = validate_phone("ZM", "097 123 4567").model_dump(mode="json")
    assert res_zm["ok"] is True
    assert res_zm["data"]["e164"] == "+260971234567"
    assert "Airtel" in res_zm["data"]["operateur_probable"]
    assert "Airtel Money" in res_zm["data"]["mobile_money"]

    # Tunisie (TN) - Ooredoo (2)
    res_tn = validate_phone("TN", "20 123 456").model_dump(mode="json")
    assert res_tn["ok"] is True
    assert res_tn["data"]["e164"] == "+21620123456"
    assert "Ooredoo" in res_tn["data"]["operateur_probable"]

    # Algérie (DZ) - Mobilis (6)
    res_dz = validate_phone("DZ", "0661 12 34 56").model_dump(mode="json")
    assert res_dz["ok"] is True
    assert res_dz["data"]["e164"] == "+213661123456"
    assert "Mobilis" in res_dz["data"]["operateur_probable"]

    # Égypte (EG) - Vodafone (10)
    res_eg = validate_phone("EG", "0100 123 4567").model_dump(mode="json")
    assert res_eg["ok"] is True
    assert res_eg["data"]["e164"] == "+201001234567"
    assert "Vodafone" in res_eg["data"]["operateur_probable"]


def test_mcp_phone_tool_callable():
    async def run():
        async with Client(mcp) as client:
            tools = await client.list_tools()
            names = [t.name for t in tools]
            assert "valider_telephone" in names
            res = await client.call_tool("valider_telephone", {"pays": "GA", "numero": "074123456"})
            return res.data

    data = asyncio.run(run())
    assert data["ok"] is True
    assert data["data"]["valide"] is True
    assert data["data"]["e164"] == "+24174123456"
