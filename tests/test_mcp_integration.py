import asyncio
import os

from fastmcp import Client
from fastmcp.client.transports import StdioTransport


def test_mcp_stdio_real_session():
    """Vérifie le transport stdio réel via le binaire CLI."""
    async def run():
        transport = StdioTransport(
            command="uv",
            args=["run", "wezas-africa-toolkit"],
            cwd=os.path.abspath(os.path.join(os.path.dirname(__file__), "..")),
        )
        async with Client(transport) as client:
            # 1. Listing des outils disponibles
            tools = await client.list_tools()
            names = {t.name for t in tools}
            assert "ping" in names
            assert "valider_telephone" in names
            assert "convertir_devise" in names
            assert "info_pays" in names

            # 2. Appel de validation de téléphone
            res_phone = await client.call_tool(
                "valider_telephone", {"pays": "Gabon", "numero": "077123456"}
            )
            assert res_phone.data["ok"] is True
            assert res_phone.data["data"]["e164"] == "+24177123456"

            # 3. Appel de conversion de devise
            res_curr = await client.call_tool(
                "convertir_devise", {"montant": 1000, "de": "EUR", "vers": "XAF"}
            )
            assert res_curr.data["ok"] is True
            assert res_curr.data["data"]["resultat"] == "655957"

            # 4. Appel d'informations pays
            res_country = await client.call_tool("info_pays", {"pays": "Sénégal", "annee": 2026})
            assert res_country.data["ok"] is True
            assert res_country.data["data"]["indicatif"] == "+221"

    asyncio.run(run())
