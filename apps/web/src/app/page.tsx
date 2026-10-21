"use client";

import React, { useState } from "react";
import { 
  Phone, 
  Coins, 
  Globe2, 
  Calculator, 
  Receipt, 
  Users, 
  Play, 
  Terminal, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Layers
} from "lucide-react";
import { SUPPORTED_COUNTRIES } from "@/data/countries";

interface ToolConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  defaultPayload: Record<string, any>;
}

const TOOLS: ToolConfig[] = [
  {
    id: "valider_telephone",
    name: "Validation Téléphone",
    category: "Télécom & Mobile",
    description: "Validation E.164, détection de l'opérateur et éligibilité Mobile Money.",
    icon: Phone,
    defaultPayload: {
      pays: "GA",
      numero: "077 12 34 56",
    },
  },
  {
    id: "convertir_devise",
    name: "Conversion de Devises",
    category: "Fintech",
    description: "Parité fixe XAF/XOF/EUR garantie hors ligne et support USD avec taux indicatif.",
    icon: Coins,
    defaultPayload: {
      montant: 50000,
      de: "EUR",
      vers: "XAF",
    },
  },
  {
    id: "info_pays",
    name: "Informations Pays",
    category: "Référence",
    description: "Indicatifs, fuseaux horaires, langues et calendrier complet des jours fériés légaux.",
    icon: Globe2,
    defaultPayload: {
      pays: "SN",
      annee: 2026,
    },
  },
  {
    id: "formater_montant",
    name: "Formatage Monétaire",
    category: "Fintech",
    description: "Formatage conforme aux usages locaux africains (ex: 1 500 000 FCFA).",
    icon: Calculator,
    defaultPayload: {
      montant: 1250000,
      devise: "XOF",
      pays: "CI",
      inclure_symbole: true,
    },
  },
  {
    id: "calculer_tva",
    name: "Calcul de TVA",
    category: "Fiscalité",
    description: "Calculs HT/TTC d'après les barèmes fiscaux officiels des pays d'Afrique centrale et de l'ouest.",
    icon: Receipt,
    defaultPayload: {
      montant: 100000,
      pays: "CM",
      mode: "ht",
      type_taux: "standard",
    },
  },
  {
    id: "lister_operateurs",
    name: "Catalogue Opérateurs",
    category: "Télécom & Mobile",
    description: "Listing des réseaux GSM et services Mobile Money par pays (MoMo, Orange Money, Wave...).",
    icon: Users,
    defaultPayload: {
      pays: "SN",
      avec_mobile_money_seulement: true,
    },
  },
];

