"use client";

import React, { useState } from "react";
import { 
  Terminal, 
  Copy, 
  Check, 
  Package, 
  Bot, 
  Cpu, 
  ExternalLink,
  ChevronRight
} from "lucide-react";

export function InstallationSection() {
  const [activeTab, setActiveTab] = useState<"npm" | "python" | "mcp">("npm");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(id);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              DISPONIBLE PARTOUT
            </span>
            <span className="text-xs text-slate-400">100% Open Source (MIT)</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Intégrez Wezas Africa Toolkit dans vos projets
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Choisissez votre écosystème favori pour démarrer en quelques secondes.
          </p>
        </div>

        {/* Sélecteur d'onglets */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("npm")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "npm"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>NPM (Node / Next.js)</span>
          </button>

          <button
            onClick={() => setActiveTab("python")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "python"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Python (PyPI / uv)</span>
          </button>

          <button
            onClick={() => setActiveTab("mcp")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "mcp"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Serveur MCP (IA)</span>
          </button>
        </div>
      </div>

      {/* Contenu de l'onglet actif */}
      {activeTab === "npm" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950 border border-slate-800/90 rounded-xl p-3.5">
            <div className="flex items-center gap-3">
              <Terminal className="w-4 h-4 text-amber-400" />
              <code className="text-xs font-mono text-emerald-400">
                npm install wezas-africa-toolkit
              </code>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://www.npmjs.com/package/wezas-africa-toolkit"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-all mr-2"
              >
                <span>Voir sur npmjs.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => copyToClipboard("npm install wezas-africa-toolkit", "npm-cmd")}
                className="flex items-center gap-1.5 text-xs bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                {copiedIndex === "npm-cmd" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/70 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Exemple d'utilisation TypeScript / Next.js
            </div>
            <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
{`import { wezas, formatAmountOffline } from "wezas-africa-toolkit";

// 1. Validation de téléphone africain & Mobile Money (Orange Money, MoMo, Wave, M-Pesa...)
const res = await wezas.validerTelephone("Sénégal", "771234567");
console.log(res.data.e164);               // "+221771234567"
console.log(res.data.operateur_probable); // "Orange Sénégal (Sonatel)"
console.log(res.data.mobile_money);       // ["Orange Money", "Wave"]

// 2. Formatage monétaire local instantané
const format = formatAmountOffline(1500000, "XOF");
console.log(format.data.montant_formate);  // "1 500 000 FCFA"`}
            </pre>
          </div>
        </div>
      )}

      {activeTab === "python" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950 border border-slate-800/90 rounded-xl p-3.5">
            <div className="flex items-center gap-3">
              <Terminal className="w-4 h-4 text-amber-400" />
              <code className="text-xs font-mono text-emerald-400">
                pip install wezas-africa-toolkit
              </code>
            </div>
            <button
              onClick={() => copyToClipboard("pip install wezas-africa-toolkit", "pip-cmd")}
              className="flex items-center gap-1.5 text-xs bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              {copiedIndex === "pip-cmd" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/70 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Exemple d'utilisation Python (100% hors ligne)
            </div>
            <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
{`from wezas_core.phone import validate_phone
from wezas_core.vat import calculate_vat

# Validation de téléphone
phone = validate_phone("Gabon", "077123456")
print(phone.data["e164"]) # "+24177123456"

# Calcul de TVA officiel
tva = calculate_vat(100000, "Cameroun", mode="ht")
print(tva.data["montant_ttc"]) # "119250"`}
            </pre>
          </div>
        </div>
      )}

      {activeTab === "mcp" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950 border border-slate-800/90 rounded-xl p-3.5">
            <div className="flex items-center gap-3">
              <Terminal className="w-4 h-4 text-amber-400" />
              <code className="text-xs font-mono text-emerald-400">
                uvx wezas-africa-toolkit
              </code>
            </div>
            <button
              onClick={() => copyToClipboard("uvx wezas-africa-toolkit", "uvx-cmd")}
              className="flex items-center gap-1.5 text-xs bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              {copiedIndex === "uvx-cmd" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/70 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Configuration pour Claude Desktop / Cursor / Windsurf
            </div>
            <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
{`// Ajoutez ceci dans votre claude_desktop_config.json ou Cursor MCP Settings :
{
  "mcpServers": {
    "wezas-africa-toolkit": {
      "command": "uvx",
      "args": ["wezas-africa-toolkit"]
    }
  }
}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
