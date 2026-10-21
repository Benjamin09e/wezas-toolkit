import asyncio

import pytest
from fastmcp import Client
from wezas_core.currency import convert
from wezas_mcp.server import mcp


def result(amount, de, vers, taux=None):
    return convert(amount, de, vers, taux=taux).model_dump(mode="json")


@pytest.mark.parametrize(
    "amount, de, vers, expected",
    [
        (1, "EUR", "XAF", "656"),
        (100, "EUR", "XOF", "65596"),
        (655957, "XAF", "EUR", "1000.00"),
        (655.957, "XOF", "EUR", "1.00"),
        (15000, "XAF", "XOF", "15000"),
        (15000, "XOF", "XAF", "15000"),
        (0, "EUR", "XAF", "0"),
        ("15 000", "xaf", " eur ", "22.87"),
        ("1000,50", "XAF", "XOF", "1001"),
        (0.1, "EUR", "EUR", "0.10"),
    ],
)
def test_conversions_fixed(amount, de, vers, expected):
    out = result(amount, de, vers)
    assert out["ok"] is True
    assert out["data"]["resultat"] == expected
    assert out["confiance"] == "haute"
    assert out["data"]["parite_fixe"] is True


def test_usd_offline_fallback():
    # 100 EUR en USD avec taux indicatif (1.0850)
    out = result(100, "EUR", "USD")
    assert out["ok"] is True
    assert out["data"]["resultat"] == "108.50"
    assert out["data"]["parite_fixe"] is False
    assert out["confiance"] == "moyenne"
    assert "date_taux" in out["data"]
    warn_codes = [w["code"] for w in out["avertissements"]]
    assert "TAUX_INDICATIF_HORS_LIGNE" in warn_codes


def test_usd_custom_rate():
    # 1000 USD vers XAF avec taux personnalisé 600
    out = result(1000, "USD", "XAF", taux=600)
    assert out["ok"] is True
    assert out["data"]["resultat"] == "600000"
    assert out["data"]["taux_personnalise"] is True
    assert out["confiance"] == "haute"
    assert len(out["avertissements"]) == 0


def test_invalid_custom_rate():
    out = result(100, "USD", "EUR", taux=-1.5)
    assert out["ok"] is False
    assert out["error"]["code"] == "TAUX_INVALIDE"


@pytest.mark.parametrize("code", ["GBP", "JPY", "", None, 5])
def test_unsupported_currency(code):
    out = result(10, code, "EUR")
    assert out["ok"] is False
    assert out["error"]["code"] == "DEVISE_NON_SUPPORTEE"


@pytest.mark.parametrize("code", ["FCFA", "cfa", "F CFA"])
def test_ambiguous_cfa(code):
    out = result(10, code, "EUR")
    assert out["error"]["suggestions"] == ["XAF", "XOF"]


@pytest.mark.parametrize("amount", ["abc", "", -1, "-5", "NaN", "Infinity", 1e16, True, None])
def test_invalid_amount(amount):
    out = result(amount, "XAF", "EUR")
    assert out["ok"] is False
    assert out["error"]["code"] == "MONTANT_INVALIDE"


def test_mcp_currency_tool_callable():
    async def run():
        async with Client(mcp) as client:
            tools = await client.list_tools()
            names = [t.name for t in tools]
            assert "convertir_devise" in names
            res = await client.call_tool(
                "convertir_devise",
                {"montant": 100, "de": "EUR", "vers": "USD", "taux": 1.10},
            )
            return res.data

    data = asyncio.run(run())
    assert data["ok"] is True
    assert data["data"]["resultat"] == "110.00"
