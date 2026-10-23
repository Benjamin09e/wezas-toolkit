import asyncio
import datetime as dt

from fastmcp import Client
from wezas_core.country import get_country_info
from wezas_core.holidays import calculate_easter
from wezas_mcp.server import mcp


def test_calculate_easter():
    # Dimanches de Pâques connus
    assert calculate_easter(2024) == dt.date(2024, 3, 31)
    assert calculate_easter(2025) == dt.date(2025, 4, 20)
    assert calculate_easter(2026) == dt.date(2026, 4, 5)


def test_get_country_info_gabon():
    res = get_country_info("Gabon", annee=2026).model_dump(mode="json")
    assert res["ok"] is True
    data = res["data"]
    assert data["indicatif"] == "+241"
    assert data["devise"]["code"] == "XAF"
    assert data["pays"]["capitale"] == "Libreville"
    assert "Africa/Libreville" in [tz["fuseau"] for tz in data["fuseaux_horaires"]]

    # Vérification des jours fériés gabonais
    feries = data["jours_feries"]
    noms_feries = [f["nom"] for f in feries]
    assert "Jour de l'An" in noms_feries
    assert "Fête du Travail" in noms_feries
    assert "Lundi de Pâques" in noms_feries
    # Lundi de Pâques 2026 doit être le 6 avril (Pâques = 5 avril)
    easter_mon = [f for f in feries if f["nom"] == "Lundi de Pâques"][0]
    assert easter_mon["date"] == "2026-04-06"
    assert easter_mon["type"] == "mobile_chretien"

    # Fête musulmane 2026 tabulée
    aid = [f for f in feries if "Aïd" in f["nom"]]
    assert len(aid) >= 1


def test_get_country_info_senegal_with_fields_filtering():
    res = get_country_info("SN", champs=["indicatif", "devise"]).model_dump(mode="json")
    assert res["ok"] is True
    data = res["data"]
    assert data["indicatif"] == "+221"
    assert data["devise"]["code"] == "XOF"
    assert "jours_feries" not in data


def test_get_country_info_rdc_congo():
    res = get_country_info("CD", annee=2026).model_dump(mode="json")
    assert res["ok"] is True
    assert res["data"]["indicatif"] == "+243"
    assert res["data"]["devise"]["code"] == "CDF"
    assert "M-Pesa" in res["data"]["mobile_money"]


def test_get_country_info_rwanda():
    res = get_country_info("Rwanda", annee=2026).model_dump(mode="json")
    assert res["ok"] is True
    assert res["data"]["indicatif"] == "+250"
    assert res["data"]["devise"]["code"] == "RWF"


def test_get_country_info_madagascar():
    res = get_country_info("Madagascar", annee=2026).model_dump(mode="json")
    assert res["ok"] is True
    assert res["data"]["indicatif"] == "+261"
    assert res["data"]["devise"]["code"] == "MGA"
    assert "Mvola" in res["data"]["mobile_money"]


def test_get_country_info_maroc():
    res = get_country_info("Maroc", annee=2026).model_dump(mode="json")
    assert res["ok"] is True
    assert res["data"]["indicatif"] == "+212"
    assert res["data"]["devise"]["code"] == "MAD"


def test_get_country_info_unknown_country():
    res = get_country_info("Atlantis").model_dump(mode="json")
    assert res["ok"] is False
    assert res["error"]["code"] == "PAYS_INCONNU"


def test_get_country_info_tanzania_and_uganda():
    res_tz = get_country_info("TZ", annee=2026).model_dump(mode="json")
    assert res_tz["ok"] is True
    assert res_tz["data"]["indicatif"] == "+255"
    assert res_tz["data"]["devise"]["code"] == "TZS"
    assert "M-Pesa" in res_tz["data"]["mobile_money"]

    res_ug = get_country_info("UG", annee=2026).model_dump(mode="json")
    assert res_ug["ok"] is True
    assert res_ug["data"]["indicatif"] == "+256"
    assert res_ug["data"]["devise"]["code"] == "UGX"
    assert "MTN MoMo" in res_ug["data"]["mobile_money"]

    res_za = get_country_info("ZA", annee=2026).model_dump(mode="json")
    assert res_za["ok"] is True
    assert res_za["data"]["indicatif"] == "+27"
    assert res_za["data"]["devise"]["code"] == "ZAR"
    assert "Vodapay" in res_za["data"]["mobile_money"]

    res_zm = get_country_info("ZM", annee=2026).model_dump(mode="json")
    assert res_zm["ok"] is True
    assert res_zm["data"]["indicatif"] == "+260"
    assert res_zm["data"]["devise"]["code"] == "ZMW"
    assert "Airtel Money" in res_zm["data"]["mobile_money"]

    # Tunisie (TN), Algérie (DZ), Égypte (EG)
    res_tn = get_country_info("TN", annee=2026).model_dump(mode="json")
    assert res_tn["ok"] is True
    assert res_tn["data"]["indicatif"] == "+216"
    assert res_tn["data"]["devise"]["code"] == "TND"

    res_dz = get_country_info("DZ", annee=2026).model_dump(mode="json")
    assert res_dz["ok"] is True
    assert res_dz["data"]["indicatif"] == "+213"
    assert res_dz["data"]["devise"]["code"] == "DZD"

    res_eg = get_country_info("EG", annee=2026).model_dump(mode="json")
    assert res_eg["ok"] is True
    assert res_eg["data"]["indicatif"] == "+20"
    assert res_eg["data"]["devise"]["code"] == "EGP"
    assert "Vodafone Cash" in res_eg["data"]["mobile_money"]


def test_missing_lunar_year_adds_warning():
    # 2040 n'est pas tabulé pour les fêtes musulmanes
    res = get_country_info("Sénégal", annee=2040).model_dump(mode="json")
    assert res["ok"] is True
    warn_codes = [w["code"] for w in res["avertissements"]]
    assert "FETES_LUNAIRES_NON_RENSEIGNEES" in warn_codes


def test_mcp_info_pays_callable():
    async def run():
        async with Client(mcp) as client:
            tools = await client.list_tools()
            names = [t.name for t in tools]
            assert "info_pays" in names
            res = await client.call_tool("info_pays", {"pays": "CI", "annee": 2026})
            return res.data

    data = asyncio.run(run())
    assert data["ok"] is True
    assert data["data"]["indicatif"] == "+225"
    assert data["data"]["pays"]["nom"] == "Côte d'Ivoire"
