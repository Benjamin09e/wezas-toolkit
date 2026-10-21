import asyncio

from fastmcp import Client
from wezas_mcp import __version__
from wezas_mcp.server import mcp


def test_ping_tool_listed_and_callable():
    async def run():
        async with Client(mcp) as client:
            tools = await client.list_tools()
            assert "ping" in [t.name for t in tools]
            result = await client.call_tool("ping", {})
            return result.data

    data = asyncio.run(run())
    assert data == {"status": "ok", "version": __version__}
