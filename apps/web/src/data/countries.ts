export interface CountryOption {
  iso2: string;
  name: string;
  flag: string;
  dialCode: string;
  currency: string;
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { iso2: "BJ", name: "Bénin", flag: "🇧🇯", dialCode: "+229", currency: "XOF" },
  { iso2: "BF", name: "Burkina Faso", flag: "🇧🇫", dialCode: "+226", currency: "XOF" },
  { iso2: "CM", name: "Cameroun", flag: "🇨🇲", dialCode: "+237", currency: "XAF" },
  { iso2: "CF", name: "Centrafrique", flag: "🇨🇫", dialCode: "+236", currency: "XAF" },
  { iso2: "CG", name: "Congo (Brazzaville)", flag: "🇨🇬", dialCode: "+242", currency: "XAF" },
  { iso2: "CD", name: "RD Congo (Kinshasa)", flag: "🇨🇩", dialCode: "+243", currency: "CDF" },
  { iso2: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", dialCode: "+225", currency: "XOF" },
  { iso2: "GA", name: "Gabon", flag: "🇬🇦", dialCode: "+241", currency: "XAF" },
  { iso2: "GH", name: "Ghana", flag: "🇬🇭", dialCode: "+233", currency: "GHS" },
  { iso2: "GN", name: "Guinée", flag: "🇬🇳", dialCode: "+224", currency: "GNF" },
  { iso2: "GQ", name: "Guinée Équatoriale", flag: "🇬🇶", dialCode: "+240", currency: "XAF" },
  { iso2: "KE", name: "Kenya", flag: "🇰🇪", dialCode: "+254", currency: "KES" },
  { iso2: "MG", name: "Madagascar", flag: "🇲🇬", dialCode: "+261", currency: "MGA" },
  { iso2: "ML", name: "Mali", flag: "🇲🇱", dialCode: "+223", currency: "XOF" },
  { iso2: "MA", name: "Maroc", flag: "🇲🇦", dialCode: "+212", currency: "MAD" },
  { iso2: "NG", name: "Nigeria", flag: "🇳🇬", dialCode: "+234", currency: "NGN" },
  { iso2: "RW", name: "Rwanda", flag: "🇷🇼", dialCode: "+250", currency: "RWF" },
  { iso2: "SN", name: "Sénégal", flag: "🇸🇳", dialCode: "+221", currency: "XOF" },
  { iso2: "TD", name: "Tchad", flag: "🇹🇩", dialCode: "+235", currency: "XAF" },
  { iso2: "TG", name: "Togo", flag: "🇹🇬", dialCode: "+228", currency: "XOF" },
];
