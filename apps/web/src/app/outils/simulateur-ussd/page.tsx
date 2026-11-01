"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Smartphone, 
  ChevronLeft, 
  Play, 
  RotateCcw, 
  Check, 
  Copy, 
  AlertCircle, 
  CheckCircle2, 
  Code2, 
  Terminal,
  Zap
} from "lucide-react";

export default function UssdSimulatorPage() {
  const [operator, setOperator] = useState<"orange" | "mtn" | "wave">("orange");
  const [amount, setAmount] = useState(5000);
  const [phone, setPhone] = useState("+225 07 08 12 34 56");
  const [merchant, setMerchant] = useState("Wezas Store");
  const [ussdStep, setUssdStep] = useState<"idle" | "prompt" | "pin" | "success" | "error">("idle");
  const [pinInput, setPinInput] = useState("");
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [timestamp, setTimestamp] = useState("2026-11-01T12:00:00.000Z");
  const [txId, setTxId] = useState("tx_demo123456");

  React.useEffect(() => {
    setTimestamp(new Date().toISOString());
    setTxId("tx_" + Date.now().toString(36));
  }, [ussdStep]);

  const startUssd = () => {
    setUssdStep("prompt");
    setPinInput("");
  };

  const confirmPrompt = () => {
    setUssdStep("pin");
  };

  const validatePin = () => {
    if (pinInput === "1234") {
      setUssdStep("success");
    } else {
      setUssdStep("error");
    }
  };

  const resetFlow = () => {
    setUssdStep("idle");
    setPinInput("");
  };

  const mockWebhookPayload = {
    event: ussdStep === "success" ? "payment.succeeded" : "payment.failed",
    timestamp: timestamp,
    transaction_id: txId,
    status: ussdStep === "success" ? "COMPLETED" : "FAILED",
    amount: amount,
    currency: "XOF",
    customer: {
      phone: phone.replace(/\s+/g, ""),
      operator: operator.toUpperCase(),
    },
    merchant: {
      name: merchant,
      reference: "ORDER-9982",
    },
    metadata: {
      channel: "USSD_PUSH",
      ussd_code: operator === "orange" ? "#144#" : operator === "mtn" ? "*133#" : "DEEP_LINK",
    },
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(JSON.stringify(mockWebhookPayload, null, 2));
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/outils" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <ChevronLeft className="w-4 h-4 text-amber-400" />
            <span>Tous les micro-outils</span>
          </Link>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono">
            Mode Bac à Sable Développeur
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-8 py-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <Smartphone className="w-4 h-4" />
            Studio Mobile Money Interactif
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Simulateur USSD Push & Bac à Sable Webhooks
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Testez l'expérience utilisateur d'un débit USSD en direct sur un faux smartphone et générez le payload de webhook associé sans consommer de crédit réel.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Colonne Gauche : Configuration */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Paramètres de la simulation</h2>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Réseau opérateur :</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setOperator("orange"); resetFlow(); }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      operator === "orange" ? "bg-orange-500/20 border-orange-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="text-xs font-bold">Orange (#144#)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOperator("mtn"); resetFlow(); }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      operator === "mtn" ? "bg-amber-500/20 border-amber-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="text-xs font-bold">MTN (*133#)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOperator("wave"); resetFlow(); }}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      operator === "wave" ? "bg-sky-500/20 border-sky-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="text-xs font-bold">Wave App</div>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Montant (XOF) :</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-sm outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium">Numéro client simulé :</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-sm outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="button"
                onClick={startUssd}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Déclencher le Push USSD sur le Smartphone</span>
              </button>
            </div>

            {/* Webhook Payload JSON */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-amber-400" /> Webhook Callback Généré
                </span>
                <button
                  type="button"
                  onClick={copyWebhook}
                  className="text-xs text-amber-400 hover:text-white flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 cursor-pointer"
                >
                  {copiedWebhook ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedWebhook ? "Copié !" : "Copier le JSON"}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-950 rounded-xl text-[10px] sm:text-xs font-mono text-slate-300 overflow-x-auto max-h-[220px] leading-relaxed border border-slate-800">
                <code>{JSON.stringify(mockWebhookPayload, null, 2)}</code>
              </pre>
            </div>
          </div>

          {/* Colonne Droite : Simulateur Écran Smartphone */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-[300px] h-[580px] bg-slate-900 border-4 border-slate-700 rounded-[40px] shadow-2xl p-3 flex flex-col justify-between overflow-hidden">
              {/* Encoche haut */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-10 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
              </div>

              {/* Écran intérieur */}
              <div className="relative flex-1 bg-slate-950 rounded-[30px] pt-8 px-4 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pb-2 border-b border-slate-800">
                  <span>9:41</span>
                  <span>4G LTE · 98%</span>
                </div>

                {/* État USSD */}
                <div className="my-auto space-y-4">
                  {ussdStep === "idle" && (
                    <div className="text-center space-y-2 text-slate-500 py-12">
                      <Smartphone className="w-10 h-10 mx-auto text-slate-700 animate-pulse" />
                      <div className="text-xs font-medium">En attente de transaction...</div>
                      <div className="text-[10px]">Cliquez sur "Déclencher le Push" à gauche.</div>
                    </div>
                  )}

                  {ussdStep === "prompt" && (
                    <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-4 space-y-3 shadow-xl animate-in zoom-in-95 duration-200">
                      <div className="text-[11px] font-mono text-amber-400 font-bold uppercase">
                        {operator === "orange" ? "Orange Money Prompt" : "MTN MoMo Prompt"}
                      </div>
                      <div className="text-xs text-white leading-relaxed">
                        Autorisez-vous le paiement de <strong className="text-amber-400">{amount} XOF</strong> à <strong>{merchant}</strong> ?
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={resetFlow}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-xs py-2 rounded-lg text-slate-300 font-medium"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={confirmPrompt}
                          className="flex-1 bg-amber-500 hover:bg-amber-400 text-xs py-2 rounded-lg text-slate-950 font-bold"
                        >
                          1 - Valider
                        </button>
                      </div>
                    </div>
                  )}

                  {ussdStep === "pin" && (
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 space-y-3 shadow-xl animate-in zoom-in-95 duration-200">
                      <div className="text-[11px] font-mono text-slate-300 font-bold">
                        Entrez votre Code Secret :
                      </div>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="Tapez 1234"
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-center text-lg font-mono tracking-widest text-white rounded-lg p-2 outline-none focus:border-amber-400"
                      />
                      <span className="text-[9px] text-slate-500 block text-center">(Code de test : 1234)</span>
                      <button
                        onClick={validatePin}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-xs py-2 rounded-lg text-slate-950 font-bold"
                      >
                        Confirmer le Débit
                      </button>
                    </div>
                  )}

                  {ussdStep === "success" && (
                    <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-2 animate-in zoom-in-95 duration-200">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                      <div className="text-xs font-bold text-white">Paiement Réussi !</div>
                      <div className="text-[10px] text-slate-300">
                        {amount} XOF ont été débités avec succès.
                      </div>
                      <button
                        onClick={resetFlow}
                        className="text-[10px] text-emerald-300 hover:underline pt-2 inline-block"
                      >
                        Nouvelle simulation
                      </button>
                    </div>
                  )}

                  {ussdStep === "error" && (
                    <div className="bg-rose-500/10 border border-rose-500/40 rounded-2xl p-4 text-center space-y-2 animate-in zoom-in-95 duration-200">
                      <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                      <div className="text-xs font-bold text-white">Code PIN Incorrect</div>
                      <div className="text-[10px] text-slate-300">Transaction refusée par l'opérateur.</div>
                      <button
                        onClick={resetFlow}
                        className="text-[10px] text-rose-300 hover:underline pt-2 inline-block"
                      >
                        Réessayer
                      </button>
                    </div>
                  )}
                </div>

                {/* Barre bas smartphone */}
                <div className="pb-3 text-center">
                  <div className="w-24 h-1 bg-slate-800 mx-auto rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
