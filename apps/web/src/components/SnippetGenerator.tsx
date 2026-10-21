"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";
import { CodeLanguage, generateSnippet } from "@/utils/snippets";

interface SnippetGeneratorProps {
  toolId: string;
  args: Record<string, any>;
}

export function SnippetGenerator({ toolId, args }: SnippetGeneratorProps) {
  const [selectedLang, setSelectedLang] = useState<CodeLanguage>("python");
  const [copied, setCopied] = useState(false);

  const snippet = generateSnippet(toolId, args, selectedLang);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const languages: { id: CodeLanguage; label: string }[] = [
    { id: "python", label: "Python" },
    { id: "typescript", label: "TypeScript / JS" },
    { id: "curl", label: "cURL" },
    { id: "php", label: "PHP" },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-4">
      <div className="flex items-center justify-between bg-slate-950/80 px-4 py-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLang(lang.id)}
              className={`text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                selectedLang === lang.id
                  ? "bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copié !</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copier le code</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 bg-slate-950/60 overflow-x-auto">
        <pre className="text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap">
          {snippet}
        </pre>
      </div>
    </div>
  );
}
