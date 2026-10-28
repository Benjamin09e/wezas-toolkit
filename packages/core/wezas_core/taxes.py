"""Calculateur de taxes transactionnelles, retenues à la source (WHT/BRS) et taxes numériques africaines."""

from __future__ import annotations

from decimal import ROUND_HALF_UP, Decimal, InvalidOperation
from typing import Any

from wezas_core.envelope import Envelope, ErrorCode, Warning_, failure, success
from wezas_core.models import LocalizedName
from wezas_core.normalize import country_not_found, resolve_country

# Référentiel des régimes fiscaux spécifiques transactionnels et retenues
TAX_REGIMES: dict[str, dict[str, Any]] = {
    "GH": {
        "e_levy": {
            "nom": "Electronic Transfer Levy (E-Levy)",
            "taux_pourcentage": Decimal("1.0"),
            "seuil_exoneration_journalier": Decimal("100.0"),  # Exonération sur les premiers 100 GHS/jour
            "devise": "GHS",
            "source": "Ghana Revenue Authority (GRA) - Electronic Transfer Levy Act, 2022 (Act 1075)",
            "description": "Taxe de 1 % sur les transferts électroniques et Mobile Money au Ghana au-delà de 100 GHS.",
        },
        "wht_services": {
            "nom": "Withholding Tax on Services (Ghana)",
            "taux_pourcentage": Decimal("7.5"),
            "source": "GRA - Income Tax Act, 2015 (Act 896)",
            "description": "Retenue à la source de 7,5 % sur les prestations de services locales fournies par des résidents.",
        },
    },
    "CM": {
        "taxe_transfert_argent": {
            "nom": "Taxe spéciale sur les transferts d'argent (TSTA)",
            "taux_pourcentage": Decimal("0.2"),
            "seuil_exoneration_journalier": Decimal("0.0"),
            "devise": "XAF",
            "source": "Direction Générale des Impôts (DGI) Cameroun - Loi de Finances 2022 art. 228 bis CGI",
            "description": "Taxe de 0,2 % sur les opérations d'envoi et de retrait d'argent par Mobile Money ou tout moyen électronique.",
        },
        "tsr": {
            "nom": "Taxe Spéciale sur le Revenu (TSR - Retenue à la source)",
            "taux_pourcentage": Decimal("15.0"),
            "source": "Code Général des Impôts du Cameroun - art. 225 CGI",
            "description": "Retenue à la source de 15 % sur les rémunérations de prestations de services versées à l'étranger.",
        },
    },
    "CI": {
        "brs_services": {
            "nom": "Retenue à la Source BRS (Bénéfices Non Commerciaux / Prestations)",
            "taux_pourcentage": Decimal("7.5"),
            "devise": "XOF",
            "source": "Direction Générale des Impôts (DGI) Côte d'Ivoire - CGI art. 93",
            "description": "Retenue à la source de 7,5 % sur les rémunérations versées à des prestataires de services résidents.",
        },
        "retrib_etranger": {
            "nom": "Retenue à la source sur prestations de services étrangères",
            "taux_pourcentage": Decimal("20.0"),
            "devise": "XOF",
            "source": "DGI Côte d'Ivoire - CGI art. 94",
            "description": "Retenue de 20 % sur les prestations immatérielles fournies par des non-résidents.",
        },
    },
    "SN": {
        "brs_services": {
            "nom": "Retenue à la source BRS sur prestations de services (Sénégal)",
            "taux_pourcentage": Decimal("5.0"),
            "devise": "XOF",
            "source": "Direction Générale des Impôts et des Domaines (DGID) Sénégal - CGI art. 200",
            "description": "Retenue de 5 % sur les prestations de services rendues par des personnes physiques ou morales résidentes.",
        },
        "brs_non_residents": {
            "nom": "Retenue BRS sur prestataires non-résidents (Sénégal)",
            "taux_pourcentage": Decimal("20.0"),
            "devise": "XOF",
            "source": "DGID Sénégal - CGI art. 201",
            "description": "Retenue de 20 % sur les prestations versées à des entreprises non établies au Sénégal.",
        },
    },
    "KE": {
        "dst": {
            "nom": "Digital Service Tax (DST)",
            "taux_pourcentage": Decimal("1.5"),
            "devise": "KES",
            "source": "Kenya Revenue Authority (KRA) - Finance Act section 12D",
            "description": "Taxe de 1,5 % sur la valeur brute des transactions de services numériques et marketplaces.",
        },
        "wht_services": {
            "nom": "Withholding Tax on Professional & Management Fees",
            "taux_pourcentage": Decimal("5.0"),
            "devise": "KES",
            "source": "KRA - Income Tax Act Cap 470 section 35",
            "description": "Retenue de 5 % sur les honoraires professionnels et techniques locaux.",
        },
    },
    "NG": {
        "wht_services": {
            "nom": "Withholding Tax on Professional Services & Contracts (Nigeria)",
            "taux_pourcentage": Decimal("5.0"),
            "devise": "NGN",
            "source": "Federal Inland Revenue Service (FIRS) - WHT Regulations 2024",
            "description": "Retenue à la source de 5 % sur les contrats de prestation de services professionnels.",
        },
        "emtl": {
            "nom": "Electronic Money Transfer Levy (EMTL)",
            "montant_fixe": Decimal("50.0"),  # 50 NGN forfaitaire au-delà de 10,000 NGN
            "seuil_declenchement": Decimal("10000.0"),
            "devise": "NGN",
            "source": "Central Bank of Nigeria (CBN) / FIRS - Finance Act 2020",
            "description": "Prélèvement forfaitaire de 50 NGN sur les transferts bancaires électroniques de 10 000 NGN ou plus.",
        },
    },
}


