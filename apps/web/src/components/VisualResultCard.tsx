"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Coins, 
  Receipt, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface ResultCardProps {
  toolId: string;
  response: any;
}

export function VisualResultCard({ toolId, response }: ResultCardProps) {
  const [showHolidays, setShowHolidays] = useState(false);

  if (!response) return null;

  if (!response.ok) {
    return (
      <div className="bg-rose-950/30 border border-rose-800/60 rounded-2xl p-5 flex items-start gap-3.5 shadow-xl shadow-rose-950/20 animate-in fade-in duration-300">
        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-rose-200">
            {response.error?.code || "Erreur de validation"}
          </div>
          <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">
            {response.error?.message?.fr || response.error || "Impossible de traiter la requête."}
          </p>
          {response.error?.suggestions && response.error.suggestions.length > 0 && (
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Suggestions :</span>
              {response.error.suggestions.map((sug: string) => (
                <span
                  key={sug}
                  className="text-[10px] font-mono bg-slate-800 border border-slate-700 text-amber-300 px-2 py-0.5 rounded"
                >
                  {sug}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const data = response.data;

  // 1. CARTE TÉLÉPHONE (Badge opérateur, E.164, Mobile Money)
  if (toolId === "valider_telephone") {
    const isMobile = data.type === "mobile";
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Numéro Valide ({data.pays?.nom})</div>
              <div className="text-[11px] text-slate-400">Format conforme aux normes ARCEP / UIT</div>
            </div>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-medium flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {isMobile ? "Ligne Mobile GSM" : "Ligne Fixe"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Bloc International E.164 */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="text-[11px] text-slate-400 font-medium">Format Standard International</div>
            <div className="text-lg font-mono font-bold text-amber-400 tracking-wide mt-1">
              {data.e164}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Usage SMS, WhatsApp, passerelles API</div>
          </div>

          {/* Bloc National */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
            <div className="text-[11px] text-slate-400 font-medium">Format National Local</div>
            <div className="text-lg font-mono font-semibold text-slate-200 tracking-wide mt-1">
              {data.format_national}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Saisie utilisateur et affichage client</div>
          </div>
        </div>

        {/* Bloc Opérateur et Mobile Money */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Opérateur Détecté</div>
              <div className="text-sm font-semibold text-white">{data.operateur_probable}</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 md:text-right mb-1">Services Mobile Money</div>
            <div className="flex flex-wrap gap-1.5 md:justify-end">
              {data.mobile_money && data.mobile_money.length > 0 ? (
                data.mobile_money.map((mm: string) => (
                  <span
                    key={mm}
                    className="text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {mm}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Aucun portefeuille associé</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. CARTE CONVERSION DE DEVISES
  if (toolId === "convertir_devise") {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Conversion Monétaire</div>
              <div className="text-[11px] text-slate-400">Calcul garanti sans dérive de virgule flottante</div>
            </div>
          </div>
          {data.parite_fixe ? (
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full font-medium">
              Parité fixe officielle (Zone Franc)
            </span>
          ) : (
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-medium">
              Taux flottant
            </span>
          )}
        </div>

        <div className="flex items-center justify-around p-4 bg-slate-950/80 rounded-xl border border-slate-800">
          <div className="text-center">
            <div className="text-xs font-semibold text-slate-400 mb-1">{data.de}</div>
            <div className="text-xl font-bold font-mono text-slate-200">{data.montant}</div>
          </div>
          <div className="p-2.5 rounded-full bg-slate-800/80 text-amber-400 border border-slate-700">
            <ArrowRight className="w-5 h-5" />
          </div>
          <div className="text-center">
            <div className="text-xs font-semibold text-slate-400 mb-1">{data.vers}</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">{data.resultat}</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>Taux officiel : 1 {data.de} = <strong className="text-white font-mono">{data.taux}</strong> {data.vers}</span>
          <span className="text-[11px] text-slate-500">100% hors ligne</span>
        </div>
      </div>
    );
  }

  // 3. CARTE FORMATAGE MONÉTAIRE
  if (toolId === "formater_montant") {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl p-5 text-center space-y-3 shadow-xl">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
          Formatage Monétaire Local Recommandé
        </div>
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
          <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
            {data.montant_formate}
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 text-xs text-slate-400 pt-1">
          <div>Devise : <span className="text-white font-medium">{data.devise}</span></div>
          <div>Symbole : <span className="text-white font-medium">{data.symbole}</span></div>
          <div>Décimales : <span className="text-white font-medium">{data.decimales}</span></div>
        </div>
      </div>
    );
  }

  // 4. CARTE TVA (Ticket de caisse fiscal)
  if (toolId === "calculer_tva") {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Décompte Fiscal ({data.pays})</div>
              <div className="text-[11px] text-slate-400">Barème officiel de la Direction Générale des Impôts</div>
            </div>
          </div>
          <span className="text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-semibold">
            {data.nom_taxe} : {data.taux_pourcentage}
          </span>
        </div>

        {/* Facturette stylisée */}
        <div className="bg-slate-950/90 border border-dashed border-slate-800 rounded-xl p-4 font-mono text-sm space-y-2.5">
          <div className="flex justify-between items-center text-slate-400">
            <span>Montant Hors Taxe (HT)</span>
            <span className="text-slate-100 font-semibold">{data.montant_ht} {data.devise}</span>
          </div>
          <div className="flex justify-between items-center text-amber-400/90 font-medium">
            <span>Taxe légale ({data.taux_pourcentage})</span>
            <span>+ {data.montant_taxe} {data.devise}</span>
          </div>
          <div className="flex justify-between items-center text-base font-bold text-white border-t border-slate-800 pt-2.5">
            <span>Total Toutes Taxes Comprises (TTC)</span>
            <span className="text-emerald-400 text-lg">{data.montant_ttc} {data.devise}</span>
          </div>
        </div>
      </div>
    );
  }

  // 5. CARTE INFORMATIONS PAYS (Jours fériés, fuseaux, langues)
  if (toolId === "info_pays") {
    const holidays = data.jours_feries || [];
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <span>{data.pays?.nom}</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                {data.pays?.iso2}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Capitale : {data.pays?.capitale}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-amber-400 font-bold">{data.indicatif}</div>
            <div className="text-[11px] text-slate-500">Indicatif télécom</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Monnaie</span>
            <span className="font-semibold text-slate-200">{data.devise?.nom} ({data.devise?.code})</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-500 block mb-1">Langues officielles</span>
            <span className="font-semibold text-slate-200">{data.langues?.join(", ").toUpperCase()}</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 col-span-2 md:col-span-1">
            <span className="text-slate-500 block mb-1">Jours chômés ({data.annee_feries})</span>
            <span className="font-bold text-emerald-400">{holidays.length} jours fériés</span>
          </div>
        </div>

        {/* Accordéon Jours Fériés */}
        {holidays.length > 0 && (
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <button
              onClick={() => setShowHolidays(!showHolidays)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Voir le calendrier des {holidays.length} jours fériés ({data.annee_feries})</span>
              </div>
              {showHolidays ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showHolidays && (
              <div className="p-3 border-t border-slate-800 max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-800/40">
                {holidays.map((h: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between pt-1.5 text-xs">
                    <span className="font-mono text-amber-400">{h.date}</span>
                    <span className="text-slate-200 font-medium">{h.nom?.fr || h.nom}</span>
                    <span className="text-[10px] text-slate-500 capitalize">{h.type || "Légal"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // 6. CARTE CATALOGUE DES OPÉRATEURS
  if (toolId === "lister_operateurs") {
    const ops = data.operateurs || [];
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-white">
              {data.pays ? `Opérateurs en ${data.pays.nom}` : "Catalogue des Opérateurs"}
            </span>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">
            {data.total} réseaux répertoriés
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
          {ops.map((op: any) => (
            <div
              key={op.id}
              className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between"
            >
              <div className="font-semibold text-xs text-white truncate">{op.nom}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {op.mobile_money && op.mobile_money.length > 0 ? (
                  op.mobile_money.map((mm: string) => (
                    <span
                      key={mm}
                      className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded"
                    >
                      {mm}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-500">Pas de Mobile Money</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
