"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Phone, Coins, Calendar, Receipt, ShieldCheck, ArrowRight } from "lucide-react";

interface ResultCardProps {
  toolId: string;
  response: any;
}

export function VisualResultCard({ toolId, response }: ResultCardProps) {
  if (!response) return null;

  if (!response.ok) {
    return (
      <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 shrink-0" />
        <div>
          <div className="text-sm font-semibold text-rose-300">
            {response.error?.code || "Erreur lors du traitement"}
          </div>
          <p className="text-xs text-rose-200/80 mt-1">
            {response.error?.message?.fr || response.error || "Une erreur est survenue."}
          </p>
        </div>
      </div>
    );
  }

  const data = response.data;

  // 1. Carte Téléphone
  if (toolId === "valider_telephone") {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Numéro National & International
            </span>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-medium">
            Format valide
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <div className="text-[11px] text-slate-500">Format international E.164</div>
            <div className="text-sm font-mono font-semibold text-white">{data.e164}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Format national</div>
            <div className="text-sm font-mono font-medium text-slate-300">{data.format_national}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Opérateur réseau</div>
            <div className="text-sm font-medium text-amber-400">{data.operateur_probable}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Services Mobile Money</div>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {data.mobile_money && data.mobile_money.length > 0 ? (
                data.mobile_money.map((mm: string) => (
                  <span
                    key={mm}
                    className="text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded"
                  >
                    {mm}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Aucun détecté</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Carte Conversion de devises
  if (toolId === "convertir_devise") {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Conversion Instantanée
            </span>
          </div>
          {data.parite_fixe && (
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">
              Parité fixe officielle
            </span>
          )}
        </div>

        <div className="flex items-center justify-around py-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
          <div className="text-center">
            <div className="text-xs text-slate-500">{data.de}</div>
            <div className="text-lg font-bold text-white font-mono">{data.montant}</div>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-500" />
          <div className="text-center">
            <div className="text-xs text-slate-500">{data.vers}</div>
            <div className="text-xl font-bold text-emerald-400 font-mono">{data.resultat}</div>
          </div>
        </div>

        <div className="text-right text-[11px] text-slate-500">
          Taux appliqué : 1 {data.de} = {data.taux} {data.vers}
        </div>
      </div>
    );
  }

  // 3. Carte Formatage Monétaire
  if (toolId === "formater_montant") {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center space-y-2">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
          Montant Formaté Localement
        </div>
        <div className="text-2xl font-bold text-amber-400 font-mono tracking-tight py-2">
          {data.montant_formate}
        </div>
        <div className="text-xs text-slate-500">
          Devise : <span className="text-slate-300 font-medium">{data.devise}</span> · Symbole :{" "}
          <span className="text-slate-300 font-medium">{data.symbole}</span>
        </div>
      </div>
    );
  }

  // 4. Carte TVA
  if (toolId === "calculer_tva") {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Décompte Fiscal ({data.pays})
            </span>
          </div>
          <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
            {data.nom_taxe} ({data.taux_pourcentage})
          </span>
        </div>

        <div className="space-y-2 font-mono text-sm pt-1">
          <div className="flex justify-between text-slate-400">
            <span>Montant HT</span>
            <span className="text-slate-200">{data.montant_ht} {data.devise}</span>
          </div>
          <div className="flex justify-between text-amber-400 font-medium">
            <span>Taxe légale</span>
            <span>+ {data.montant_taxe} {data.devise}</span>
          </div>
          <div className="flex justify-between text-white font-bold text-base border-t border-slate-800 pt-2">
            <span>Total TTC</span>
            <span className="text-emerald-400">{data.montant_ttc} {data.devise}</span>
          </div>
        </div>
      </div>
    );
  }

  // 5. Carte Informations Pays
  if (toolId === "info_pays") {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="text-sm font-semibold text-white">
            {data.pays?.nom} ({data.pays?.iso2})
          </div>
          <span className="text-xs text-slate-400">Capitale : {data.pays?.capitale}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>Indicatif : <span className="font-mono text-amber-400">{data.indicatif}</span></div>
          <div>Devise : <span className="text-slate-200">{data.devise?.nom}</span></div>
          <div className="col-span-2 text-slate-400 pt-1">
            Jours fériés légaux ({data.annee_feries}) : <span className="text-white font-semibold">{data.jours_feries?.length || 0} jours</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
