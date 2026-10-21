/**
 * Fonctions locales pures (hors ligne / calculs déterministes côté client ou Node.js)
 */

import { Envelope, AmountFormatData } from "./types.js";

const DEFAULT_CURRENCIES: Record<string, any> = {
  XAF: { symbole: "FCFA", position: "apres", decimales: 0, sepMilliers: " ", sepDec: "," },
  XOF: { symbole: "FCFA", position: "apres", decimales: 0, sepMilliers: " ", sepDec: "," },
  EUR: { symbole: "€", position: "apres", decimales: 2, sepMilliers: " ", sepDec: "," },
  USD: { symbole: "$", position: "avant", decimales: 2, sepMilliers: ",", sepDec: "." },
};

/**
 * Formate un montant en local selon les règles bancaires et monétaires africaines.
 */
export function formatAmountOffline(
  amount: number | string,
  devise: "XAF" | "XOF" | "EUR" | "USD" = "XAF",
  inclureSymbole: boolean = true
): Envelope<AmountFormatData> {
  const num = typeof amount === "number" ? amount : parseFloat(String(amount).replace(/\s/g, ""));
  if (isNaN(num)) {
    return {
      ok: false,
      data: null,
      error: {
        code: "MONTANT_INVALIDE",
        message: {
          fr: `Montant illisible : « ${amount} ».`,
          en: `Unreadable amount: "${amount}".`,
        },
      },
    };
  }

  const cfg = DEFAULT_CURRENCIES[devise] || DEFAULT_CURRENCIES.XAF;
  const fixed = num.toFixed(cfg.decimales);
  const [intPart, decPart] = fixed.split(".");

  // Groupement par milliers
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, cfg.sepMilliers);
  const numberStr = decPart ? `${formattedInt}${cfg.sepDec}${decPart}` : formattedInt;

  let formatted = numberStr;
  if (inclureSymbole) {
    formatted = cfg.position === "avant" ? `${cfg.symbole}${numberStr}` : `${numberStr} ${cfg.symbole}`;
  }

  return {
    ok: true,
    data: {
      montant_brut: String(num),
      montant_formate: formatted,
      devise,
      symbole: cfg.symbole,
      decimales: cfg.decimales,
    },
    source: "@wezas/toolkit local rules",
    confiance: "haute",
  };
}

/**
 * Taux fixes officiels de la coopération monétaire zone franc
 */
export const FIXED_PARITY = {
  EUR_TO_XAF: 655.957,
  EUR_TO_XOF: 655.957,
  XAF_TO_EUR: 1 / 655.957,
  XOF_TO_EUR: 1 / 655.957,
  XAF_TO_XOF: 1.0,
  XOF_TO_XAF: 1.0,
};
