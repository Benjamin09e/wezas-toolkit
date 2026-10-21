import asyncio

import pytest
from fastmcp import Client
from wezas_core.currency import convert
from wezas_mcp.server import mcp


def result(amount, de, vers):
    return convert(amount, de, vers).model_dump(mode="json")


@pytest.mark.parametrize(
    "amount, de, vers, expected",
    [
        (1, "EUR", "XAF", "656"),  # 655,957 arrondi
        (100, "EUR", "XOF", "65596"),  # 65595,7
        (655957, "XAF", "EUR", "1000.00"),
        (655.957, "XOF", "EUR", "1.00"),
        (15000, "XAF", "XOF", "15000"),
        (15000, "XOF", "XAF", "15000"),
        (0, "EUR", "XAF", "0"),
        ("15 000", "xaf", " eur ", "22.87"),
        ("1000,50", "XAF", "XOF", "1001"),  # virgule décimale, arrondi vers le haut
        (0.1, "EUR", "EUR", "0.10"),
    ],
)
def test_conversions(amount, de, vers, expected):
    out = result(amount, de, vers)
    assert out["ok"] is True
    assert out["data"]["resultat"] == expected
    assert out["confiance"] == "haute"
    assert out["data"]["parite_fixe"] is True


def test_rate_is_exact():
    assert result(1, "EUR", "XAF")["data"]["taux"] == "655.957"
    assert result(1, "XAF", "XOF")["data"]["taux"] == "1"


def test_large_amount_exact():
    big = "123456789012"
    to_eur = result(big, "XAF", "EUR")["data"]["resultat"]
    assert to_eur == "188208661.56"


@pytest.mark.parametrize("code", ["USD", "GBP", "", None, 5])
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


def test_mcp_tool_listed_and_callable():
    async def run():
        async with Client(mcp) as client:
            names = [t.name for t in await client.list_tools()]
            res = await client.call_tool(
                "convertir_devise", {"montant": 1000, "de": "EUR", "vers": "XAF"}
            )
            return names, res.data

    names, data = asyncio.run(run())
    assert "convertir_devise" in names
    assert data["ok"] is True
    assert data["data"]["resultat"] == "655957"
