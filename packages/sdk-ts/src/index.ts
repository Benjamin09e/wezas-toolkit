/**
 * Client officiel Wezas Africa Toolkit pour TypeScript / Node.js / Navigateur.
 */

import {
  Envelope,
  PhoneValidationData,
  CurrencyConversionData,
  VatCalculationData,
  TransactionTaxData,
  AmountFormatData,
  CountryInfoData,
  OperatorsListData,
  TaxIdValidationData,
  PaymentPayloadData,
  RibValidationData,
  NubanValidationData,
  IbanValidationData,
  CardValidationData,
  EmvQrData,
  DecodedQrData,
} from "./types.js";
import { formatAmountOffline, FIXED_PARITY } from "./offline.js";

export * from "./types.js";
export { formatAmountOffline, FIXED_PARITY };

export interface WezasClientConfig {
  baseUrl?: string;
  apiKey?: string;
  fetch?: typeof fetch;
}

export class WezasClient {
  private baseUrl: string;
  private apiKey?: string;
  private customFetch: typeof fetch;

  constructor(config?: WezasClientConfig) {
    this.baseUrl = (config?.baseUrl || "https://wezas-backend.onrender.com").replace(/\/$/, "");
    this.apiKey = config?.apiKey;
    this.customFetch = config?.fetch || (typeof fetch !== "undefined" ? fetch.bind(globalThis) : (null as any));
  }

  private async call<T>(tool: string, args: Record<string, any>): Promise<Envelope<T>> {
    if (!this.customFetch) {
      throw new Error("Environnement fetch non disponible. Passez une implémentation fetch dans la configuration.");
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.apiKey) {
      headers["X-API-Key"] = this.apiKey;
    }

    const response = await this.customFetch(`${this.baseUrl}/api/execute`, {
      method: "POST",
      headers,
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
   * Calcule les taxes transactionnelles (E-Levy Ghana, TSTA Cameroun, EMTL Nigeria)
   * et retenues à la source (BRS Côte d'Ivoire / Sénégal, WHT, Digital Service Tax Kenya).
   */
  async calculerTaxeTransaction(
    pays: string,
    montant: number | string,
    options?: { type_taxe?: string; cumul_journalier_precedent?: number | string }
  ): Promise<Envelope<TransactionTaxData>> {
    return this.call<TransactionTaxData>("calculer_taxe_transaction", {
      pays,
      montant,
      type_taxe: options?.type_taxe,
      cumul_journalier_precedent: options?.cumul_journalier_precedent,
    });
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

  /**
   * Valide et normalise un numéro d'identifiant fiscal d'entreprise (NCC, NINEA, NIU, NIF, KRA PIN, TIN).
   */
  async validerIdentifiantFiscal(pays: string, identifiant: string): Promise<Envelope<TaxIdValidationData>> {
    return this.call<TaxIdValidationData>("valider_identifiant_fiscal", { pays, identifiant });
  }

  /**
   * Génère un lien profond, un code USSD et un QR payload pour déclencher un paiement Mobile Money.
   */
  async genererPaiementMobileMoney(
    operateur: string,
    telephone: string,
    montant: number | string,
    pays: string,
    reference?: string
  ): Promise<Envelope<PaymentPayloadData>> {
    return this.call<PaymentPayloadData>("generer_paiement_mobile_money", {
      operateur,
      telephone,
      montant,
      pays,
      reference,
    });
  }

  /**
   * Valide et décode les composantes d'un RIB bancaire (UEMOA / CEMAC).
   */
  async validerRib(
    codeBanque: string,
    codeGuichet: string,
    numeroCompte: string,
    cleRib: string
  ): Promise<Envelope<RibValidationData>> {
    return this.call<RibValidationData>("valider_rib", {
      code_banque: codeBanque,
      code_guichet: codeGuichet,
      numero_compte: numeroCompte,
      cle_rib: cleRib,
    });
  }

  /**
   * Valide un numéro de compte NUBAN à 10 chiffres (Nigeria / Ghana).
   */
  async validerNuban(
    codeBanque: string,
    numeroCompte: string,
    pays: string = "NG"
  ): Promise<Envelope<NubanValidationData>> {
    return this.call<NubanValidationData>("valider_nuban", {
      code_banque: codeBanque,
      numero_compte: numeroCompte,
      pays,
    });
  }

  /**
   * Valide et extrait les composants d'un IBAN pour les pays africains (ISO 13616).
   */
  async validerIban(
    iban: string
  ): Promise<Envelope<IbanValidationData>> {
    return this.call<IbanValidationData>("valider_iban_afrique", {
      iban,
    });
  }

  /**
   * Valide un numéro de carte bancaire (PAN), identifie le réseau émetteur
   * (GIMAC, GIM-UEMOA, Verve, Visa, Mastercard) et applique l'algorithme Luhn.
   */
  async validerCarte(
    numeroCarte: string
  ): Promise<Envelope<CardValidationData>> {
    return this.call<CardValidationData>("valider_carte_bancaire", {
      numero_carte: numeroCarte,
    });
  }

  /**
   * Génère un payload QR Code standard EMVCo Merchant-Presented Mode (GHQR, NQR).
   */
  async genererQrEmvco(
    nomMarchand: string,
    villeMarchand: string,
    pays: string,
    compteMarchand: string,
    devise: string,
    montant?: number | string,
    reference?: string
  ): Promise<Envelope<EmvQrData>> {
    return this.call<EmvQrData>("generer_qr_emvco", {
      nom_marchand: nomMarchand,
      ville_marchand: villeMarchand,
      pays,
      compte_marchand: compteMarchand,
      devise,
      montant,
      reference,
    });
  }

  /**
   * Décode et analyse un QR Code de paiement (EMVCo avec CRC16 ou Mobile Money).
   */
  async decoderQrPaiement(
    payload: string
  ): Promise<Envelope<DecodedQrData>> {
    return this.call<DecodedQrData>("decoder_qr_paiement", {
      payload,
    });
  }
}

/**
 * Instance par défaut
 */
export const wezas = new WezasClient();
