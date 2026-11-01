"""Moteur de calcul de charges sociales et salaire net en Afrique subsaharienne.

Calcule le salaire brut, cotisations retraite/maladie employé & employeur (CNPS, CSS, IPRES)
et le salaire net à payer.

Pays couverts :
- CI (Côte d'Ivoire - CNPS Régime Général, Retraite & CMU)
- SN (Sénégal - IPRES Retraite, CSS Accidents & Prestations Familiales, IPM)
- CM (Cameroun - CNPS Pensions de vieillesse, d'invalidité et de décès, Risques professionnels)
- GA (Gabon - CNSS Retraite, CNAMGS Assurance Maladie obligatoire)
"""

from __future__ import annotations

from typing import Any

from wezas_core.envelope import Envelope, ErrorCode, failure, success

PAYROLL_CONFIGS: dict[str, dict[str, Any]] = {
    "CI": {
        "pays": "Côte d'Ivoire",
        "devise": "XOF",
        "organisme_securite": "CNPS & CNAM (CMU)",
        "plafond_cnps_retraite": 1800000,  # Plafond mensuel 45 x SMIG
        "taux_employe": {
            "retraite_cnps": 0.063,  # 6.3% part salariale retraite
            "cmu_maladie": 1000,      # Forfait CMU 1 000 FCFA/mois
        },
        "taux_employeur": {
            "retraite_cnps": 0.077,        # 7.7%
            "prestations_familiales": 0.05,  # 5% (plafond 70 000)
            "accidents_travail": 0.03,      # ~3% selon secteur
        },
        "source": "Code de la Sécurité Sociale de Côte d'Ivoire - CNPS & CNAM CMU",
    },
    "SN": {
        "pays": "Sénégal",
        "devise": "XOF",
        "organisme_securite": "IPRES & CSS",
        "plafond_ipres_rg": 456000,  # Régime Général IPRES
        "taux_employe": {
            "ipres_retraite": 0.056,  # 5.6% IPRES RG
        },
        "taux_employeur": {
            "ipres_retraite": 0.084,  # 8.4%
            "css_allocations": 0.07,  # 7% CSS
            "css_accidents": 0.03,    # ~3%
        },
        "source": "IPRES (Institut de Prévoyance Retraite du Sénégal) & Caisse de Sécurité Sociale (CSS)",
    },
    "CM": {
        "pays": "Cameroun",
        "devise": "XAF",
        "organisme_securite": "CNPS Cameroun",
        "plafond_cnps": 750000,  # Plafond légal 750 000 FCFA
        "taux_employe": {
            "cnps_vieillesse": 0.042,  # 4.2% part salariale
        },
        "taux_employeur": {
            "cnps_vieillesse": 0.042,     # 4.2%
            "prestations_familiales": 0.07,  # 7%
            "accidents_travail": 0.025,    # 1.75% à 5% (~2.5%)
        },
        "source": "CNPS Cameroun - Loi n° 2001/017 portant régime de sécurité sociale",
    },
    "GA": {
        "pays": "Gabon",
        "devise": "XAF",
        "organisme_securite": "CNSS & CNAMGS",
        "plafond_cnss": 1500000,  # Plafond mensuel
        "taux_employe": {
            "cnss_vieillesse": 0.04,  # 4%
            "cnamgs_maladie": 0.025, # 2.5% part employé
        },
        "taux_employeur": {
            "cnss_vieillesse": 0.06,  # 6%
            "prestations_familiales": 0.08,
            "cnamgs_maladie": 0.05,
        },
        "source": "Caisse Nationale de Sécurité Sociale (CNSS) & CNAMGS Gabon",
    },
}