def calculate_transaction_tax(
    pays: str,
    montant: float | str,
    type_taxe: str | None = None,
    cumul_journalier_precedent: float | str = 0,
) -> Envelope:
    """
    Calcule les taxes transactionnelles (E-Levy, taxe transferts Mobile Money, EMTL)
    ou les retenues à la source (WHT / BRS / TSR / DST).
    """
    country_obj = resolve_country(pays)
    if not country_obj:
        return country_not_found(pays)

    iso2 = country_obj.iso2.upper()
    country_taxes = TAX_REGIMES.get(iso2)

    if not country_taxes:
        return failure(
            ErrorCode.DONNEES_INDISPONIBLES,
            f"Les régimes de taxes transactionnelles pour {country_obj.name.fr} ({iso2}) ne sont pas encore tabulés.",
            f"Transaction tax regimes for {country_obj.name.en} ({iso2}) are not tabulated yet.",
            suggestions=list(TAX_REGIMES.keys()),
        )

    # Validation du montant
    try:
        dec_amount = Decimal(str(montant).replace(",", "."))
        if dec_amount <= 0:
            return failure(
                ErrorCode.MONTANT_INVALIDE,
                "Le montant doit être un nombre strictement supérieur à zéro.",
                "Amount must be a strictly positive number.",
            )
    except (InvalidOperation, ValueError):
        return failure(
            ErrorCode.MONTANT_INVALIDE,
            f"Montant invalide : {montant}.",
            f"Invalid amount: {montant}.",
        )

    # Choix du type de taxe : si non spécifié, prendre la taxe transactionnelle par défaut du pays
    selected_tax_key = type_taxe.strip().lower() if type_taxe else list(country_taxes.keys())[0]
    tax_cfg = country_taxes.get(selected_tax_key)

    if not tax_cfg:
        return failure(
            ErrorCode.ENTREE_INVALIDE,
            f"Type de taxe '{type_taxe}' non reconnu pour {country_obj.name.fr}. Disponibles : {', '.join(country_taxes.keys())}.",
            f"Tax type '{type_taxe}' not recognized for {country_obj.name.en}. Available: {', '.join(country_taxes.keys())}.",
            suggestions=list(country_taxes.keys()),
        )

    # Calcul de la taxe
    tax_amount = Decimal("0.0")
    taxable_base = dec_amount
    warnings: list[Warning_] = []

    # Cas E-Levy Ghana avec exonération 100 GHS
    if selected_tax_key == "e_levy":
        try:
            prev_daily = Decimal(str(cumul_journalier_precedent).replace(",", "."))
        except (InvalidOperation, ValueError):
            prev_daily = Decimal("0.0")

        seuil = tax_cfg.get("seuil_exoneration_journalier", Decimal("100.0"))
        # Si le cumul précédent dépasse le seuil, tout est taxable
        if prev_daily >= seuil:
            taxable_base = dec_amount
        else:
            franchise_restante = max(Decimal("0.0"), seuil - prev_daily)
            taxable_base = max(Decimal("0.0"), dec_amount - franchise_restante)
            if franchise_restante > 0:
                warnings.append(
                    Warning_(
                        code="EXONERATION_PARTIELLE_E_LEVY",
                        message=LocalizedName(
                            fr=f"Franchise journalière appliquée : {franchise_restante} GHS exonérés sur cette transaction.",
                            en=f"Daily threshold applied: {franchise_restante} GHS exempted on this transaction.",
                        ),
                    )
                )

        rate = tax_cfg["taux_pourcentage"] / Decimal("100.0")
        tax_amount = (taxable_base * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    # Cas Forfait EMTL Nigeria (50 NGN au-delà de 10 000 NGN)
    elif "montant_fixe" in tax_cfg:
        seuil = tax_cfg.get("seuil_declenchement", Decimal("0.0"))
        if dec_amount >= seuil:
            tax_amount = tax_cfg["montant_fixe"]
        else:
            tax_amount = Decimal("0.0")
            warnings.append(
                Warning_(
                    code="SEUIL_NON_ATTEINT",
                    message=LocalizedName(
                        fr=f"Montant inférieur au seuil d'assujettissement EMTL de {seuil} NGN.",
                        en=f"Amount below the EMTL trigger threshold of {seuil} NGN.",
                    ),
                )
            )

    # Cas général pourcentage (WHT, BRS, TSTA, DST, TSR)
    elif "taux_pourcentage" in tax_cfg:
        rate = tax_cfg["taux_pourcentage"] / Decimal("100.0")
        tax_amount = (dec_amount * rate).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    # Montant net ou total
    # Si c'est une retenue à la source (WHT/BRS), le net versé au prestataire est montant - taxe
    is_withholding = "wht" in selected_tax_key or "brs" in selected_tax_key or "tsr" in selected_tax_key
    montant_net_ou_total = (dec_amount - tax_amount) if is_withholding else (dec_amount + tax_amount)

    data = {
        "pays": {
            "iso2": iso2,
            "nom": country_obj.name.fr,
        },
        "taxe": {
            "code": selected_tax_key,
            "nom": tax_cfg["nom"],
            "description": tax_cfg.get("description", ""),
            "type_prelevement": "retenue_a_la_source" if is_withholding else "taxe_transactionnelle",
            "taux_pourcentage": float(tax_cfg["taux_pourcentage"]) if "taux_pourcentage" in tax_cfg else None,
            "forfait_fixe": float(tax_cfg["montant_fixe"]) if "montant_fixe" in tax_cfg else None,
            "devise": tax_cfg.get("devise", country_obj.currency),
        },
        "calcul": {
            "montant_brut": float(dec_amount),
            "base_imposable": float(taxable_base),
            "montant_taxe": float(tax_amount),
            "montant_apres_taxe": float(montant_net_ou_total),
            "libelle_resultat": "Montant net à verser (après retenue)" if is_withholding else "Total débité (montant + taxe)",
        },
        "disponibles_dans_le_pays": list(country_taxes.keys()),
    }

    return success(
        data=data,
        source=tax_cfg.get("source", "Législation fiscale nationale"),
        confiance="haute",
        avertissements=warnings,
    )
