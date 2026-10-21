"""Serveur MCP du Wezas Africa Toolkit (transport stdio par défaut)."""

from fastmcp import FastMCP

from wezas_mcp import __version__

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


def main() -> None:
    """Point d'entrée : démarre le serveur en stdio."""
    mcp.run()


if __name__ == "__main__":
    main()
