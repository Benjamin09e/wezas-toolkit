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


def test_get_country_info_unknown_country():
    res = get_country_info("Atlantis").model_dump(mode="json")
    assert res["ok"] is False
    assert res["error"]["code"] == "PAYS_INCONNU"


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
