"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Receipt, 
  ChevronLeft, 
  Printer, 
  Building2, 
  CheckCircle2, 
  ShieldCheck,
  Download
} from "lucide-react";
import { INVOICE_COUNTRIES } from "@/data/invoiceCountries";

export default function ReceiptGeneratorPage() {
  const [merchantName, setMerchantName] = useState("Wezas Technologies SARL");
  const [selectedCountryCode, setSelectedCountryCode] = useState("CI");
  const [taxId, setTaxId] = useState("1234567 A");
  const [clientName, setClientName] = useState("Société Alpha Partner");
  const [amountHt, setAmountHt] = useState(100000);
  const [applyWht, setApplyWht] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState("01/11/2026");
  const [invoiceYear, setInvoiceYear] = useState("2026");

  const countryConfig = INVOICE_COUNTRIES.find((c) => c.iso2 === selectedCountryCode) || INVOICE_COUNTRIES[0];

  useEffect(() => {
    const now = new Date();
    setInvoiceDate(now.toLocaleDateString("fr-FR"));
    setInvoiceYear(now.getFullYear().toString());
  }, []);

  const handleCountryChange = (newCode: string) => {
    setSelectedCountryCode(newCode);
    const matched = INVOICE_COUNTRIES.find((c) => c.iso2 === newCode);
    if (matched) {
      setTaxId(matched.exampleTaxId);
      if (!matched.hasWht) {
        setApplyWht(false);
      }
    }
  };

  const vatRate = countryConfig.vatRate;
  const vatAmount = Math.round(amountHt * vatRate * 100) / 100;
  const amountTtc = Math.round((amountHt + vatAmount) * 100) / 100;

  const whtRate = countryConfig.whtRate || 0;
  const whtAmount = applyWht && countryConfig.hasWht ? Math.round(amountHt * whtRate * 100) / 100 : 0;
  const netPayable = Math.round((amountTtc - whtAmount) * 100) / 100;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50 print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/outils" className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
            <ChevronLeft className="w-4 h-4 text-amber-400" />
            <span>Tous les micro-outils</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono">
              27+ Juridictions Fiscales
            </span>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer / PDF</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6 py-8">
        <div className="space-y-2 print:hidden">
          <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            <Receipt className="w-4 h-4" />
            Facturation Panafricaine & Conformité Fiscale
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Générateur de Reçus & Factures Conformes Panafricain (27 Pays)
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Émettez des factures conformes aux directives fiscales africaines avec calcul automatique de la TVA locale, 
            identifiant fiscal certifié (NINEA, NCC, IFU, TIN, KRA PIN, ICE), retenue à la source et QR code.
          </p>
        </div>

        {/* Formulaire de configuration (masqué à l'impression) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Nom de votre entreprise :</label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Pays fiscal (27 pays) :</label>
              <select
                value={selectedCountryCode}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-amber-400 cursor-pointer"
              >
                {INVOICE_COUNTRIES.map((c) => (
                  <option key={c.iso2} value={c.iso2}>
                    {c.flag} {c.name} - {c.vatName} ({c.currency})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium truncate block">
                {countryConfig.taxIdLabel} :
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder={countryConfig.exampleTaxId}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs outline-none focus:border-amber-400 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Facturé au client :</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400 font-medium">Montant Hors Taxe (HT en {countryConfig.currency}) :</label>
              <input
                type="number"
                min="100"
                step="100"
                value={amountHt}
                onChange={(e) => setAmountHt(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center gap-2 pt-4 sm:pt-6">
              {countryConfig.hasWht ? (
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={applyWht}
                    onChange={(e) => setApplyWht(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                  />
                  <span>Appliquer {countryConfig.whtLabel || "la retenue WHT"}</span>
                </label>
              ) : (
                <span className="text-[11px] text-slate-500 italic">Pas de retenue BRS standard pour ce pays.</span>
              )}
            </div>
          </div>
        </div>

        {/* Facture Imprimable (Feuille Blanche Professionnelle) */}
        <div className="bg-white text-slate-950 rounded-2xl p-6 sm:p-12 shadow-2xl space-y-6 sm:space-y-8 border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{countryConfig.flag}</span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">{merchantName}</h2>
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {countryConfig.taxIdLabel} : <strong className="font-mono text-slate-900">{taxId}</strong>
              </div>
              <div className="text-xs text-slate-600">
                Législation Fiscale : <strong>{countryConfig.name}</strong> ({countryConfig.currency})
              </div>
            </div>

            <div className="sm:text-right">
              <div className="text-sm font-bold text-amber-600 uppercase font-mono">Facture Officielle</div>
              <div className="text-xs text-slate-500 font-mono">N° FAC-{invoiceYear}-{countryConfig.iso2}-0082</div>
              <div className="text-xs text-slate-500 mt-0.5">Date : {invoiceDate}</div>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Facturé à :</span>
              <div className="font-bold text-sm text-slate-900">{clientName}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Moyen de règlement :</span>
              <div className="font-medium text-slate-900">Virement Bancaire / Mobile Money</div>
            </div>
          </div>

          {/* Tableau de calcul */}
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-2 flex justify-between text-xs font-bold text-slate-500 uppercase">
              <span>Désignation de la prestation / Fourniture</span>
              <span>Montant HT</span>
            </div>

            <div className="flex justify-between text-xs text-slate-800 py-1">
              <span>Prestations de services numériques & intégration fintech ({countryConfig.name})</span>
              <span className="font-mono font-medium">{amountHt.toLocaleString("fr-FR")} {countryConfig.currency}</span>
            </div>
          </div>

          {/* Totaux & Décompositions légales */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`WEZAS_REC_FAC-${invoiceYear}-${countryConfig.iso2}-0082:${netPayable}:${countryConfig.currency}`)}`}
                alt="QR Code de vérification fiscale"
                className="w-20 h-20 rounded border border-slate-300 p-1"
              />
              <div className="text-[10px] text-slate-500 leading-tight">
                QR Code de conformité fiscale {countryConfig.iso2}.<br />Scannez pour vérifier l'authenticité de la facture.
              </div>
            </div>

            <div className="w-full sm:w-72 space-y-1.5 text-xs text-slate-700 font-mono">
              <div className="flex justify-between">
                <span className="font-sans">Montant HT :</span>
                <span>{amountHt.toLocaleString("fr-FR")} {countryConfig.currency}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span className="font-sans">{countryConfig.vatName} :</span>
                <span>+{vatAmount.toLocaleString("fr-FR")} {countryConfig.currency}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span className="font-sans">Total TTC :</span>
                <span>{amountTtc.toLocaleString("fr-FR")} {countryConfig.currency}</span>
              </div>

              {applyWht && whtAmount > 0 && (
                <div className="flex justify-between text-rose-600 pt-1 border-t border-slate-200">
                  <span className="font-sans">{countryConfig.whtLabel || "Retenue WHT"} :</span>
                  <span>-{whtAmount.toLocaleString("fr-FR")} {countryConfig.currency}</span>
                </div>
              )}

              <div className="flex justify-between font-black text-sm text-emerald-800 pt-2 border-t-2 border-slate-900">
                <span className="font-sans">Net à payer :</span>
                <span>{netPayable.toLocaleString("fr-FR")} {countryConfig.currency}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
