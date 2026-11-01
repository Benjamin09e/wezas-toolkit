"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Users, 
  ChevronLeft, 
  Calculator, 
  Coins, 
  Building2, 
  ShieldCheck, 
  Info,
  TrendingUp,
  Percent
} from "lucide-react";

export default function PayrollSimulatorPage() {
  const [country, setCountry] = useState<"CI" | "SN" | "CM" | "GA">("CI");
  const [grossSalary, setGrossSalary] = useState<number>(500000);

  const calculatePayroll = () => {
    const brut = Math.max(0, grossSalary);

    if (country === "CI") {
      // Côte d'Ivoire : CNPS Retraite 6.3% plafonné à 1 800 000 + CMU 1 000
      const baseRetraite = Math.min(brut, 1800000);
      const cnpsEmp = Math.round(baseRetraite * 0.063);
      const cmu = 1000;
      const totalEmp = cnpsEmp + cmu;

      const cnpsPat = Math.round(baseRetraite * 0.077);
      const allocFam = Math.round(Math.min(brut, 70000) * 0.05);
      const at = Math.round(brut * 0.03);
      const totalPat = cnpsPat + allocFam + at;

      return {
        devise: "FCFA",
        organisme: "CNPS & CMU (Côte d'Ivoire)",
        salariales: [
          { nom: "CNPS Caisse de Retraite (6.3%)", montant: cnpsEmp },
          { nom: "CMU Couverture Maladie Universelle", montant: cmu },
        ],
        totalSalariales: totalEmp,
        netAvantImpot: brut - totalEmp,
        patronales: [
          { nom: "CNPS Retraite Part Patronale (7.7%)", montant: cnpsPat },
          { nom: "Prestations Familiales (5%)", montant: allocFam },
          { nom: "Accidents du Travail (~3%)", montant: at },
        ],
        totalPatronales: totalPat,
        coutGlobal: brut + totalPat,
      };
    }

    if (country === "SN") {
      // Sénégal : IPRES 5.6% plafonné à 456 000
      const baseIpres = Math.min(brut, 456000);
      const ipresEmp = Math.round(baseIpres * 0.056);

      const ipresPat = Math.round(baseIpres * 0.084);
      const cssFam = Math.round(Math.min(brut, 60000) * 0.07);
      const cssAt = Math.round(Math.min(brut, 60000) * 0.03);
      const totalPat = ipresPat + cssFam + cssAt;

      return {
        devise: "FCFA",
        organisme: "IPRES & CSS (Sénégal)",
        salariales: [
          { nom: "IPRES Retraite Régime Général (5.6%)", montant: ipresEmp },
        ],
        totalSalariales: ipresEmp,
        netAvantImpot: brut - ipresEmp,
        patronales: [
          { nom: "IPRES Retraite Part Employeur (8.4%)", montant: ipresPat },
          { nom: "CSS Prestations Familiales (7%)", montant: cssFam },
          { nom: "CSS Accidents du Travail (~3%)", montant: cssAt },
        ],
        totalPatronales: totalPat,
        coutGlobal: brut + totalPat,
      };
    }

    if (country === "CM") {
      // Cameroun : CNPS 4.2% plafonné à 750 000
      const baseCnps = Math.min(brut, 750000);
      const cnpsEmp = Math.round(baseCnps * 0.042);

      const cnpsPat = Math.round(baseCnps * 0.042);
      const pf = Math.round(baseCnps * 0.07);
      const at = Math.round(baseCnps * 0.025);
      const totalPat = cnpsPat + pf + at;

      return {
        devise: "FCFA",
        organisme: "CNPS (Cameroun)",
        salariales: [
          { nom: "CNPS Pension de Vieillesse (4.2%)", montant: cnpsEmp },
        ],
        totalSalariales: cnpsEmp,
        netAvantImpot: brut - cnpsEmp,
        patronales: [
          { nom: "CNPS Part Patronale (4.2%)", montant: cnpsPat },
          { nom: "Prestations Familiales (7%)", montant: pf },
          { nom: "Risques Professionnels (~2.5%)", montant: at },
        ],
        totalPatronales: totalPat,
        coutGlobal: brut + totalPat,
      };
    }

    // Gabon (GA) : CNSS 4% + CNAMGS 2.5%
    const baseCnss = Math.min(brut, 1500000);
    const cnssEmp = Math.round(baseCnss * 0.04);
    const cnamgsEmp = Math.round(brut * 0.025);
    const totalEmp = cnssEmp + cnamgsEmp;

    const cnssPat = Math.round(baseCnss * 0.06);
    const pf = Math.round(baseCnss * 0.08);
    const cnamgsPat = Math.round(brut * 0.05);
    const totalPat = cnssPat + pf + cnamgsPat;

    return {
      devise: "FCFA",
      organisme: "CNSS & CNAMGS (Gabon)",
      salariales: [
        { nom: "CNSS Retraite (4%)", montant: cnssEmp },
        { nom: "CNAMGS Maladie (2.5%)", montant: cnamgsEmp },
      ],
      totalSalariales: totalEmp,
      netAvantImpot: brut - totalEmp,
      patronales: [
        { nom: "CNSS Retraite Employeur (6%)", montant: cnssPat },
        { nom: "Prestations Familiales (8%)", montant: pf },
        { nom: "CNAMGS Maladie Employeur (5%)", montant: cnamgsPat },
      ],
      totalPatronales: totalPat,
      coutGlobal: brut + totalPat,
    };
  };

  const data = calculatePayroll();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/outils" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <ChevronLeft className="w-4 h-4 text-amber-400" />
            <span>Tous les micro-outils</span>
          </Link>
          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono">
            Barèmes Sociaux 2026
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-8 py-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <Users className="w-4 h-4" />
            Ressources Humaines & Salaires
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Simulateur de Charges Sociales & Salaire Net Africain
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Estimez instantanément les cotisations retraite/maladie (CNPS, IPRES, CSS, CNSS) et découvrez le coût employeur global ainsi que le net à payer.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Pays d'imposition salariale :</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl p-3 outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="CI">🇨🇮 Côte d'Ivoire (CNPS + CMU)</option>
                <option value="SN">🇸🇳 Sénégal (IPRES + CSS)</option>
                <option value="CM">🇨🇲 Cameroun (CNPS)</option>
                <option value="GA">🇬🇦 Gabon (CNSS + CNAMGS)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Salaire Brut Mensuel (FCFA) :</label>
              <input
                type="number"
                min="10000"
                step="25000"
                value={grossSalary}
                onChange={(e) => setGrossSalary(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-white font-mono text-base rounded-xl p-3 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Grille des résultats synthétiques */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-center font-mono">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-sans block">Salaire Brut</span>
              <div className="text-lg font-bold text-white mt-0.5">
                {grossSalary.toLocaleString("fr-FR")} {data.devise}
              </div>
            </div>

            <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30">
              <span className="text-[10px] text-emerald-400 font-sans block font-semibold">Net Estimé (Avant Impôt)</span>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                {data.netAvantImpot.toLocaleString("fr-FR")} {data.devise}
              </div>
            </div>

            <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/30">
              <span className="text-[10px] text-amber-400 font-sans block font-semibold">Coût Global Entreprise</span>
              <div className="text-lg font-bold text-amber-400 mt-0.5">
                {data.coutGlobal.toLocaleString("fr-FR")} {data.devise}
              </div>
            </div>
          </div>

          {/* Décomposition détaillée */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Retenues Salarié */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-rose-400 border-b border-slate-800 pb-2">
                <span>Retenues Salarié</span>
                <span className="font-mono">-{data.totalSalariales.toLocaleString("fr-FR")} {data.devise}</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                {data.salariales.map((s, idx) => (
                  <div key={idx} className="flex justify-between text-slate-400 text-[11px]">
                    <span>{s.nom}</span>
                    <span className="font-mono text-slate-200">{s.montant.toLocaleString("fr-FR")} {data.devise}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Charges Employeur */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-amber-400 border-b border-slate-800 pb-2">
                <span>Charges Patronales</span>
                <span className="font-mono">+{data.totalPatronales.toLocaleString("fr-FR")} {data.devise}</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300">
                {data.patronales.map((p, idx) => (
                  <div key={idx} className="flex justify-between text-slate-400 text-[11px]">
                    <span>{p.nom}</span>
                    <span className="font-mono text-slate-200">{p.montant.toLocaleString("fr-FR")} {data.devise}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