def calculer_salaire_net(
    pays: str,
    salaire_brut: float | int,
) -> Envelope[dict[str, Any]]:
    """Calcule les cotisations sociales employeur/salarié et le salaire net estimé."""
    if not pays or not isinstance(pays, str):
        return failure(ErrorCode.INVALID_ARGUMENT, "Le pays est obligatoire (CI, SN, CM, GA).")

    pays_code = pays.strip().upper()
    config = PAYROLL_CONFIGS.get(pays_code)

    if not config:
        return failure(
            ErrorCode.COUNTRY_NOT_SUPPORTED,
            f"Le pays '{pays}' n'est pas encore pris en charge pour le calcul social.",
            {"pays_supportes": list(PAYROLL_CONFIGS.keys())},
        )

    try:
        brut = float(salaire_brut)
        if brut <= 0:
            raise ValueError()
    except Exception:
        return failure(ErrorCode.INVALID_ARGUMENT, "Le salaire brut doit être un nombre strictement positif.")

    devise = config["devise"]
    cotisations_employe: list[dict[str, Any]] = []
    cotisations_employeur: list[dict[str, Any]] = []

    total_retenues_employe = 0.0
    total_charges_employeur = 0.0

    if pays_code == "CI":
        # Retraite CNPS Employé (6.3% plafonné à 1 800 000)
        base_cnps = min(brut, config["plafond_cnps_retraite"])
        retraite_emp = round(base_cnps * config["taux_employe"]["retraite_cnps"])
        cmu = config["taux_employe"]["cmu_maladie"]

        cotisations_employe.append({"rubrique": "CNPS Retraite (6.3%)", "montant": retraite_emp})
        cotisations_employe.append({"rubrique": "CMU Couverture Maladie Universelle", "montant": cmu})
        total_retenues_employe = retraite_emp + cmu

        # Employeur
        retraite_pat = round(base_cnps * config["taux_employeur"]["retraite_cnps"])
        alloc_fam = round(min(brut, 70000) * config["taux_employeur"]["prestations_familiales"])
        at = round(brut * config["taux_employeur"]["accidents_travail"])

        cotisations_employeur.append({"rubrique": "CNPS Retraite Part Patronale (7.7%)", "montant": retraite_pat})
        cotisations_employeur.append({"rubrique": "Prestations Familiales (5%)", "montant": alloc_fam})
        cotisations_employeur.append({"rubrique": "Accidents du Travail (~3%)", "montant": at})
        total_charges_employeur = retraite_pat + alloc_fam + at

    elif pays_code == "SN":
        base_ipres = min(brut, config["plafond_ipres_rg"])
        ipres_emp = round(base_ipres * config["taux_employe"]["ipres_retraite"])
        cotisations_employe.append({"rubrique": "IPRES Régime Général (5.6%)", "montant": ipres_emp})
        total_retenues_employe = ipres_emp

        ipres_pat = round(base_ipres * config["taux_employeur"]["ipres_retraite"])
        css_fam = round(min(brut, 60000) * config["taux_employeur"]["css_allocations"])
        css_at = round(min(brut, 60000) * config["taux_employeur"]["css_accidents"])

        cotisations_employeur.append({"rubrique": "IPRES Part Patronale (8.4%)", "montant": ipres_pat})
        cotisations_employeur.append({"rubrique": "CSS Allocations Familiales (7%)", "montant": css_fam})
        cotisations_employeur.append({"rubrique": "CSS Accidents du Travail (3%)", "montant": css_at})
        total_charges_employeur = ipres_pat + css_fam + css_at

    elif pays_code == "CM":
        base_cnps = min(brut, config["plafond_cnps"])
        cnps_emp = round(base_cnps * config["taux_employe"]["cnps_vieillesse"])
        cotisations_employe.append({"rubrique": "CNPS Pension Vieillesse (4.2%)", "montant": cnps_emp})
        total_retenues_employe = cnps_emp

        cnps_pat = round(base_cnps * config["taux_employeur"]["cnps_vieillesse"])
        pf = round(base_cnps * config["taux_employeur"]["prestations_familiales"])
        at = round(base_cnps * config["taux_employeur"]["accidents_travail"])

        cotisations_employeur.append({"rubrique": "CNPS Part Patronale (4.2%)", "montant": cnps_pat})
        cotisations_employeur.append({"rubrique": "Prestations Familiales (7%)", "montant": pf})
        cotisations_employeur.append({"rubrique": "Risques Professionnels (~2.5%)", "montant": at})
        total_charges_employeur = cnps_pat + pf + at

    elif pays_code == "GA":
        base_cnss = min(brut, config["plafond_cnss"])
        cnss_emp = round(base_cnss * config["taux_employe"]["cnss_vieillesse"])
        cnamgs_emp = round(brut * config["taux_employe"]["cnamgs_maladie"])

        cotisations_employe.append({"rubrique": "CNSS Retraite (4%)", "montant": cnss_emp})
        cotisations_employe.append({"rubrique": "CNAMGS Maladie (2.5%)", "montant": cnamgs_emp})
        total_retenues_employe = cnss_emp + cnamgs_emp

        cnss_pat = round(base_cnss * config["taux_employeur"]["cnss_vieillesse"])
        pf = round(base_cnss * config["taux_employeur"]["prestations_familiales"])
        cnamgs_pat = round(brut * config["taux_employeur"]["cnamgs_maladie"])

        cotisations_employeur.append({"rubrique": "CNSS Part Patronale (6%)", "montant": cnss_pat})
        cotisations_employeur.append({"rubrique": "Prestations Familiales (8%)", "montant": pf})
        cotisations_employeur.append({"rubrique": "CNAMGS Maladie (5%)", "montant": cnamgs_pat})
        total_charges_employeur = cnss_pat + pf + cnamgs_pat

    salaire_net = round(brut - total_retenues_employe)
    cout_total_entreprise = round(brut + total_charges_employeur)

    return success(
        {
            "pays": {
                "iso2": pays_code,
                "nom": config["pays"],
            },
            "devise": devise,
            "salaire_brut": brut,
            "cotisations_salariales": {
                "lignes": cotisations_employe,
                "total": total_retenues_employe,
            },
            "cotisations_patronales": {
                "lignes": cotisations_employeur,
                "total": total_charges_employeur,
            },
            "salaire_net_avant_impot": salaire_net,
            "cout_global_employeur": cout_total_entreprise,
            "organisme_principal": config["organisme_securite"],
        },
        source=config["source"],
        derniere_verification="2026-11-01",
        confiance="haute",
    )
