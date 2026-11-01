"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ShieldCheck,
  FileCheck2,
  Scale
} from "lucide-react";

export default function RccmValidatorPage() {
  const [rccm, setRccm] = useState("CI-ABJ-2024-B-12345");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = rccm.trim().toUpperCase();

    // Analyse locale instantanée conforme OHADA
    const regex = /^([A-Z]{2})[-/\s]?([A-Z]{3,4})[-/\s]?(\d{4})[-/\s]?([ABMCabmc])[-/\s]?(\d{1,7})$/;
    const match = raw.match(regex);

    const OHADA_PAYS: Record<string, string> = {
      BJ: "Bénin", BF: "Burkina Faso", CM: "Cameroun", CF: "Centrafrique",
      CG: "Congo (Brazzaville)", CI: "Côte d'Ivoire", GA: "Gabon", GN: "Guinée",
      GQ: "Guinée Équatoriale", ML: "Mali", NE: "Niger", CD: "RD Congo",
      SN: "Sénégal", TD: "Tchad", TG: "Togo",
    };

    const TRIBUNAUX: Record<string, string> = {
      ABJ: "Tribunal de Commerce d'Abidjan",
      DKR: "Tribunal de Commerce de Dakar",
      DLA: "Tribunal de Première Instance de Douala",
      LBV: "Tribunal de Commerce de Libreville",
      COT: "Tribunal de Commerce de Cotonou",
      BKO: "Tribunal de Commerce de Bamako",
      LOM: "Tribunal de Commerce de Lomé",
      OUA: "Tribunal de Commerce de Ouagadougou",
      KIN: "Tribunal de Commerce de Kinshasa / Gombe",
    };

    const FORMES: Record<string, string> = {
      A: "Personne Physique (Commerçant individuel, Entreprise individuelle)",
      B: "Personne Morale (SARL, SAS, SA, Société Commerciale)",
      M: "Succursale ou Établissement Secondaire",
      C: "Groupement d'Intérêt Économique (GIE)",
    };

    if (match && OHADA_PAYS[match[1]]) {
      const countryCode = match[1];
      const courtCode = match[2];
      const year = match[3];
      const entityCode = match[4];
      const order = match[5];

      setResult({
        valide: true,
        rccm_formate: `${countryCode}-${courtCode}-${year}-${entityCode}-${order.padStart(5, "0")}`,
        pays: OHADA_PAYS[countryCode],
        pays_code: countryCode,
        tribunal: TRIBUNAUX[courtCode] || `Greffe du Tribunal (${courtCode})`,
        annee: year,
        forme_juridique: FORMES[entityCode] || "Entité Commerciale",
        numero_ordre: order,
      });
    } else {
      setResult({
        valide: false,
        motif: "Format non conforme à la norme OHADA (Code Pays - Tribunal - Année - Type - Ordre).",
      });
    }
  };

  const copyRccm = () => {
    if (!result?.rccm_formate) return;
    navigator.clipboard.writeText(result.rccm_formate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            Norme Traité OHADA (Art. 37 AUDCG)
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-8 py-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <FileCheck2 className="w-4 h-4" />
            Vérification Entreprise & KYC B2B
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Vérificateur & Décodeur de RCCM OHADA en Ligne
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Vérifiez gratuitement la conformité d'un numéro de Registre du Commerce et du Crédit Mobilier (RCCM) pour les 17 États membres de l'OHADA.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <form onSubmit={handleValidate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Numéro RCCM complet :</label>
              <input
                type="text"
                value={rccm}
                onChange={(e) => setRccm(e.target.value)}
                placeholder="Ex: CI-ABJ-2024-B-12345 ou SN-DKR-2023-A-09876"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white font-mono text-base rounded-xl p-3 outline-none transition-all uppercase"
              />
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-slate-500">Exemples fréquents :</span>
              <button
                type="button"
                onClick={() => setRccm("CI-ABJ-2024-B-12345")}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                🇨🇮 Abidjan (Société B)
              </button>
              <span className="text-slate-700">·</span>
              <button
                type="button"
                onClick={() => setRccm("SN-DKR-2023-A-09876")}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                🇸🇳 Dakar (Personne A)
              </button>
              <span className="text-slate-700">·</span>
              <button
                type="button"
                onClick={() => setRccm("CM-DLA-2022-M-00123")}
                className="text-amber-400 hover:underline cursor-pointer"
              >
                🇨🇲 Douala (Succursale M)
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider le Numéro RCCM OHADA</span>
            </button>
          </form>

          {result && (
            <div className="pt-4 border-t border-slate-800 animate-in fade-in duration-300">
              {result.valide ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5" /> Immatriculation Conforme aux Normes OHADA
                    </span>
                    <button
                      onClick={copyRccm}
                      className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copié !" : "Copier"}</span>
                    </button>
                  </div>

                  <div className="font-mono text-xl font-bold text-white tracking-widest break-all bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                    {result.rccm_formate}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase">Pays Membre</span>
                      <strong className="text-white text-sm">{result.pays} ({result.pays_code})</strong>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase">Juridiction / Tribunal</span>
                      <strong className="text-white text-sm">{result.tribunal}</strong>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase">Forme Juridique</span>
                      <strong className="text-amber-400 text-sm">{result.forme_juridique}</strong>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 block text-[10px] uppercase">Année d'Enregistrement</span>
                      <strong className="text-white text-sm">{result.annee} (N° d'ordre : {result.numero_ordre})</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center gap-3 text-rose-300 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{result.motif}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
