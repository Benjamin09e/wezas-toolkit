"""Serveur MCP du Wezas Africa Toolkit (transport stdio par défaut)."""

from fastmcp import FastMCP
from wezas_core.log import configure_logging, get_logger

from wezas_mcp import __version__
from wezas_mcp.tools import currency as currency_tools
from wezas_mcp.tools import phone as phone_tools

mcp = FastMCP(
    name="wezas-africa-toolkit",
    version=__version__,
    instructions=(
        "Outils hors ligne pour builders africains : validation de téléphone, "
        "conversion de devises, infos pays. / Offline tools for African builders."
    ),
)


@mcp.tool
def ping() -> dict[str, str]:
    """Vérifie que le serveur répond. / Health check returning the server version."""
    return {"status": "ok", "version": __version__}


currency_tools.register(mcp)
phone_tools.register(mcp)


def main() -> None:
    """Point d'entrée : démarre le serveur en stdio."""
    configure_logging()
    get_logger("server").info("démarrage du serveur wezas-africa-toolkit %s", __version__)
    mcp.run()


if __name__ == "__main__":
    main()
