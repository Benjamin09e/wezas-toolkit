"use client";

import React, { useState } from "react";
import { Key, Copy, Check, Plus, AlertCircle, Eye, EyeOff } from "lucide-react";

interface GeneratedKey {
  key_id: string;
  api_key: string;
  name: string;
  environment: "live" | "test";
  scopes: string[];
  created_at: string;
}

export function ApiKeyManager() {
  const [keys, setKeys] = useState<GeneratedKey[]>([]);
  const [name, setName] = useState("");
  const [env, setEnv] = useState<"live" | "test">("live");
  const [scopes, setScopes] = useState<string[]>(["read:tools"]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Appel direct à l'API backend FastAPI ou proxy Next.js
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/keys/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          environment: env,
          scopes: scopes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.detail || "Échec de génération de la clé");
      }

      setKeys((prev) => [data, ...prev]);
      setShowKey((prev) => ({ ...prev, [data.key_id]: true }));
      setName("");
    } catch (err: any) {
      setError(err.message || "Erreur de connexion avec l'API");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleScope = (scope: string) => {
    setScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Key className="w-6 h-6 text-amber-400" />
            <span>Gestion des Clés API (Volet 2)</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Générez des clés d'accès sécurisées (600 req/min) pour vos applications et microservices.
          </p>
        </div>
        <span className="self-start sm:self-auto text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
          Stockage HMAC-SHA256
        </span>
      </div>

      {/* Formulaire de création */}
      <form onSubmit={handleCreate} className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nom de l'application / service
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Passerelle Paiement MedRDV"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Environnement
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEnv("live")}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                  env === "live"
                    ? "bg-amber-400/10 border-amber-400/40 text-amber-300"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                Production (wz_live_)
              </button>
              <button
                type="button"
                onClick={() => setEnv("test")}
                className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors ${
                  env === "test"
                    ? "bg-sky-400/10 border-sky-400/40 text-sky-300"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                Sandbox (wz_test_)
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Permissions (Scopes)
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "read:tools", label: "read:tools (Calculs & conversions)" },
              { id: "contrib:write", label: "contrib:write (Propositions données)" },
              { id: "admin", label: "admin (Super-utilisateur)" },
            ].map((sc) => (
              <button
                key={sc.id}
                type="button"
                onClick={() => toggleScope(sc.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  scopes.includes(sc.id)
                    ? "bg-slate-800 border-slate-600 text-slate-200 font-semibold"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300"
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-sm font-semibold transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{isLoading ? "Génération..." : "Générer la clé API"}</span>
        </button>
      </form>

      {/* Liste des clés générées pendant la session */}
      {keys.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Clés générées lors de cette session
          </h3>
          <div className="space-y-2.5">
            {keys.map((k) => (
              <div
                key={k.key_id}
                className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-100 truncate">{k.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${
                        k.environment === "live"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-sky-500/10 border-sky-500/30 text-sky-400"
                      }`}
                    >
                      {k.environment}
                    </span>
                    <span className="text-xs text-slate-500 font-mono shrink-0">({k.key_id})</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs max-w-full overflow-hidden">
                    <span className="text-slate-300 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 truncate select-all">
                      {showKey[k.key_id] ? k.api_key : `${k.api_key.slice(0, 10)}••••••••••••••••`}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setShowKey((prev) => ({ ...prev, [k.key_id]: !prev[k.key_id] }))
                      }
                      className="p-1.5 text-slate-400 hover:text-slate-200 shrink-0"
                      title={showKey[k.key_id] ? "Masquer" : "Afficher"}
                    >
                      {showKey[k.key_id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(k.api_key, k.key_id)}
                    className="w-full sm:w-auto justify-center flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer min-h-[36px]"
                  >
                    {copiedId === k.key_id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === k.key_id ? "Copié !" : "Copier la clé"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
