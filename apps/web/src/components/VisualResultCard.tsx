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
  ChevronDown, 
  ChevronUp,
  Scale,
  CalendarCheck2,
  Info,
  AlertTriangle,
  FileCheck2,
  QrCode,
  ExternalLink,
  Copy,
  Check
} from "lucide-react";

interface ResultCardProps {
  toolId: string;
  response: any;
}

function SourceFooter({
  source,
  derniereVerification,
  confiance,
  avertissements,
}: {
  source?: string | null;
  derniereVerification?: string | null;
  confiance?: string | null;
  avertissements?: Array<{ code?: string; message?: { fr?: string } | string }>;
}) {
  return (
    <div className="pt-3 border-t border-slate-800/80 mt-3 space-y-2 text-xs">
      {/* Avertissements spécifiques s'il y en a */}
      {avertissements && avertissements.length > 0 && (
        <div className="space-y-1.5">
          {avertissements.map((w, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg p-2.5"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                {typeof w.message === "object" ? w.message?.fr : w.message}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Traçabilité & Sources */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
        <div className="flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] truncate">
            Source : <strong className="text-slate-200">{source || "Direction Générale des Impôts / Régulateur National"}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[11px]">
          <span className="flex items-center gap-1 text-slate-400">
            <CalendarCheck2 className="w-3.5 h-3.5 text-slate-500" />
            Vérifié le : <strong className="text-slate-300">{derniereVerification || "2026-10-21"}</strong>
          </span>
          {confiance && (
            <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
              confiance === "haute" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
            }`}>
              Fiabilité : {confiance}
            </span>
          )}
        </div>
      </div>
    </div>
  );
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
  const source = response.source;
  const derniereVerification = response.derniere_verification || "2026-10-21";
  const confiance = response.confiance;
  const avertissements = response.avertissements;

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
              <div className="text-[11px] text-slate-400">Conforme au Plan National de Numérotation officiel</div>
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
              <div className="text-sm font-semibold text-white">{data.operateur_probable || "Opérateur non identifié"}</div>
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

        <SourceFooter
          source={source}
          derniereVerification={derniereVerification}
          confiance={confiance}
          avertissements={avertissements}
        />
      </div>
    );
  }

  // 2. CARTE CONVERSION DE DEVISES
  if (toolId === "convertir_devise") {
    const isUSD = data.de === "USD" || data.vers === "USD";
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Conversion Monétaire</div>
              <div className="text-[11px] text-slate-400">
                {data.parite_fixe ? "Parité fixe garantie sans dérive décimale" : "Conversion avec taux indicatif"}
              </div>
            </div>
          </div>
          {data.parite_fixe ? (
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full font-medium">
              Parité fixe officielle (Zone Franc CFA)
            </span>
          ) : (
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Taux Indicatif Hors Ligne
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

        {/* Message d'avertissement explicite pour l'USD */}
        {isUSD && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200 leading-relaxed">
              <strong className="text-amber-300 font-semibold block mb-0.5">
                Attention financière : Taux USD indicatif
              </strong>
              Le taux utilisé pour le Dollar américain (1 {data.de} = {data.taux} {data.vers}) est un taux de référence statique issu de la Banque Centrale Européenne (BCE, daté du {derniereVerification}).
              Pour un outil financier en production, une donnée fausse coûte cher : <strong>ne pas utiliser pour des règlements réels</strong> sans brancher un flux de change temps-réel ou spécifier le paramètre <code className="text-amber-400 font-mono">taux</code> personnalisé.
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>Taux appliqué : 1 {data.de} = <strong className="text-white font-mono">{data.taux}</strong> {data.vers}</span>
          <span className="text-[11px] text-slate-500">100% hors ligne · Zéro latence</span>
        </div>

        <SourceFooter
          source={source || (data.parite_fixe ? "Accords officiels de coopération monétaire (Banque de France / BEAC / BCEAO)" : "Banque Centrale Européenne (BCE) - Taux de référence")}
          derniereVerification={derniereVerification}
          confiance={confiance}
          avertissements={avertissements}
        />
      </div>
    );
  }

  // 3. CARTE FORMATAGE MONÉTAIRE
  if (toolId === "formater_montant") {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl text-center">
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

        <SourceFooter
          source={source || "Règles bancaires et typographiques nationales (ISO 4217)"}
          derniereVerification={derniereVerification}
          confiance={confiance || "haute"}
          avertissements={avertissements}
        />
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
              <div className="text-[11px] text-slate-400">
                Barème officiel des impôts nationaux ({data.nom_taxe})
              </div>
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

        <SourceFooter
          source={source}
          derniereVerification={derniereVerification}
          confiance={confiance}
          avertissements={avertissements}
        />
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
            <div className="text-[11px] text-slate-500">Indicatif télécom officiel</div>
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
                <span>Voir le calendrier officiel des {holidays.length} jours fériés légaux ({data.annee_feries})</span>
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

        <SourceFooter
          source={source}
          derniereVerification={derniereVerification}
          confiance={confiance}
          avertissements={avertissements}
        />
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
              {data.pays ? `Opérateurs répertoriés en ${data.pays.nom}` : "Catalogue des Opérateurs & Mobile Money"}
            </span>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">
            {data.total} réseaux
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

        <SourceFooter
          source={source}
          derniereVerification={derniereVerification}
          confiance={confiance}
          avertissements={avertissements}
        />
      </div>
    );
  }

  // 7. CARTE VALIDATION IDENTIFIANT FISCAL (NCC, NINEA, NIU, KRA PIN, TIN)
  if (toolId === "valider_identifiant_fiscal") {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Identifiant Fiscal Valide ({data.pays?.nom})</div>
              <div className="text-[11px] text-slate-400">{data.autorite_fiscale}</div>
            </div>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-medium">
            Format Conforme
          </span>
        </div>

        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-1">{data.type_identifiant}</div>
            <div className="text-2xl font-bold font-mono text-amber-400 tracking-wider">
              {data.identifiant_formate}
            </div>
          </div>
          <div className="text-xs text-slate-400 md:text-right">
            <div>Saisi : <code className="text-slate-300 font-mono">{data.identifiant_brut}</code></div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Clef de contrôle & structure vérifiées</div>
          </div>
        </div>

        <SourceFooter
          source={source}
          derniereVerification={derniereVerification}
          confiance={confiance}
          avertissements={avertissements}
        />
      </div>
    );
  }

  // 8. CARTE PAIEMENT MOBILE MONEY
  if (toolId === "generer_paiement_mobile_money") {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Intention de Paiement Mobile Money</div>
              <div className="text-[11px] text-slate-400">{data.operateur} · {data.pays}</div>
            </div>
          </div>
          <span className="text-sm font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            {data.montant} {data.devise}
          </span>
        </div>

        {/* Détails du paiement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="text-xs font-semibold text-slate-300">Bénéficiaire</div>
            <div className="text-base font-mono font-bold text-slate-100">{data.beneficiaire_e164}</div>
            {data.reference && (
              <div className="text-xs text-slate-400">
                Réf : <span className="text-amber-400 font-mono">{data.reference}</span>
              </div>
            )}
            <p className="text-xs text-slate-400 leading-relaxed pt-1">{data.instruction}</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
            <div>
              <div className="text-xs font-semibold text-slate-300 mb-1.5">Mécanisme de déclenchement</div>
              {data.deeplink && (
                <a
                  href={data.deeplink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-all mb-2 shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  <span>Lancer l'application ({data.operateur})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {data.code_ussd && (
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-xs text-amber-300">
                  Code USSD direct : <strong className="text-white">{data.code_ussd}</strong>
                </div>
              )}
            </div>
            <div className="text-[11px] font-mono text-slate-500 break-all bg-slate-900/50 p-2 rounded border border-slate-800/60">
              Payload QR : {data.qr_payload}
            </div>
          </div>
        </div>

        <SourceFooter
          source={source}
          derniereVerification={derniereVerification}
          confiance={confiance}
          avertissements={avertissements}
        />
      </div>
    );
  }

  return null;
}
