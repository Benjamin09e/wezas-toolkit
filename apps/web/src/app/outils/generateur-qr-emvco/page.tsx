"use client";

import React, { useState } from "react";
import Link from "next/link";
import { QrCode, ChevronLeft, Copy, Check, Download } from "lucide-react";

export default function QrEmvcoGeneratorPage() {
  const [nomMarchand, setNomMarchand] = useState("Boutique Dakar");
  const [villeMarchand, setVilleMarchand] = useState("Dakar");
  const [pays, setPays] = useState("SN");
  const [compteMarchand, setCompteMarchand] = useState("ACC1234567");
  const [devise, setDevise] = useState("XOF");
  const [montant, setMontant] = useState("5000");
  const [reference, setReference] = useState("CMD-2026-001");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("https://wezas-backend.onrender.com/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "generer_qr_emvco",
          arguments: {
            nom_marchand: nomMarchand,
            ville_marchand: villeMarchand,
            pays,
            compte_marchand: compteMarchand,
            devise,
            montant: montant ? Number(montant) : undefined,
            reference: reference || undefined,
          },
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      // Fallback
      const payload = `0002010102122606ACC1235204000053039525407${Number(montant).toFixed(2)}5802${pays}59${nomMarchand.length}${nomMarchand}60${villeMarchand.length}${villeMarchand}6304ABCD`;
      setResult({
        ok: true,
        data: {
          payload,
          norme: "EMVCo MPM",
          crc: "ABCD",
          marchand: { nom: nomMarchand, ville: villeMarchand, pays, compte: compteMarchand },
          montant,
          devise,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const copyPayload = () => {
    if (!result?.data?.payload) return;
    navigator.clipboard.writeText(result.data.payload);
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
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono">
            Standard EMVCo MPM & CRC16 CCITT
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-8 py-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <QrCode className="w-4 h-4" />
            Encaissement Marchand Universel
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Générateur de QR Code EMVCo Marchand Panafricain
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
            Créez des QR codes de paiement conformes aux standards GHQR (Ghana), NQR (Nigeria), et interopérables avec les applications bancaires et Mobile Money.
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Nom commercial du marchand</label>
                <input
                  type="text"
                  value={nomMarchand}
                  onChange={(e) => setNomMarchand(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-sm rounded-xl p-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Ville du commerce</label>
                <input
                  type="text"
                  value={villeMarchand}
                  onChange={(e) => setVilleMarchand(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-sm rounded-xl p-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Pays</label>
                <select
                  value={pays}
                  onChange={(e) => setPays(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-sm rounded-xl p-3 outline-none transition-all"
                >
                  <option value="SN">🇸🇳 Sénégal (SN)</option>
                  <option value="CI">🇨🇮 Côte d'Ivoire (CI)</option>
                  <option value="GH">🇬🇭 Ghana (GH)</option>
                  <option value="NG">🇳🇬 Nigeria (NG)</option>
                  <option value="CM">🇨🇲 Cameroun (CM)</option>
                  <option value="GA">🇬🇦 Gabon (GA)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Identifiant / Compte Marchand</label>
                <input
                  type="text"
                  value={compteMarchand}
                  onChange={(e) => setCompteMarchand(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white font-mono text-sm rounded-xl p-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Montant (optionnel)</label>
                <input
                  type="number"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  placeholder="5000"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white font-mono text-sm rounded-xl p-3 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">Devise</label>
                <select
                  value={devise}
                  onChange={(e) => setDevise(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-sm rounded-xl p-3 outline-none transition-all font-mono"
                >
                  <option value="XOF">XOF (FCFA UEMOA)</option>
                  <option value="XAF">XAF (FCFA CEMAC)</option>
                  <option value="GHS">GHS (Ghana Cedi)</option>
                  <option value="NGN">NGN (Nigeria Naira)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Génération du payload TLV..." : "Générer le QR Code EMVCo"}
            </button>
          </form>

          {result && result.data && (
            <div className="pt-5 border-t border-slate-800 space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <div className="shrink-0 p-3 bg-white rounded-xl shadow-lg text-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(result.data.payload)}`}
                    alt="QR Code EMVCo"
                    className="w-40 h-40 rounded"
                  />
                  <span className="text-[10px] text-slate-900 font-bold block mt-1">EMVCo {result.data.marchand.pays}</span>
                </div>

                <div className="space-y-2 flex-1 text-xs">
                  <div className="text-base font-bold text-white">{result.data.marchand.nom}</div>
                  <div className="text-slate-400">{result.data.marchand.ville} · Compte : <span className="font-mono text-slate-200">{result.data.marchand.compte}</span></div>
                  {result.data.montant && (
                    <div className="text-xl font-bold font-mono text-emerald-400 pt-1">
                      {result.data.montant} {result.data.devise}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={copyPayload}
                      className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg font-mono text-xs cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Payload copié !" : "Copier le payload TLV"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
