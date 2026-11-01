"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Coins, 
  ChevronLeft, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  Sparkles, 
  TrendingDown, 
  ShieldCheck,
  Zap,
  Scale
} from "lucide-react";
import { calculateMobileMoneyFees } from "@/utils/feeEstimator";

export default function FeeComparatorPage() {
  const [amount, setAmount] = useState<number>(25000);
  const [country, setCountry] = useState<"SN" | "CI" | "CM" | "GH" | "GA">("SN");

  const results = calculateMobileMoneyFees(amount, country);
  const bestOption = results[0];
  const currency = country === "GH" ? "GHS" : country === "CM" || country === "GA" ? "XAF" : "XOF";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/outils" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <ChevronLeft className="w-4 h-4 text-amber-400" />
            <span>Tous les micro-outils</span>
          </Link>
          <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono">
            Barèmes Officiels 2026
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-8 py-8">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <Coins className="w-4 h-4" />
            Comparateur & Optimisateur de Frais
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Comparateur de Frais Mobile Money & Taxes
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Comparez en direct les frais de transfert et taxes gouvernementales (Wave, Orange Money, MTN MoMo, Free, Moov) pour choisir l'option la plus économique.
          </p>
        </div>

        {/* Contrôles interactifs */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Pays de la transaction :</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-sm rounded-xl p-3 outline-none transition-all cursor-pointer min-h-[44px]"
              >
                <option value="SN">🇸🇳 Sénégal (Wave, Orange, Free)</option>
                <option value="CI">🇨🇮 Côte d'Ivoire (Wave, Orange, MTN, Moov)</option>
                <option value="CM">🇨🇲 Cameroun (Orange, MTN + Taxe TSTA)</option>
                <option value="GH">🇬🇭 Ghana (MTN, Telecel + E-Levy)</option>
                <option value="GA">🇬🇦 Gabon (Airtel, Moov)</option>
              </select>
            </div>

            <div className="sm:col-span-8 space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Montant à transférer ({currency}) :</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-400 text-white font-mono text-base rounded-xl p-3 outline-none transition-all min-h-[44px]"
                />
              </div>

              {/* Raccourcis de montants fréquents */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[5000, 10000, 25000, 50000, 100000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      amount === preset
                        ? "bg-amber-500 text-slate-950 font-bold border-amber-400"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    {preset.toLocaleString("fr-FR")} {currency}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommandation Gagnante */}
        {bestOption && (
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider block">
                  Meilleure Offre Détectée
                </span>
                <div className="text-base font-bold text-white">
                  {bestOption.operator} · Coût total de {bestOption.totalCost.toLocaleString("fr-FR")} {currency}
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 self-stretch sm:self-auto text-center">
              Le choix le plus économique
            </span>
          </div>
        )}

        {/* Grille de comparaison détaillée */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((res, idx) => {
            const isBest = idx === 0;
            return (
              <div
                key={res.operator}
                className={`relative bg-slate-900/70 border rounded-2xl p-5 space-y-4 transition-all flex flex-col justify-between ${
                  isBest
                    ? "border-amber-500/60 shadow-xl shadow-amber-500/5 bg-slate-900/90"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${res.color}`}></span>
                      {res.operator}
                    </span>
                    {isBest && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                        1er Choix
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-sans">Frais de transfert :</span>
                      <span className="text-slate-200">{res.transferFee.toLocaleString("fr-FR")} {currency}</span>
                    </div>

                    {res.taxAmount > 0 && (
                      <div className="flex items-center justify-between text-rose-400">
                        <span className="font-sans text-[11px] truncate max-w-[150px]">{res.taxName || "Taxe d'État"} :</span>
                        <span>+{res.taxAmount.toLocaleString("fr-FR")} {currency}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-800 text-sm font-bold">
                      <span className="font-sans text-white">Coût Total :</span>
                      <span className={isBest ? "text-emerald-400" : "text-amber-400"}>
                        {res.totalCost.toLocaleString("fr-FR")} {currency}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {res.note}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/60 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Montant net reçu :</span>
                  <span className="font-mono font-bold text-slate-300">{res.netReceived.toLocaleString("fr-FR")} {currency}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
