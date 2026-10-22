"use client";

import React, { useState } from "react";
import { 
  Terminal, 
  Copy, 
  Check, 
  Package, 
  Bot, 
  ExternalLink
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

export function InstallationSection() {
  const [activeTab, setActiveTab] = useState<"npm" | "mcp">("npm");
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

  const claudeConfigJson = JSON.stringify(
    {
      mcpServers: {
        "wezas-africa": {
          command: "npx",
          args: ["-y", "wezas-africa-toolkit"],
        },
      },
    },
    null,
    2
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              OPEN SOURCE & MCP
            </span>
            <span className="text-xs text-slate-400">Licence MIT · 19 pays couverts</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            Intégrez Wezas Africa Toolkit dans vos projets & assistants IA
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            SDK TypeScript pour vos apps ou Serveur MCP pour Claude Desktop, Cursor et Windsurf.
          </p>
        </div>

        {/* Sélecteur d'onglets (NPM et MCP) */}
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
            onClick={() => setActiveTab("mcp")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === "mcp"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Serveur MCP (Claude / Cursor)</span>
          </button>
        </div>
      </div>

      {/* Contenu Onglet 1 : NPM SDK */}
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

      {/* Contenu Onglet 2 : Serveur MCP */}
      {activeTab === "mcp" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950 border border-slate-800/90 rounded-xl p-3.5">
            <div className="flex items-center gap-3">
              <Terminal className="w-4 h-4 text-amber-400" />
              <code className="text-xs font-mono text-emerald-400">
                npx -y wezas-africa-toolkit
              </code>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/Benjamin09e/wezas-toolkit"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-all mr-2"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span>Dépôt GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://smithery.ai/server/wezas-africa-toolkit"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-all mr-2"
              >
                <span>Fiche Smithery</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => copyToClipboard("npx -y wezas-africa-toolkit", "npx-cmd")}
                className="flex items-center gap-1.5 text-xs bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                {copiedIndex === "npx-cmd" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier la commande</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/70 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Configuration prête à copier pour Claude Desktop & Cursor
              </div>
              <button
                onClick={() => copyToClipboard(claudeConfigJson, "claude-json")}
                className="flex items-center gap-1.5 text-[11px] bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-1 rounded transition-all cursor-pointer"
              >
                {copiedIndex === "claude-json" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">JSON Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copier le JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto bg-slate-950 p-3 rounded-lg border border-slate-800">
{claudeConfigJson}
            </pre>
            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>Collez ce bloc dans votre <code className="text-amber-400 font-mono">claude_desktop_config.json</code></span>
              <a
                href="https://github.com/Benjamin09e/wezas-toolkit#readme"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Documentation complète d'installation</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
