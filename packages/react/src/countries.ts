export interface CountryOption {
  iso2: string;
  name: string;
  dialCode: string;
  flag: string;
  example: string;
}

export const AFRICAN_COUNTRIES: CountryOption[] = [
  { iso2: "CI", name: "Côte d'Ivoire", dialCode: "+225", flag: "🇨🇮", example: "07 08 12 34 56" },
  { iso2: "SN", name: "Sénégal", dialCode: "+221", flag: "🇸🇳", example: "77 123 45 67" },
  { iso2: "CM", name: "Cameroun", dialCode: "+237", flag: "🇨🇲", example: "670 12 34 56" },
  { iso2: "GA", name: "Gabon", dialCode: "+241", flag: "🇬🇦", example: "077 12 34 56" },
  { iso2: "BJ", name: "Bénin", dialCode: "+229", flag: "🇧🇯", example: "97 12 34 56" },
  { iso2: "TG", name: "Togo", dialCode: "+228", flag: "🇹🇬", example: "90 12 34 56" },
  { iso2: "BF", name: "Burkina Faso", dialCode: "+226", flag: "🇧🇫", example: "70 12 34 56" },
  { iso2: "ML", name: "Mali", dialCode: "+223", flag: "🇲🇱", example: "70 12 34 56" },
  { iso2: "NE", name: "Niger", dialCode: "+227", flag: "🇳🇪", example: "90 12 34 56" },
  { iso2: "GN", name: "Guinée", dialCode: "+224", flag: "🇬🇳", example: "620 12 34 56" },
  { iso2: "CD", name: "RDC", dialCode: "+243", flag: "🇨🇩", example: "81 234 5678" },
  { iso2: "CG", name: "Congo", dialCode: "+242", flag: "🇨🇬", example: "06 123 4567" },
  { iso2: "TD", name: "Tchad", dialCode: "+235", flag: "🇹🇩", example: "66 12 34 56" },
  { iso2: "CF", name: "Centrafrique", dialCode: "+236", flag: "🇨🇫", example: "70 12 34 56" },
  { iso2: "GQ", name: "Guinée Équatoriale", dialCode: "+240", flag: "🇬🇶", example: "222 12 34 56" },
  { iso2: "GH", name: "Ghana", dialCode: "+233", flag: "🇬🇭", example: "24 123 4567" },
  { iso2: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬", example: "802 123 4567" },
  { iso2: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪", example: "712 345 678" },
  { iso2: "RW", name: "Rwanda", dialCode: "+250", flag: "🇷🇼", example: "788 123 456" },
  { iso2: "MA", name: "Maroc", dialCode: "+212", flag: "🇲🇦", example: "612 34 56 78" },
  { iso2: "TN", name: "Tunisie", dialCode: "+216", flag: "🇹🇳", example: "20 123 456" },
  { iso2: "MG", name: "Madagascar", dialCode: "+261", flag: "🇲🇬", example: "32 12 345 67" },
];
