from typing import Any
from fastmcp import FastMCP
from wezas_core.tin import validate_tax_id


def register(mcp: FastMCP) -> None:
    @mcp.tool(
        name="valider_identifiant_fiscal",
        description=(
            "Valide et normalise un numéro d'identifiant fiscal en Afrique "
            "(NCC, NINEA, NIU, NIF, KRA PIN, TIN). / "
            "Validate and normalize an African corporate tax ID."
        ),
    )
    def valider_identifiant_fiscal_tool(
        pays: str,
        identifiant: str,
    ) -> dict[str, Any]:
        return validate_tax_id(pays=pays, identifiant=identifiant).model_dump(mode="json")
