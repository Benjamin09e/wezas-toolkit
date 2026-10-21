"""Serveur MCP du Wezas Africa Toolkit (transport stdio par défaut)."""

from fastmcp import FastMCP
from wezas_core.log import configure_logging, get_logger

from wezas_mcp import __version__
from wezas_mcp.tools import country as country_tools
from wezas_mcp.tools import currency as currency_tools
from wezas_mcp.tools import format_amount as format_amount_tools
from wezas_mcp.tools import operators as operators_tools
from wezas_mcp.tools import phone as phone_tools
from wezas_mcp.tools import vat as vat_tools

mcp = FastMCP(
    name="wezas-africa-toolkit",
    version=__version__,
    instructions=(
        "Outils hors ligne pour builders africains : validation de téléphone, "
        "conversion de devises, infos pays, formatage de devises, calcul de TVA, "
        "liste des opérateurs télécoms & mobile money. / Offline tools for African builders."
    ),
)


@mcp.tool
def ping() -> dict[str, str]:
    """Vérifie que le serveur répond. / Health check returning the server version."""
    return {"status": "ok", "version": __version__}


currency_tools.register(mcp)
phone_tools.register(mcp)
country_tools.register(mcp)
format_amount_tools.register(mcp)
vat_tools.register(mcp)
operators_tools.register(mcp)


def main() -> None:
    """Point d'entrée CLI / Docker."""
    import os
    configure_logging()
    get_logger("server").info("démarrage du serveur wezas-africa-toolkit %s", __version__)
    
    # Si la variable PORT est définie (ex: Render, Cloud Run, Heroku), démarrer en HTTP SSE
    port = os.environ.get("PORT")
    transport = os.environ.get("MCP_TRANSPORT")
    if port or transport == "sse":
        port_num = int(port) if port else 8000
        mcp.run(transport="sse", host="0.0.0.0", port=port_num)
    else:
        mcp.run()


if __name__ == "__main__":
    main()
