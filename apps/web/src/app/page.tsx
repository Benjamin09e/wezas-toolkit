"use client";

import React, { useState, useEffect, Suspense } from "react";
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
  Code2,
  Package,
  ExternalLink,
  FileCheck2,
  QrCode,
  Share2,
  History,
  RotateCcw,
  Check,
  ChevronDown
} from "lucide-react";
import { useSearchParams } from "next/navigation";

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

export interface ToolConfig {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  icon: any;
  defaultPayload: Record<string, any>;
}

export const TOOLS: ToolConfig[] = [
  {
    id: "valider_telephone",
    name: "Validation Téléphone",
    shortName: "Téléphone",
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
    shortName: "Devises",
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
    shortName: "Info Pays",
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
    shortName: "Formatage",
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
    shortName: "TVA",
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
    shortName: "Opérateurs",
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
    shortName: "Fiscal (NIF)",
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
    shortName: "Paiement",
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

interface ExecutionHistoryItem {
  id: string;
  toolId: string;
  toolName: string;
  timestamp: string;
  args: Record<string, any>;
  summary: string;
}

const HISTORY_STORAGE_KEY = "wezas_playground_history_v1";

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const [selectedTool, setSelectedTool] = useState<ToolConfig>(TOOLS[0]);
  const [currentArgs, setCurrentArgs] = useState<Record<string, any>>(TOOLS[0].defaultPayload);
  const [viewMode, setViewMode] = useState<"form" | "json">("form");
  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(TOOLS[0].defaultPayload, null, 2)
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<any>(null);

  // Deep Link copied state
  const [copiedLink, setCopiedLink] = useState(false);

  // Recent History
  const [history, setHistory] = useState<ExecutionHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not load history from localStorage", e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (tool: ToolConfig, args: Record<string, any>) => {
    try {
      let summary = "";
      if (args.numero) summary = `Tél: ${args.numero}`;
      else if (args.montant && args.devise) summary = `${args.montant} ${args.devise}`;
      else if (args.montant && args.vers) summary = `${args.montant} -> ${args.vers}`;
      else if (args.identifiant) summary = `Id: ${args.identifiant}`;
      else if (args.operateur) summary = `${args.operateur} (${args.pays || ""})`;
      else if (args.pays) summary = `Pays: ${args.pays}`;
      else summary = "Test";

      const newItem: ExecutionHistoryItem = {
        id: Date.now().toString(),
        toolId: tool.id,
        toolName: tool.name,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        args,
        summary,
      };

      const updated = [newItem, ...history.filter(h => JSON.stringify(h.args) !== JSON.stringify(args) || h.toolId !== tool.id)].slice(0, 5);
      setHistory(updated);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save history to localStorage", e);
    }
  };

  // Synchronize URL on initial load from searchParams
  useEffect(() => {
    const toolParam = searchParams.get("tool");
    if (!toolParam) return;

    const matched = TOOLS.find((t) => t.id === toolParam);
    if (!matched) return;

    const newArgs: Record<string, any> = { ...matched.defaultPayload };
    searchParams.forEach((val, key) => {
      if (key !== "tool") {
        if (val === "true") newArgs[key] = true;
        else if (val === "false") newArgs[key] = false;
        else if (!isNaN(Number(val)) && val.trim() !== "") newArgs[key] = Number(val);
        else newArgs[key] = val;
      }
    });

    setSelectedTool(matched);
    setCurrentArgs(newArgs);
    setJsonText(JSON.stringify(newArgs, null, 2));
  }, [searchParams]);

  // Update URL Query String silently without page reload
  const updateUrlParams = (toolId: string, args: Record<string, any>) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    params.set("tool", toolId);
    Object.entries(args).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        params.set(k, String(v));
      }
    });
    const newRelativePathQuery = window.location.pathname + "?" + params.toString();
    window.history.replaceState(null, "", newRelativePathQuery);
  };

  const handleSelectTool = (tool: ToolConfig) => {
    setSelectedTool(tool);
    setCurrentArgs(tool.defaultPayload);
    setJsonText(JSON.stringify(tool.defaultPayload, null, 2));
    setResponse(null);
    updateUrlParams(tool.id, tool.defaultPayload);
  };

  const updateArg = (key: string, value: any) => {
    const updated = { ...currentArgs, [key]: value };
    setCurrentArgs(updated);
    setJsonText(JSON.stringify(updated, null, 2));
    updateUrlParams(selectedTool.id, updated);
  };

  const handleCopyShareLink = async () => {
    try {
      updateUrlParams(selectedTool.id, currentArgs);
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReplayHistory = (item: ExecutionHistoryItem) => {
    const matched = TOOLS.find((t) => t.id === item.toolId);
    if (matched) {
      setSelectedTool(matched);
      setCurrentArgs(item.args);
      setJsonText(JSON.stringify(item.args, null, 2));
      updateUrlParams(matched.id, item.args);
      setShowHistory(false);
    }
  };

  const handleExecute = async () => {
    try {
      setLoading(true);
      let payloadToExecute = currentArgs;

      if (viewMode === "json") {
        payloadToExecute = JSON.parse(jsonText);
      }

      saveToHistory(selectedTool, payloadToExecute);
      updateUrlParams(selectedTool.id, payloadToExecute);

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
      {/* Header Responsive */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold text-base sm:text-lg shrink-0">
              W
            </div>
            <div className="truncate">
              <span className="font-semibold text-white tracking-tight text-sm sm:text-base">Wezas Africa</span>
              <span className="hidden sm:inline-block ml-2 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono">
                MCP Playground
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3 text-sm shrink-0">
            <span className="hidden lg:flex items-center gap-1.5 text-emerald-400 text-xs mr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              19 Pays Couverts
            </span>

            {/* Bouton Partager URL profonde */}
            <button
              onClick={handleCopyShareLink}
              title="Copier le lien direct vers cette configuration"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all cursor-pointer min-h-[36px]"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium hidden sm:inline">Lien copié</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Partager</span>
                </>
              )}
            </button>

            <a
              href="https://www.npmjs.com/package/wezas-africa-toolkit"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all min-h-[36px]"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>NPM</span>
            </a>
            <a
              href="https://github.com/Benjamin09e/wezas-toolkit"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-all min-h-[36px]"
            >
              <GithubIcon className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Section d'Installation NPM / Python / MCP */}
        <InstallationSection />

        {/* Barre de sélection d'outils MOBILE & TABLETTE (visible < lg) */}
        <div className="block lg:hidden bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-lg">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Outil sélectionné ({TOOLS.length})
            </span>
            {history.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <History className="w-3 h-3" />
                <span>Historique ({history.length})</span>
              </button>
            )}
          </div>

          {/* Sélecteur Mobile Dropdown + Défilement Horizontal */}
          <div className="relative">
            <select
              value={selectedTool.id}
              onChange={(e) => {
                const found = TOOLS.find((t) => t.id === e.target.value);
                if (found) handleSelectTool(found);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-sm text-slate-100 font-medium focus:outline-none focus:border-amber-500 appearance-none min-h-[44px]"
            >
              {TOOLS.map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.name} · {tool.category}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Défilement horizontal des tags rapides sur mobile */}
          <div className="flex gap-2 overflow-x-auto pb-1 mt-3 scrollbar-none">
            {TOOLS.map((tool) => {
              const isSelected = selectedTool.id === tool.id;
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => handleSelectTool(tool)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all min-h-[36px] ${
                    isSelected
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-semibold"
                      : "bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tool.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Historique Popup / Drawer */}
        {showHistory && history.length > 0 && (
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <History className="w-3.5 h-3.5" />
                <span>Dernières requêtes exécutées (5)</span>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Fermer
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleReplayHistory(item)}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-amber-400">
                      {item.toolName}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      {item.summary}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-slate-500 group-hover:text-amber-400 text-xs">
                    <RotateCcw className="w-3 h-3" />
                    <span className="text-[10px]">{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layout Principal Desktop & Tablette */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Colonne Gauche Desktop : Liste des Outils (visible >= lg) */}
          <div className="hidden lg:block lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Boîte à outils
              </span>
              {history.length > 0 && (
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Historique ({history.length})</span>
                </button>
              )}
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
                      className={`p-2 rounded-lg mt-0.5 shrink-0 ${
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
                        <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">
                          {tool.category}
                        </span>
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
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 min-w-0">
                  <Terminal className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-200 truncate">
                    Paramètres : <code className="text-amber-400 font-mono text-xs sm:text-sm">{selectedTool.id}</code>
                  </span>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3">
                  {/* Switcher Formulaire vs JSON */}
                  <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
                    <button
                      onClick={() => setViewMode("form")}
                      className={`px-3 py-1.5 rounded-lg transition-all min-h-[32px] cursor-pointer ${
                        viewMode === "form" ? "bg-amber-500 text-slate-950 font-semibold" : "text-slate-400"
                      }`}
                    >
                      Formulaire
                    </button>
                    <button
                      onClick={() => setViewMode("json")}
                      className={`px-3 py-1.5 rounded-lg transition-all min-h-[32px] cursor-pointer ${
                        viewMode === "json" ? "bg-amber-500 text-slate-950 font-semibold" : "text-slate-400"
                      }`}
                    >
                      JSON
                    </button>
                  </div>

                  <button
                    onClick={handleExecute}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all disabled:opacity-50 shadow-md shadow-amber-500/10 cursor-pointer min-h-[40px] grow sm:grow-0"
                  >
                    <Play className="w-4 h-4 fill-current shrink-0" />
                    <span>{loading ? "Calcul..." : "Tester l'outil"}</span>
                  </button>
                </div>
              </div>

              {/* Mode Formulaire Intuitif */}
              {viewMode === "form" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sélecteur de Pays */}
                  {"pays" in currentArgs && (
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-medium text-slate-400">Pays d'Afrique :</label>
                      <select
                        value={currentArgs.pays || ""}
                        onChange={(e) => updateArg("pays", e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 min-h-[42px]"
                      >
                        {selectedTool.id === "lister_operateurs" && (
                          <option value="">Tous les pays (19 pays)</option>
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
                        type="tel"
                        value={currentArgs.numero || ""}
                        onChange={(e) => updateArg("numero", e.target.value)}
                        placeholder="Ex: 077 12 34 56 ou +241..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 min-h-[42px]"
                      />
                    </div>
                  )}

                  {/* Champ Montant */}
                  {"montant" in currentArgs && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400">Montant :</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={currentArgs.montant ?? ""}
                        onChange={(e) => updateArg("montant", Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 min-h-[42px]"
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 min-h-[42px]"
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 min-h-[42px]"
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
                        inputMode="numeric"
                        value={currentArgs.annee || 2026}
                        onChange={(e) => updateArg("annee", Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 min-h-[42px]"
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 min-h-[42px]"
                      >
                        <option value="ht">HT vers TTC (Ajouter TVA)</option>
                        <option value="ttc">TTC vers HT (Extraire TVA)</option>
                      </select>
                    </div>
                  )}

                  {/* Filtre Mobile Money */}
                  {"avec_mobile_money_seulement" in currentArgs && (
                    <div className="space-y-1.5 flex items-center gap-2 pt-2 md:pt-6">
                      <input
                        type="checkbox"
                        id="mm_only"
                        checked={Boolean(currentArgs.avec_mobile_money_seulement)}
                        onChange={(e) => updateArg("avec_mobile_money_seulement", e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0 cursor-pointer"
                      />
                      <label htmlFor="mm_only" className="text-xs text-slate-300 cursor-pointer">
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono min-h-[42px]"
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 min-h-[42px]"
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
                        type="tel"
                        value={currentArgs.telephone || ""}
                        onChange={(e) => updateArg("telephone", e.target.value)}
                        placeholder="Ex: 77 123 45 67"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 min-h-[42px]"
                      />
                    </div>
                  )}

                  {/* Référence Paiement */}
                  {"reference" in currentArgs && (
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-medium text-slate-400">Référence de facture (Optionnel) :</label>
                      <input
                        type="text"
                        value={currentArgs.reference || ""}
                        onChange={(e) => updateArg("reference", e.target.value)}
                        placeholder="Ex: FACT-2026-001"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 min-h-[42px]"
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
            <div className="flex-1 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col min-h-[350px]">
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
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 sm:p-4 overflow-auto max-h-56">
                {response ? (
                  <pre className="text-xs font-mono text-slate-200 leading-relaxed whitespace-pre-wrap break-all sm:break-normal">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2 py-10 sm:py-12">
                    <Terminal className="w-8 h-8 opacity-40" />
                    <p className="text-xs text-center px-4">Sélectionnez les paramètres et cliquez sur « Tester l'outil ».</p>
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

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-400">Chargement du Playground...</div>}>
      <PlaygroundContent />
    </Suspense>
  );
}
