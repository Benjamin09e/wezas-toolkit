/**
 * Types et interfaces pour @wezas/toolkit
 */

export interface Envelope<T = any> {
  ok: boolean;
  data: T | null;
  error?: {
    code: string;
    message: {
      fr: string;
      en: string;
    };
    details?: Record<string, any>;
    suggestions?: string[];
  } | null;
  source?: string | null;
  derniere_verification?: string | null;
  confiance?: "haute" | "moyenne" | "faible" | null;
  avertissements?: Array<{
    code: string;
    message: { fr: string; en: string };
  }>;
}

export interface PhoneValidationData {
  valide: boolean;
  e164: string;
  format_national: string;
  type: "mobile" | "fixed";
  operateur_probable: string;
  mobile_money: string[];
  pays: {
    iso2: string;
    nom: string;
  };
}

export interface CurrencyConversionData {
  montant: string;
  de: string;
  vers: string;
  resultat: string;
  taux: string;
  parite_fixe: boolean;
  date_taux?: string;
}

export interface VatCalculationData {
  pays: string;
  devise: string;
  mode: "ht" | "ttc";
  nom_taxe: string;
  type_taux: string;
  taux: number;
  taux_pourcentage: string;
  montant_ht: string;
  montant_taxe: string;
  montant_ttc: string;
}

export interface AmountFormatData {
  montant_brut: string;
  montant_formate: string;
  devise: string;
  symbole: string;
  decimales: number;
  pays?: string;
}

export interface CountryInfoData {
  pays: {
    iso2: string;
    iso3: string;
    nom: string;
    nom_en: string;
    capitale: string;
  };
  indicatif: string;
  devise: {
    code: string;
    nom: string;
    symbole: string;
  };
  langues: string[];
  jours_feries: Array<{
    date: string;
    nom: { fr: string; en: string };
    type?: string;
  }>;
}

export interface OperatorInfo {
  id: string;
  nom: string;
  pays: string[];
  mobile_money: string[];
  a_mobile_money: boolean;
}

export interface OperatorsListData {
  total: number;
  operateurs: OperatorInfo[];
  pays?: {
    iso2: string;
    nom: string;
  };
}

export interface TaxIdValidationData {
  valide: boolean;
  pays: {
    iso2: string;
    nom: string;
  };
  type_identifiant: string;
  autorite_fiscale: string;
  identifiant_formate: string;
  identifiant_brut: string;
}

export interface PaymentPayloadData {
  operateur: string;
  pays: string;
  devise: string;
  beneficiaire_e164: string;
  montant: string;
  reference: string | null;
  deeplink: string | null;
  code_ussd: string | null;
  instruction: string;
  qr_payload: string;
}

export interface RibValidationData {
  valide: boolean;
  cle_fournie: string;
  cle_calculee: string;
  rib_complet: string;
  code_banque: string;
  code_guichet: string;
  numero_compte: string;
  banque: {
    nom: string;
    bic: string | null;
    pays: string | null;
    zone: string | null;
  };
}

export interface NubanValidationData {
  valide: boolean;
  compte_complet: string;
  code_banque: string;
  numero_serie: string;
  cle_fournie: string;
  cle_calculee: string;
  norme: string;
  banque: {
    nom: string;
    bic: string | null;
    pays: string;
    zone: string;
  };
}

export interface IbanValidationData {
  valide: boolean;
  iban_formate: string;
  iban_brut: string;
  pays: {
    iso2: string;
    nom: string;
  };
  cle_iban: string;
  code_banque: string;
  code_guichet: string | null;
  numero_compte: string | null;
  cle_rib_nationale: string | null;
  banque: {
    nom: string;
    bic: string | null;
    zone: string;
  };
}

export interface CardValidationData {
  valide: boolean;
  pan_masque: string;
  bin: string;
  derniers_chiffres: string;
  longueur: number;
  reseau: {
    id: string;
    nom: string;
    type: string;
    region: string | null;
    pays_associes: string[];
  };
  luhn_valide: boolean;
}

export interface EmvQrData {
  payload: string;
  norme: string;
  crc: string;
  marchand: {
    nom: string;
    ville: string;
    compte: string;
    pays: string;
  };
  devise: string;
  code_devise_iso: string;
  montant?: string | null;
  reference?: string | null;
  type_initiation: "dynamic" | "static";
}

export interface DecodedQrData {
  type: "emvco" | "mobile_money_direct";
  norme?: string;
  operateur?: string;
  valide_crc?: boolean;
  telephone?: string;
  montant?: string | null;
  reference?: string | null;
  marchand?: {
    nom: string;
    ville: string;
    compte: string;
    pays: string;
  };
  devise?: string;
  tags_bruts?: Record<string, string>;
  payload_brut?: string;
}
