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
  Layers,
  Code2,
  Package,
  ExternalLink,
  FileCheck2,
  QrCode
} from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}
import { SUPPORTED_COUNTRIES } from "@/data/countries";
import { VisualResultCard } from "@/components/VisualResultCard";
import { SnippetGenerator } from "@/components/SnippetGenerator";
import { InstallationSection } from "@/components/InstallationSection";

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
  {
    id: "valider_identifiant_fiscal",
    name: "Identifiant Fiscal (NIF/TIN)",
    category: "Fiscalité & B2B",
    description: "Validation et normalisation des identifiants fiscaux (NCC, NINEA, NIU, NIF, KRA PIN, TIN).",
    icon: FileCheck2,
    defaultPayload: {
      pays: "CI",
      identifiant: "1234567 A",
    },
  },
  {
    id: "generer_paiement_mobile_money",
    name: "Paiement Mobile Money",
    category: "Fintech",
    description: "Génération de liens profonds (deeplinks), syntaxes USSD et QR payloads de paiement.",
    icon: QrCode,
    defaultPayload: {
      operateur: "Wave",
      pays: "SN",
      telephone: "77 123 45 67",
      montant: 5000,
      reference: "FACT-2026-001",
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
          <div className="flex items-center space-x-3 text-sm">
            <span className="hidden md:flex items-center gap-1.5 text-emerald-400 text-xs mr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              15 Pays Couverts (Zone Franc, NG, GH, KE)
            </span>
            <a
              href="https://www.npmjs.com/package/wezas-africa-toolkit"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>NPM</span>
            </a>
            <a
              href="https://github.com/Benjamin09e/wezas-toolkit"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all"
            >
              <GithubIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {/* Section d'Installation NPM / Python / MCP */}
        <InstallationSection />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

                {/* Champ Identifiant Fiscal */}
                {"identifiant" in currentArgs && (
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-medium text-slate-400">Numéro fiscal (NIF / NCC / NINEA / NIU / TIN) :</label>
                    <input
                      type="text"
                      value={currentArgs.identifiant || ""}
                      onChange={(e) => updateArg("identifiant", e.target.value)}
                      placeholder="Ex: 1234567 A ou 001234567 2V2..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60 font-mono"
                    />
                  </div>
                )}

                {/* Sélecteur Opérateur Paiement */}
                {"operateur" in currentArgs && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Réseau Mobile Money :</label>
                    <select
                      value={currentArgs.operateur || "Wave"}
                      onChange={(e) => updateArg("operateur", e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60"
                    >
                      <option value="Wave">Wave Mobile Money</option>
                      <option value="Orange Money">Orange Money</option>
                      <option value="MTN MoMo">MTN MoMo</option>
                      <option value="M-Pesa">M-Pesa (Safaricom)</option>
                      <option value="Airtel Money">Airtel Money</option>
                    </select>
                  </div>
                )}

                {/* Téléphone Bénéficiaire */}
                {"telephone" in currentArgs && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Téléphone bénéficiaire :</label>
                    <input
                      type="text"
                      value={currentArgs.telephone || ""}
                      onChange={(e) => updateArg("telephone", e.target.value)}
                      placeholder="Ex: 77 123 45 67"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                )}

                {/* Référence Paiement */}
                {"reference" in currentArgs && (
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-medium text-slate-400">Référence de commande / facture (Optionnel) :</label>
                    <input
                      type="text"
                      value={currentArgs.reference || ""}
                      onChange={(e) => updateArg("reference", e.target.value)}
                      placeholder="Ex: FACT-2026-001"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500/60"
                    />
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

          {/* Panneau Réponse et Visualisation */}
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
                <span>Résultat & Intégration</span>
              </div>
              {response?.confiance && (
                <span className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-md">
                  Confiance : {response.confiance}
                </span>
              )}
            </div>

            {/* Carte Visuelle Haute Fidélité */}
            {response && (
              <div className="mb-4">
                <VisualResultCard toolId={selectedTool.id} response={response} />
              </div>
            )}

            {/* Onglet JSON Brut */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 overflow-auto max-h-56">
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

            {/* Générateur d'Extraits de Code pour Développeurs */}
            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                <Code2 className="w-4 h-4 text-amber-500" />
                <span>Intégrer dans votre application (Copy-Paste)</span>
              </div>
              <SnippetGenerator toolId={selectedTool.id} args={currentArgs} />
            </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
