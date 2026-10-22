"""Exécuteur direct d'outils Wezas Toolkit en JSON pour l'API / le Playground."""

import json
import sys

from wezas_core.country import get_country_info
from wezas_core.currency import convert
from wezas_core.format_amount import format_amount
from wezas_core.operators import list_operators
from wezas_core.payment import generate_payment_link
from wezas_core.phone import validate_phone
from wezas_core.tin import validate_tax_id
from wezas_core.vat import calculate_vat
from wezas_core.rib import validate_rib


def execute_tool(tool_name: str, args: dict):
    if tool_name == "valider_telephone":
        return validate_phone(args.get("pays", ""), args.get("numero", "")).model_dump(mode="json")
    elif tool_name == "convertir_devise":
        return convert(
            amount=args.get("montant", 0),
            de=args.get("de", "EUR"),
            vers=args.get("vers", "XAF"),
            taux=args.get("taux"),
        ).model_dump(mode="json")
    elif tool_name == "info_pays":
        return get_country_info(
            pays=args.get("pays", ""),
            annee=args.get("annee"),
        ).model_dump(mode="json")
    elif tool_name == "formater_montant":
        return format_amount(
            amount=args.get("montant", 0),
            devise=args.get("devise"),
            pays=args.get("pays"),
            inclure_symbole=args.get("inclure_symbole", True),
            decimales=args.get("decimales"),
        ).model_dump(mode="json")
    elif tool_name == "calculer_tva":
        return calculate_vat(
            montant=args.get("montant", 0),
            pays=args.get("pays", ""),
            type_taux=args.get("type_taux", "standard"),
            mode=args.get("mode", "ht"),
            taux_personnalise=args.get("taux_personnalise"),
        ).model_dump(mode="json")
    elif tool_name == "lister_operateurs":
        return list_operators(
            pays=args.get("pays"),
            avec_mobile_money_seulement=args.get("avec_mobile_money_seulement", False),
        ).model_dump(mode="json")
    elif tool_name == "valider_identifiant_fiscal":
        return validate_tax_id(
            pays=args.get("pays", ""),
            identifiant=args.get("identifiant", ""),
        ).model_dump(mode="json")
    elif tool_name == "generer_paiement_mobile_money":
        return generate_payment_link(
            operateur=args.get("operateur", "Wave"),
            telephone=args.get("telephone", ""),
            montant=args.get("montant", 0),
            pays=args.get("pays", ""),
            reference=args.get("reference"),
        ).model_dump(mode="json")
    elif tool_name == "valider_rib":
        return validate_rib(
            code_banque=args.get("code_banque", ""),
            code_guichet=args.get("code_guichet", ""),
            numero_compte=args.get("numero_compte", ""),
            cle_rib=args.get("cle_rib", ""),
        ).model_dump(mode="json")
    else:
        raise ValueError(f"Outil inconnu : {tool_name}")


if __name__ == "__main__":
    tool = sys.argv[1]
    raw_args = sys.argv[2] if len(sys.argv) > 2 else "{}"
    params = json.loads(raw_args)
    res = execute_tool(tool, params)
    print(json.dumps(res, ensure_ascii=False))
