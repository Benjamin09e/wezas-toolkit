import React, { useState } from "react";
import { wezas } from "wezas-africa-toolkit";

export interface AfricaCheckoutWidgetProps {
  amount: number;
  currency?: string;
  country?: string;
  recipientPhone?: string;
  reference?: string;
  onSuccess?: (details: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

export function AfricaCheckoutWidget({
  amount,
  currency = "XOF",
  country = "SN",
  recipientPhone = "",
  reference,
  onSuccess,
  onError,
  className = "",
}: AfricaCheckoutWidgetProps) {
  const [selectedMethod, setSelectedMethod] = useState<"wave" | "orange" | "mtn" | "card">("wave");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const opName =
        selectedMethod === "wave"
          ? "Wave"
          : selectedMethod === "orange"
          ? "Orange Money"
          : "MTN MoMo";

      const orderRef = reference || `CMD-${Date.now()}`;

      if (selectedMethod === "card") {
        // Simulation validation carte locale GIMAC / Verve
        setTimeout(() => {
          setLoading(false);
          setSuccess(true);
          onSuccess?.({ method: "card", amount, currency, reference: orderRef });
        }, 1200);
        return;
      }

      const res = await wezas.genererPaiementMobileMoney(
        opName,
        recipientPhone || "770000000",
        amount,
        country,
        orderRef
      );

      setLoading(false);

      if (res.ok && res.data) {
        setSuccess(true);
        onSuccess?.(res.data);
        if (res.data.deeplink && typeof window !== "undefined") {
          window.location.href = res.data.deeplink;
        }
      } else {
        onError?.(res.error);
      }
    } catch (err) {
      setLoading(false);
      onError?.(err);
    }
  };

  return (
    <div className={`bg-slate-950 p-5 sm:p-6 rounded-2xl border border-slate-800 text-white space-y-5 ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <span className="text-xs text-slate-400">Total à régler</span>
          <div className="text-2xl font-black font-mono text-white">
            {amount.toLocaleString("fr-FR")} <span className="text-amber-400 text-lg">{currency}</span>
          </div>
        </div>
        <span className="text-[10px] bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-full font-mono text-slate-300">
          Zone {country}
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-400 font-medium block">Moyen de règlement :</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => setSelectedMethod("wave")}
            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
              selectedMethod === "wave"
                ? "bg-sky-500/20 border-sky-500 text-white shadow-lg shadow-sky-500/10"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <div className="text-xs font-bold">Wave</div>
            <div className="text-[10px] opacity-70">App Direct</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod("orange")}
            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
              selectedMethod === "orange"
                ? "bg-orange-500/20 border-orange-500 text-white shadow-lg shadow-orange-500/10"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <div className="text-xs font-bold">Orange</div>
            <div className="text-[10px] opacity-70">Push USSD</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod("mtn")}
            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
              selectedMethod === "mtn"
                ? "bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <div className="text-xs font-bold">MTN MoMo</div>
            <div className="text-[10px] opacity-70">Direct OTP</div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod("card")}
            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
              selectedMethod === "card"
                ? "bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <div className="text-xs font-bold">GIMAC / Verve</div>
            <div className="text-[10px] opacity-70">Cartes Locales</div>
          </button>
        </div>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handlePay}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <span>Initialisation sécurisée...</span>
        ) : success ? (
          <span>✓ Paiement Validé !</span>
        ) : (
          <span>Payer {amount.toLocaleString("fr-FR")} {currency} avec {selectedMethod.toUpperCase()}</span>
        )}
      </button>
    </div>
  );
}