export default function Home() {
  const [selectedTool, setSelectedTool] = useState<ToolConfig>(TOOLS[0]);
  const [currentArgs, setCurrentArgs] = useState<Record<string, any>>(TOOLS[0].defaultPayload);
  const [viewMode, setViewMode] = useState<"form" | "json">("form");
  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(TOOLS[0].defaultPayload, null, 2)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<any>(null);

  const handleSelectTool = (tool: ToolConfig) => {
    setSelectedTool(tool);
    setCurrentArgs(tool.defaultPayload);
    setJsonText(JSON.stringify(tool.defaultPayload, null, 2));
    setResponse(null);
  };

  const updateArg = (key: string, value: any) => {
    const updated = { ...currentArgs, [key]: value };
    setCurrentArgs(updated);
    setJsonText(JSON.stringify(updated, null, 2));
  };

  const handleExecute = async () => {
    try {
      setLoading(true);
      let payloadToExecute = currentArgs;

      if (viewMode === "json") {
        payloadToExecute = JSON.parse(jsonText);
      }

      const res = await fetch("/api/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: selectedTool.id,
          arguments: payloadToExecute,
        }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setResponse({ error: "Erreur JSON ou exécution : " + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold text-lg">
              W
            </div>
            <div>
              <span className="font-semibold text-white tracking-tight">Wezas Africa Toolkit</span>
              <span className="ml-2 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">
                MCP Playground
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              12 Pays Couverts (Zone Franc XAF/XOF)
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne Gauche : Sélection des Outils */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 mb-2">
            Boîte à outils
          </div>
          <div className="space-y-2">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isSelected = selectedTool.id === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => handleSelectTool(tool)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                    isSelected
                      ? "bg-amber-500/10 border-amber-500/40 text-white shadow-lg shadow-amber-500/5"
                      : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg mt-0.5 ${
                      isSelected
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium truncate">{tool.name}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{tool.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Colonne Droite : Formulaire & Réponses */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          {/* Panneau Paramètres / Formulaire */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-slate-200">
                  Paramètres : <code className="text-amber-400 font-mono">{selectedTool.id}</code>
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Switcher Formulaire vs JSON */}
                <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
                  <button
                    onClick={() => setViewMode("form")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      viewMode === "form" ? "bg-amber-500 text-slate-950 font-semibold" : "text-slate-400"
                    }`}
                  >
                    Formulaire
                  </button>
                  <button
                    onClick={() => setViewMode("json")}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      viewMode === "json" ? "bg-amber-500 text-slate-950 font-semibold" : "text-slate-400"
                    }`}
                  >
                    JSON
                  </button>
                </div>

                <button
                  onClick={handleExecute}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-sm transition-all disabled:opacity-50 shadow-md shadow-amber-500/10 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {loading ? "Calcul..." : "Tester l'outil"}
                </button>
              </div>
            </div>

            {/* Mode Formulaire Intuitif avec Liste des Pays */}
            {viewMode === "form" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sélecteur de Pays si applicable */}
                {"pays" in currentArgs && (
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-medium text-slate-400">Pays d'Afrique :</label>
                    <select
                      value={currentArgs.pays || ""}
                      onChange={(e) => updateArg("pays", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60"
                    >
                      {selectedTool.id === "lister_operateurs" && (
                        <option value="">Tous les pays</option>
                      )}
                      {SUPPORTED_COUNTRIES.map((c) => (
                        <option key={c.iso2} value={c.iso2}>
                          {c.flag} {c.name} ({c.iso2}) - {c.currency} ({c.dialCode})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Champ Numéro Téléphone */}
                {"numero" in currentArgs && (
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-medium text-slate-400">Numéro de téléphone :</label>
                    <input
                      type="text"
                      value={currentArgs.numero || ""}
                      onChange={(e) => updateArg("numero", e.target.value)}
                      placeholder="Ex: 077 12 34 56 ou +241..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                )}

                {/* Champ Montant */}
                {"montant" in currentArgs && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Montant :</label>
                    <input
                      type="number"
                      value={currentArgs.montant ?? ""}
                      onChange={(e) => updateArg("montant", Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                )}

                {/* Sélecteur Devise Source */}
                {"de" in currentArgs && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">De (Devise source) :</label>
                    <select
                      value={currentArgs.de || "EUR"}
                      onChange={(e) => updateArg("de", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="XAF">XAF (FCFA Afrique Centrale)</option>
                      <option value="XOF">XOF (FCFA Afrique de l'Ouest)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                )}

                {/* Sélecteur Devise Cible */}
                {"vers" in currentArgs && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Vers (Devise cible) :</label>
                    <select
                      value={currentArgs.vers || "XAF"}
                      onChange={(e) => updateArg("vers", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60"
                    >
                      <option value="XAF">XAF (FCFA Afrique Centrale)</option>
                      <option value="XOF">XOF (FCFA Afrique de l'Ouest)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                )}

                {/* Sélecteur Année pour Jours Fériés */}
                {"annee" in currentArgs && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Année :</label>
                    <input
                      type="number"
                      value={currentArgs.annee || 2026}
                      onChange={(e) => updateArg("annee", Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                )}

                {/* Options TVA */}
                {"mode" in currentArgs && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Mode de calcul :</label>
                    <select
                      value={currentArgs.mode || "ht"}
                      onChange={(e) => updateArg("mode", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60"
                    >
                      <option value="ht">HT vers TTC (Ajouter TVA)</option>
                      <option value="ttc">TTC vers HT (Extraire TVA)</option>
                    </select>
                  </div>
                )}

                {/* Filtre Mobile Money */}
                {"avec_mobile_money_seulement" in currentArgs && (
                  <div className="space-y-1.5 flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="mm_only"
                      checked={Boolean(currentArgs.avec_mobile_money_seulement)}
                      onChange={(e) => updateArg("avec_mobile_money_seulement", e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                    />
                    <label htmlFor="mm_only" className="text-xs text-slate-300">
                      Uniquement opérateurs avec Mobile Money
                    </label>
                  </div>
                )}
              </div>
            ) : (
              /* Mode Éditeur JSON */
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-mono">Payload JSON :</label>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-amber-500/50 resize-y"
                />
              </div>
            )}
          </div>

          {/* Panneau Réponse */}
          <div className="flex-1 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                {response?.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : response ? (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <Sparkles className="w-4 h-4 text-slate-500" />
                )}
                <span>Résultat d'exécution MCP (Envelope)</span>
              </div>
              {response?.confiance && (
                <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-md">
                  Confiance : {response.confiance}
                </span>
              )}
            </div>

            <div className="flex-1 bg-slate-950 border border-slate-800/80 rounded-xl p-4 overflow-auto">
              {response ? (
                <pre className="text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(response, null, 2)}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 py-12">
                  <Terminal className="w-8 h-8 opacity-40" />
                  <p className="text-xs">Sélectionnez les paramètres et cliquez sur « Tester l'outil ».</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
