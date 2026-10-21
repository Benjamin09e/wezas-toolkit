import asyncio

from fastmcp import Client
from wezas_mcp import __version__
from wezas_mcp.server import mcp


def test_ping_tool_listed_and_callable():
    async def run():
        async with Client(mcp) as client:
            tools = await client.list_tools()
            names = [t.name for t in tools]
            assert "ping" in names
            assert "valider_telephone" in names
            assert "convertir_devise" in names
            assert "info_pays" in names
            assert "formater_montant" in names
            assert "calculer_tva" in names
            assert "lister_operateurs" in names
            result = await client.call_tool("ping", {})
            return result.data

    data = asyncio.run(run())
    assert data == {"status": "ok", "version": __version__}
