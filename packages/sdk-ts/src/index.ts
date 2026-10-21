/**
 * Client officiel Wezas Africa Toolkit pour TypeScript / Node.js / Navigateur.
 */

import {
  Envelope,
  PhoneValidationData,
  CurrencyConversionData,
  VatCalculationData,
  AmountFormatData,
  CountryInfoData,
  OperatorsListData,
} from "./types.js";
import { formatAmountOffline, FIXED_PARITY } from "./offline.js";

export * from "./types.js";
export { formatAmountOffline, FIXED_PARITY };

export interface WezasClientConfig {
  baseUrl?: string;
  fetch?: typeof fetch;
}

export class WezasClient {
  private baseUrl: string;
  private customFetch: typeof fetch;

  constructor(config?: WezasClientConfig) {
    this.baseUrl = (config?.baseUrl || "https://wezas-backend.onrender.com").replace(/\/$/, "");
    this.customFetch = config?.fetch || (typeof fetch !== "undefined" ? fetch.bind(globalThis) : (null as any));
  }

  private async call<T>(tool: string, args: Record<string, any>): Promise<Envelope<T>> {
    if (!this.customFetch) {
      throw new Error("Environnement fetch non disponible. Passez une implémentation fetch dans la configuration.");
    }

    const response = await this.customFetch(`${this.baseUrl}/api/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool, arguments: args }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        ok: false,
        data: null,
        error: {
          code: `HTTP_${response.status}`,
          message: {
            fr: `Erreur API (${response.status}) : ${errText}`,
            en: `API Error (${response.status}): ${errText}`,
          },
        },
      };
    }

    return await response.json();
  }

  /**
   * Valide un numéro de téléphone africain et identifie l'opérateur et les services Mobile Money.
   */
  async validerTelephone(pays: string, numero: string): Promise<Envelope<PhoneValidationData>> {
    return this.call<PhoneValidationData>("valider_telephone", { pays, numero });
  }

  /**
   * Convertit un montant entre devises (XAF, XOF, EUR, USD).
   */
  async convertirDevise(
    montant: number | string,
    de: string,
    vers: string,
    taux?: number | string
  ): Promise<Envelope<CurrencyConversionData>> {
    return this.call<CurrencyConversionData>("convertir_devise", { montant, de, vers, taux });
  }

  /**
   * Récupère les données d'un pays : indicatif, devise, langues et jours fériés légaux.
   */
  async infoPays(pays: string, annee?: number): Promise<Envelope<CountryInfoData>> {
    return this.call<CountryInfoData>("info_pays", { pays, annee });
  }

  /**
   * Formate un montant selon les règles locales africaines.
   */
  async formaterMontant(
    montant: number | string,
    options?: { devise?: string; pays?: string; inclure_symbole?: boolean; decimales?: number }
  ): Promise<Envelope<AmountFormatData>> {
    return this.call<AmountFormatData>("formater_montant", { montant, ...options });
  }

  /**
   * Calcule la TVA (mode HT -> TTC ou TTC -> HT) selon les taux officiels du pays.
   */
  async calculerTva(
    montant: number | string,
    pays: string,
    options?: { mode?: "ht" | "ttc"; type_taux?: "standard" | "reduit" | "super_reduit"; taux_personnalise?: number | string }
  ): Promise<Envelope<VatCalculationData>> {
    return this.call<VatCalculationData>("calculer_tva", { montant, pays, ...options });
  }

  /**
   * Liste les opérateurs télécoms et leurs compatibilités Mobile Money.
   */
  async listerOperateurs(pays?: string, avecMobileMoneySeulement?: boolean): Promise<Envelope<OperatorsListData>> {
    return this.call<OperatorsListData>("lister_operateurs", {
      pays,
      avec_mobile_money_seulement: avecMobileMoneySeulement,
    });
  }
}

/**
 * Instance par défaut
 */
export const wezas = new WezasClient();
