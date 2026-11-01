export interface FeeComparisonResult {
  operator: string;
  transferFee: number;
  withdrawalFee: number;
  taxAmount: number;
  taxName?: string;
  totalCost: number;
  netReceived: number;
  color: string;
  badge?: string;
  note: string;
}

export function calculateMobileMoneyFees(
  amount: number,
  country: "SN" | "CI" | "CM" | "GH" | "GA"
): FeeComparisonResult[] {
  const safeAmount = Math.max(0, amount);

  if (country === "SN") {
    // Sénégal (XOF)
    // Wave: 1% transfert, retrait gratuit
    const waveTransfer = Math.round(safeAmount * 0.01);
    const waveWithdraw = 0;
    const waveTotal = waveTransfer + waveWithdraw;

    // Orange Money Sénégal (grille indicative officielle)
    let omTransfer = 0;
    if (safeAmount <= 5000) omTransfer = Math.round(safeAmount * 0.01);
    else if (safeAmount <= 50000) omTransfer = Math.round(safeAmount * 0.012);
    else omTransfer = Math.round(safeAmount * 0.015);
    const omWithdraw = 0; // inclus ou quasi nul en national
    const omTotal = omTransfer + omWithdraw;

    // Free Money
    const freeTransfer = Math.round(safeAmount * 0.008);
    const freeTotal = freeTransfer;

    return [
      {
        operator: "Wave Sénégal",
        transferFee: waveTransfer,
        withdrawalFee: waveWithdraw,
        taxAmount: 0,
        totalCost: waveTotal,
        netReceived: safeAmount,
        color: "from-sky-500 to-sky-600",
        badge: "Recommandé (1% fixe)",
        note: "Retrait gratuit pour le bénéficiaire, transfert facturé 1% à l'expéditeur.",
      },
      {
        operator: "Orange Money Sénégal",
        transferFee: omTransfer,
        withdrawalFee: 0,
        taxAmount: 0,
        totalCost: omTotal,
        netReceived: safeAmount,
        color: "from-orange-500 to-orange-600",
        note: "Réseau le plus étendu de points de distribution au Sénégal.",
      },
      {
        operator: "Free Money Sénégal",
        transferFee: freeTransfer,
        withdrawalFee: 0,
        taxAmount: 0,
        totalCost: freeTotal,
        netReceived: safeAmount,
        color: "from-rose-600 to-rose-700",
        note: "Tarif agressif sur les petits montants.",
      },
    ].sort((a, b) => a.totalCost - b.totalCost);
  }

  if (country === "CI") {
    // Côte d'Ivoire (XOF)
    const waveTransfer = Math.round(safeAmount * 0.01);
    
    // Orange Money CI
    const omTransfer = Math.round(safeAmount * 0.01);
    
    // MTN MoMo CI
    const mtnTransfer = Math.round(safeAmount * 0.01);

    // Moov Money CI
    const moovTransfer = Math.round(safeAmount * 0.009);

    return [
      {
        operator: "Wave Côte d'Ivoire",
        transferFee: waveTransfer,
        withdrawalFee: 0,
        taxAmount: 0,
        totalCost: waveTransfer,
        netReceived: safeAmount,
        color: "from-sky-500 to-sky-600",
        badge: "1% Plafonné",
        note: "Plafond standard à 1% sans frais cachés de retrait.",
      },
      {
        operator: "Orange Money CI",
        transferFee: omTransfer,
        withdrawalFee: 0,
        taxAmount: 0,
        totalCost: omTransfer,
        netReceived: safeAmount,
        color: "from-orange-500 to-orange-600",
        note: "Paiement marchand et retraits DAB partenaires (SGCI, Ecobank).",
      },
      {
        operator: "MTN MoMo CI",
        transferFee: mtnTransfer,
        withdrawalFee: 0,
        taxAmount: 0,
        totalCost: mtnTransfer,
        netReceived: safeAmount,
        color: "from-amber-500 to-amber-600",
        note: "Compatible push USSD direct *133#.",
      },
      {
        operator: "Moov Money CI",
        transferFee: moovTransfer,
        withdrawalFee: 0,
        taxAmount: 0,
        totalCost: moovTransfer,
        netReceived: safeAmount,
        color: "from-blue-600 to-blue-700",
        note: "Taux compétitif sur transferts inter-comptes.",
      },
    ].sort((a, b) => a.totalCost - b.totalCost);
  }

  if (country === "CM") {
    // Cameroun (XAF) + TSTA Taxe Spéciale sur les Transferts d'Argent (0.2%)
    const tstaTax = Math.round(safeAmount * 0.002);

    // Orange Money Cameroun
    let omFee = Math.round(safeAmount * 0.015);
    if (omFee < 50) omFee = 50;

    // MTN MoMo Cameroun
    let mtnFee = Math.round(safeAmount * 0.015);
    if (mtmFee() < 50) mtnFee = 50;

    function mtmFee() { return mtnFee; }

    return [
      {
        operator: "Orange Money Cameroun",
        transferFee: omFee,
        withdrawalFee: 0,
        taxAmount: tstaTax,
        taxName: "TSTA État Cameroun (0.2%)",
        totalCost: omFee + tstaTax,
        netReceived: safeAmount,
        color: "from-orange-500 to-orange-600",
        note: "Inclut la taxe légale obligatoire TSTA prélevée par la DGI Cameroun.",
      },
      {
        operator: "MTN MoMo Cameroun",
        transferFee: mtnFee,
        withdrawalFee: 0,
        taxAmount: tstaTax,
        taxName: "TSTA État Cameroun (0.2%)",
        totalCost: mtnFee + tstaTax,
        netReceived: safeAmount,
        color: "from-amber-500 to-amber-600",
        note: "Compatible réseau national MoMo Pay Cameroun.",
      },
    ].sort((a, b) => a.totalCost - b.totalCost);
  }

  if (country === "GH") {
    // Ghana (GHS) + E-Levy (1% après franchise de 100 GHS)
    const taxableBase = Math.max(0, safeAmount - 100);
    const eLevy = Math.round(taxableBase * 0.01 * 100) / 100;

    const mtnFee = Math.round(safeAmount * 0.0075 * 100) / 100;
    const telecelFee = Math.round(safeAmount * 0.0075 * 100) / 100;

    return [
      {
        operator: "MTN MoMo Ghana",
        transferFee: mtnFee,
        withdrawalFee: 0,
        taxAmount: eLevy,
        taxName: "E-Levy Ghana (1% après 100 GHS)",
        totalCost: Math.round((mtnFee + eLevy) * 100) / 100,
        netReceived: safeAmount,
        color: "from-amber-500 to-amber-600",
        note: "Réseau leader au Ghana, conforme Act 1075 GRA.",
      },
      {
        operator: "Telecel Cash Ghana (ex-Vodafone)",
        transferFee: telecelFee,
        withdrawalFee: 0,
        taxAmount: eLevy,
        taxName: "E-Levy Ghana (1% après 100 GHS)",
        totalCost: Math.round((telecelFee + eLevy) * 100) / 100,
        netReceived: safeAmount,
        color: "from-red-600 to-red-700",
        note: "Intégration directe avec compte bancaire NUBAN GhIPSS.",
      },
    ].sort((a, b) => a.totalCost - b.totalCost);
  }

  // Gabon (GA - XAF)
  const airtelFee = Math.round(safeAmount * 0.018);
  const moovFee = Math.round(safeAmount * 0.018);

  return [
    {
      operator: "Airtel Money Gabon",
      transferFee: airtelFee,
      withdrawalFee: 0,
      taxAmount: 0,
      totalCost: airtelFee,
      netReceived: safeAmount,
      color: "from-red-600 to-red-700",
      note: "Couverture réseau maximale à Libreville, Port-Gentil et Franceville.",
    },
    {
      operator: "Moov Money Gabon",
      transferFee: moovFee,
      withdrawalFee: 0,
      taxAmount: 0,
      totalCost: moovFee,
      netReceived: safeAmount,
      color: "from-blue-600 to-blue-700",
      note: "Interopérable avec les portefeuilles régionaux CEMAC GIMAC.",
    },
  ].sort((a, b) => a.totalCost - b.totalCost);
}
