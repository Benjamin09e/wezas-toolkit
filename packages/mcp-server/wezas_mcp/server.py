"""Serveur MCP du Wezas Africa Toolkit (transport stdio par défaut)."""

from typing import Any

from fastmcp import FastMCP
from wezas_core.log import configure_logging, get_logger

from wezas_mcp import __version__
from wezas_mcp.tools import country as country_tools
from wezas_mcp.tools import currency as currency_tools
from wezas_mcp.tools import format_amount as format_amount_tools
from wezas_mcp.tools import operators as operators_tools
from wezas_mcp.tools import payment as payment_tools
from wezas_mcp.tools import phone as phone_tools
from wezas_mcp.tools import rib as rib_tools
from wezas_mcp.tools import tin as tin_tools
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


@mcp.custom_route("/", methods=["GET"])
@mcp.custom_route("/health", methods=["GET"])
async def health_check(request: Any) -> Any:
    """Route HTTP racine et health check pour Render et navigateurs."""
    from starlette.responses import JSONResponse

    return JSONResponse(
        {
            "status": "ok",
            "service": "wezas-africa-toolkit",
            "version": __version__,
            "mcp_endpoint": "/sse",
            "tools": [
                "ping",
                "valider_telephone",
                "convertir_devise",
                "info_pays",
                "formater_montant",
                "calculer_tva",
                "valider_rib",
                "lister_operateurs",
                "valider_identifiant_fiscal",
                "generer_paiement_mobile_money",
            ],
        }
    )


@mcp.custom_route("/api/execute", methods=["POST"])
async def execute_tool_endpoint(request: Any) -> Any:
    """Endpoint HTTP direct pour exécuter un outil via JSON (pour le front Netlify/Web)."""
    from starlette.responses import JSONResponse

    try:
        body = await request.json()
        tool_name = body.get("tool")
        arguments = body.get("arguments", {})

        if not tool_name:
            return JSONResponse({"error": "Missing tool name"}, status_code=400)

        result = await mcp.call_tool(tool_name, arguments)

        # Récupération du contenu structuré ou du texte JSON
        if hasattr(result, "structured_content") and result.structured_content:
            return JSONResponse(result.structured_content)
        elif result.content and len(result.content) > 0:
            import json

            first_item = result.content[0]
            text_data = getattr(first_item, "text", str(first_item))
            try:
                return JSONResponse(json.loads(text_data))
            except Exception:
                return JSONResponse({"raw": text_data})
        return JSONResponse({"ok": True, "result": str(result)})
    except Exception as exc:
        return JSONResponse({"error": str(exc)}, status_code=500)


currency_tools.register(mcp)
phone_tools.register(mcp)
country_tools.register(mcp)
format_amount_tools.register(mcp)
vat_tools.register(mcp)
operators_tools.register(mcp)
tin_tools.register(mcp)
payment_tools.register(mcp)
rib_tools.register_tool(mcp)


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
