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
