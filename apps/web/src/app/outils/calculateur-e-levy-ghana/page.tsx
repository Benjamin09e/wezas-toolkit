"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calculator, ShieldCheck, ChevronLeft, ArrowRight, Receipt, Info } from "lucide-react";

export default function ELevyCalculatorPage() {
  const [montant, setMontant] = useState<number>(250);
  const [cumulPrecedent, setCumulPrecedent] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("https://wezas-backend.onrender.com/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "calculer_taxe_transaction",
          arguments: {
            pays: "GH",
            montant: Number(montant),
            cumul_journalier_precedent: Number(cumulPrecedent),
          },
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      // Fallback calcul E-Levy officiel GRA Ghana (1% après franchise journalière de 100 GHS)
      const franchiseRestante = Math.max(0, 100 - cumulPrecedent);
      const baseTaxable = Math.max(0, montant - franchiseRestante);
      const tax = Number((baseTaxable * 0.01).toFixed(2));
      setResult({
        ok: true,
        data: {
          pays: { iso2: "GH", nom: "Ghana" },
          taxe: { code: "E_LEVY", nom: "Electronic Transfer Levy (E-Levy)", taux_pourcentage: 1, devise: "GHS" },
          calcul: {
            montant_brut: montant,
            base_imposable: baseTaxable,
            montant_taxe: tax,
            montant_apres_taxe: montant + tax,
            libelle_resultat: `Taxe de 1% appliquée sur ${baseTaxable} GHS après déduction de la franchise journalière.`,
          },
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/outils" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <ChevronLeft className="w-4 h-4 text-amber-400" />
            <span>Tous les micro-outils</span>
          </Link>
          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono">
            GRA / BoG Act 1075 (Ghana)
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-8 py-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            Simulateur Fiscal Officiel
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Calculateur E-Levy Ghana (Mobile Money & Virements)
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Simulez avec exactitude le prélèvement fiscal de l'E-Levy ghanéen pour vos transferts d'argent, règlements marchands et transactions bancaires.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <form onSubmit={handleCalculate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Montant du transfert (GHS)</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={montant}
                  onChange={(e) => setMontant(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white font-mono text-base rounded-xl p-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Cumul déjà transféré aujourd'hui (GHS)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={cumulPrecedent}
                  onChange={(e) => setCumulPrecedent(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white font-mono text-base rounded-xl p-3 outline-none transition-all"
                />
                <span className="text-[10px] text-slate-500 block">Franchise légale : 100 GHS / jour d'exonération</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Calcul en cours..." : "Calculer l'E-Levy"}
            </button>
          </form>

          {result && result.data && (
            <div className="pt-4 border-t border-slate-800 space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-sans">Montant Brut</div>
                  <div className="text-base font-bold text-white">{result.data.calcul.montant_brut} GHS</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 font-sans">Base Taxable</div>
                  <div className="text-base font-bold text-slate-300">{result.data.calcul.base_imposable} GHS</div>
                </div>
                <div className="bg-rose-500/10 p-3 rounded-xl border border-rose-500/30">
                  <div className="text-[10px] text-rose-400 font-sans">E-Levy (1%)</div>
                  <div className="text-base font-bold text-rose-400">{result.data.calcul.montant_taxe} GHS</div>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30">
                  <div className="text-[10px] text-emerald-400 font-sans">Total Débité</div>
                  <div className="text-base font-bold text-emerald-400">{result.data.calcul.montant_apres_taxe} GHS</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{result.data.calcul.libelle_resultat}</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
