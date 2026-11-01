"use client";

import React, { useState } from "react";
import { 
  Phone, 
  Check, 
  Copy, 
  Smartphone, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  ArrowRight,
  ExternalLink,
  Code2,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { SUPPORTED_COUNTRIES } from "@/data/countries";

export function ComponentsShowcase() {
  const [activeTab, setActiveTab] = useState<"phone" | "checkout">("phone");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // État du simulateur Phone Input
  const [selectedCountry, setSelectedCountry] = useState("CI");
  const [phoneNumber, setPhoneNumber] = useState("07 08 12 34 56");
  
  // État du simulateur Checkout
  const [checkoutAmount, setCheckoutAmount] = useState(5000);
  const [checkoutCountry, setCheckoutCountry] = useState("SN");
  const [checkoutOperator, setCheckoutOperator] = useState<"wave" | "orange" | "mtn" | "card">("wave");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const countryData = SUPPORTED_COUNTRIES.find((c) => c.iso2 === selectedCountry) || SUPPORTED_COUNTRIES[0];

  // Détection intelligente de l'opérateur en temps réel
  const detectOperator = (num: string, iso2: string) => {
    const clean = num.replace(/\D/g, "");
    if (iso2 === "CI") {
      if (clean.startsWith("07") || clean.startsWith("77")) return { name: "Orange CI", color: "bg-orange-500", text: "text-orange-400", wallet: "Orange Money" };
      if (clean.startsWith("05") || clean.startsWith("75")) return { name: "MTN CI", color: "bg-amber-500", text: "text-amber-400", wallet: "MTN MoMo" };
      if (clean.startsWith("01") || clean.startsWith("71")) return { name: "Moov CI", color: "bg-blue-600", text: "text-blue-400", wallet: "Moov Money" };
      if (clean.startsWith("08")) return { name: "Wave CI", color: "bg-sky-500", text: "text-sky-400", wallet: "Wave" };
    }
    if (iso2 === "SN") {
      if (clean.startsWith("77") || clean.startsWith("78")) return { name: "Orange SN", color: "bg-orange-500", text: "text-orange-400", wallet: "Orange Money" };
      if (clean.startsWith("76")) return { name: "Free SN", color: "bg-rose-600", text: "text-rose-400", wallet: "Free Money" };
      if (clean.startsWith("70") || clean.startsWith("75")) return { name: "Expresso SN", color: "bg-indigo-600", text: "text-indigo-400", wallet: "E-Money" };
      return { name: "Wave SN Compatible", color: "bg-sky-500", text: "text-sky-400", wallet: "Wave" };
    }
    if (iso2 === "CM") {
      if (clean.startsWith("69") || clean.startsWith("655")) return { name: "Orange Cameroun", color: "bg-orange-500", text: "text-orange-400", wallet: "Orange Money" };
      if (clean.startsWith("67") || clean.startsWith("68")) return { name: "MTN Cameroun", color: "bg-amber-500", text: "text-amber-400", wallet: "MTN MoMo" };
    }
    if (iso2 === "GA") {
      if (clean.startsWith("74") || clean.startsWith("77")) return { name: "Airtel Gabon", color: "bg-red-600", text: "text-red-400", wallet: "Airtel Money" };
      if (clean.startsWith("62") || clean.startsWith("66")) return { name: "Moov Gabon", color: "bg-blue-600", text: "text-blue-400", wallet: "Moov Money" };
    }
    return { name: "Opérateur Réseau Détecté", color: "bg-emerald-600", text: "text-emerald-400", wallet: "Mobile Money" };
  };

  const detectedOp = detectOperator(phoneNumber, selectedCountry);

  const copySnippet = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const phoneInputReactCode = `import React, { useState } from "react";
import { wezas } from "wezas-africa-toolkit";

export function AfricaPhoneInput({ onValidNumber }: { onValidNumber?: (res: any) => void }) {
  const [country, setCountry] = useState("CI");
  const [phone, setPhone] = useState("");
  const [carrier, setCarrier] = useState<string | null>(null);

  const handleChange = async (val: string) => {
    setPhone(val);
    if (val.replace(/\\D/g, "").length >= 8) {
      const check = await wezas.validerTelephone(country, val);
      if (check.ok && check.data?.valide) {
        setCarrier(check.data.operateur?.nom || "Détecté");
        onValidNumber?.(check.data);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-700">
      <select 
        value={country} 
        onChange={(e) => setCountry(e.target.value)}
        className="bg-transparent font-medium text-white px-2 py-1 outline-none"
      >
        <option value="CI">🇨🇮 +225</option>
        <option value="SN">🇸🇳 +221</option>
        <option value="CM">🇨🇲 +237</option>
        <option value="GA">🇬🇦 +241</option>
      </select>
      <input
        type="tel"
        value={phone}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Numéro national"
        className="bg-transparent flex-1 text-white placeholder-slate-500 outline-none"
      />
      {carrier && (
        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-medium">
          {carrier}
        </span>
      )}
    </div>
  );
}`;

  const checkoutReactCode = `import React from "react";
import { wezas } from "wezas-africa-toolkit";

export function AfricaCheckoutWidget({ amount, currency, phone }: { amount: number; currency: string; phone: string }) {
  const handlePay = async (provider: "wave" | "orange" | "mtn") => {
    const res = await wezas.genererPaiementMobileMoney(
      provider === "wave" ? "Wave" : provider === "orange" ? "Orange Money" : "MTN MoMo",
      phone,
      amount,
      "SN",
      "CMD-" + Date.now()
    );
    if (res.ok && res.data?.deeplink) {
      window.location.href = res.data.deeplink;
    }
  };

  return (
    <div className="space-y-3 bg-slate-950 p-6 rounded-2xl border border-slate-800 text-white">
      <div className="text-xl font-bold">{amount} {currency}</div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => handlePay("wave")} className="bg-sky-500 hover:bg-sky-400 text-white font-bold py-3 rounded-xl">
          Payer par Wave
        </button>
        <button onClick={() => handlePay("orange")} className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl">
          Orange Money
        </button>
      </div>
    </div>
  );
}`;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setCheckoutSuccess(false);
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutSuccess(true);
      setTimeout(() => setCheckoutSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3.5 sm:p-6 space-y-5 sm:space-y-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-slate-800 pb-4 sm:pb-5">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5 sm:gap-2">
                <span>Composants Frontend</span>
                <span className="text-[9px] sm:text-[10px] bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Nouveau
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Composants React / Tailwind prêts à copier-coller pour intégrer les paiements africains.
              </p>
            </div>
          </div>
        </div>

        {/* Onglets de navigation */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab("phone")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-h-[36px] cursor-pointer ${
              activeTab === "phone"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>&lt;AfricaPhoneInput /&gt;</span>
          </button>
          <button
            onClick={() => setActiveTab("checkout")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap min-h-[36px] cursor-pointer ${
              activeTab === "checkout"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>&lt;CheckoutWidget /&gt;</span>
          </button>
        </div>
      </div>

      {activeTab === "phone" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Simulateur interactif */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-4">
            <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Aperçu Interactif en Direct</span>
              <span className="text-emerald-400 text-[10px] sm:text-[11px] font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Détection Réseau Active
              </span>
            </div>

            <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-inner space-y-4">
              <label className="text-xs text-slate-300 font-medium block">
                Numéro de téléphone destinataire / client :
              </label>

              {/* Champ interactif mobile-friendly */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-900 border-2 border-amber-500/50 rounded-xl p-2 sm:p-2.5 focus-within:border-amber-400 transition-all shadow-lg">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="bg-slate-950 text-white font-medium text-xs sm:text-sm px-2.5 py-2 rounded-lg border border-slate-700 outline-none cursor-pointer w-full sm:w-auto"
                >
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <option key={c.iso2} value={c.iso2}>
                      {c.flag} {c.dialCode} ({c.name})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Ex: 07 08 12 34 56"
                    className="bg-transparent flex-1 text-white font-mono text-sm sm:text-base outline-none placeholder-slate-500 min-w-0 px-1 py-1"
                  />

                  <div className="shrink-0 flex items-center">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md text-white ${detectedOp.color} shadow-sm whitespace-nowrap`}>
                      {detectedOp.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Carte d'information temps réel */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Format International :</span>
                  <span className="font-mono text-amber-300 font-bold truncate ml-2">
                    {countryData.dialCode} {phoneNumber.replace(/\s+/g, "")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Portefeuille Mobile Money :</span>
                  <span className="text-emerald-400 font-semibold">{detectedOp.wallet}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Statut de conformité :</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> E.164 Valide
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Snippet de code React */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-amber-400" /> Code React / Tailwind
              </span>
              <button
                onClick={() => copySnippet(phoneInputReactCode, "phone-code")}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 transition-all cursor-pointer min-h-[32px]"
              >
                {copiedCode === "phone-code" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le composant</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <pre className="p-3 sm:p-4 text-[10px] sm:text-xs font-mono text-slate-300 overflow-x-auto max-h-[260px] sm:max-h-[290px] leading-relaxed">
                <code>{phoneInputReactCode}</code>
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Simulateur de Checkout Hybride */}
          <div className="lg:col-span-6 space-y-3 sm:space-y-4">
            <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Checkout Hybride (Mobile Money & Cartes)</span>
              <span className="text-amber-400 text-[10px] sm:text-[11px] font-mono">Prêt pour Production</span>
            </div>

            <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-inner space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-[11px] text-slate-400">Total à régler</div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-white">
                    {checkoutAmount.toLocaleString("fr-FR")} <span className="text-amber-400 text-base sm:text-lg">XOF</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">Pays</span>
                  <select
                    value={checkoutCountry}
                    onChange={(e) => setCheckoutCountry(e.target.value)}
                    className="bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded px-2 py-1 outline-none"
                  >
                    <option value="SN">🇸🇳 Sénégal</option>
                    <option value="CI">🇨🇮 Côte d'Ivoire</option>
                    <option value="CM">🇨🇲 Cameroun</option>
                    <option value="GA">🇬🇦 Gabon</option>
                  </select>
                </div>
              </div>

              {/* Sélection du moyen de paiement */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium">Choisissez le mode d'encaissement :</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setCheckoutOperator("wave")}
                    className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer min-h-[50px] ${
                      checkoutOperator === "wave"
                        ? "bg-sky-500/20 border-sky-500 text-white shadow-lg shadow-sky-500/10"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-bold">Wave</div>
                    <div className="text-[10px] opacity-70">Deep link</div>
                  </button>

                  <button
                    onClick={() => setCheckoutOperator("orange")}
                    className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer min-h-[50px] ${
                      checkoutOperator === "orange"
                        ? "bg-orange-500/20 border-orange-500 text-white shadow-lg shadow-orange-500/10"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-bold">Orange</div>
                    <div className="text-[10px] opacity-70">Push USSD</div>
                  </button>

                  <button
                    onClick={() => setCheckoutOperator("mtn")}
                    className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer min-h-[50px] ${
                      checkoutOperator === "mtn"
                        ? "bg-amber-500/20 border-amber-500 text-white shadow-lg shadow-amber-500/10"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-bold">MTN MoMo</div>
                    <div className="text-[10px] opacity-70">Direct OTP</div>
                  </button>

                  <button
                    onClick={() => setCheckoutOperator("card")}
                    className={`p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer min-h-[50px] ${
                      checkoutOperator === "card"
                        ? "bg-emerald-500/20 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="text-xs font-bold">GIMAC / Verve</div>
                    <div className="text-[10px] opacity-70">Cartes Locales</div>
                  </button>
                </div>
              </div>

              {/* Rendu dynamique : Bouton de paiement */}
              <div className="pt-1">
                <button
                  onClick={handleSimulatePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm min-h-[44px]"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 animate-spin" />
                      Traitement sécurisé en cours...
                    </span>
                  ) : checkoutSuccess ? (
                    <span className="flex items-center gap-2 text-emerald-950 font-black">
                      <CheckCircle2 className="w-5 h-5 text-emerald-950" />
                      Paiement Confirmé !
                    </span>
                  ) : (
                    <span>
                      Régler {checkoutAmount.toLocaleString("fr-FR")} XOF avec {checkoutOperator.toUpperCase()}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Snippet de code React */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-amber-400" /> Intégration React
              </span>
              <button
                onClick={() => copySnippet(checkoutReactCode, "checkout-code")}
                className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 transition-all cursor-pointer min-h-[32px]"
              >
                {copiedCode === "checkout-code" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le composant</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <pre className="p-3 sm:p-4 text-[10px] sm:text-xs font-mono text-slate-300 overflow-x-auto max-h-[260px] sm:max-h-[290px] leading-relaxed">
                <code>{checkoutReactCode}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
