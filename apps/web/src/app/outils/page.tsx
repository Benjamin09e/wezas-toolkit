import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, Calculator, QrCode, CreditCard, Coins, Smartphone, Receipt } from "lucide-react";

export const metadata: Metadata = {
  title: "Outils Fintech & Fiscaux Gratuits pour l'Afrique - Wezas Africa",
  description: "Suite d'outils en ligne gratuits et certifiés : validation de RIB UEMOA / CEMAC, simulateur de taxe E-Levy Ghana, générateur de QR Code EMVCo et vérificateur de cartes GIMAC / Verve.",
  keywords: [
    "outils fintech afrique",
    "verification rib uemoa gratuit",
    "simulateur e-levy ghana",
    "qr code emvco senegal cote d'ivoire",
    "carte gimac verve luhn",
    "api fintech afrique",
  ],
};

const SEO_TOOLS = [
  {
    slug: "comparateur-frais-mobile-money",
    title: "Comparateur de Frais Mobile Money (Wave, Orange, MTN)",
    description: "Comparez en direct les frais de transfert et taxes locales en zone franc et Ghana pour détecter l'option d'envoi la plus économique.",
    icon: Coins,
    badge: "Populaire · Économie",
    country: "🇸🇳 🇨🇮 🇨🇲 🇬🇭 🇬🇦",
  },
  {
    slug: "simulateur-ussd",
    title: "Simulateur USSD Push & Webhook Sandbox",
    description: "Simulez le parcours de validation d'un débit sur smartphone (#144# / *133#) et générez les callbacks webhooks pour vos tests serveurs.",
    icon: Smartphone,
    badge: "Nouveau · Dev Studio",
    country: "Orange, MTN, Wave",
  },
  {
    slug: "generateur-facture-recu",
    title: "Générateur de Reçus & Factures OHADA (TVA + BRS)",
    description: "Éditez des factures conformes avec calcul automatique de la TVA locale, retenue BRS 5%, mention NINEA/NCC et QR code scannable.",
    icon: Receipt,
    badge: "B2B & Comptabilité",
    country: "UEMOA, CEMAC",
  },
  {
    slug: "validateur-rib-uemoa",
    title: "Vérificateur de RIB UEMOA / CEMAC",
    description: "Validez instantanément un relevé d'identité bancaire ouest et centre africain : vérification de clé Modulo 97 et identification automatique de la banque.",
    icon: Building2,
    badge: "Bancaire & Trésorerie",
    country: "🇸🇳 🇨🇮 🇨🇲 🇬🇦 +8 pays",
  },
  {
    slug: "calculateur-e-levy-ghana",
    title: "Calculateur E-Levy Ghana & Taxes Transactionnelles",
    description: "Simulez l'impact de l'E-Levy ghanéen (1% après franchise de 100 GHS) et découvrez le montant exact net débité ou reçu.",
    icon: Calculator,
    badge: "Fiscalité Fintech",
    country: "🇬🇭 Ghana (BoG / GRA)",
  },
  {
    slug: "generateur-qr-emvco",
    title: "Générateur de QR Code EMVCo Marchand",
    description: "Créez gratuitement vos QR Codes marchands conformes au standard international EMVCo MPM avec checksum CRC16 CCITT pour GHQR, NQR et UEMOA.",
    icon: QrCode,
    badge: "Encaissement Standard",
    country: "Standard Panafricain",
  },
  {
    slug: "validateur-carte-afrique",
    title: "Validateur Cartes GIMAC, GIM-UEMOA & Verve",
    description: "Testez la validité d'un numéro de carte bancaire régionale ou internationale : détection du BIN réseau et algorithme Luhn ISO 7812.",
    icon: CreditCard,
    badge: "Sécurité Paiement",
    country: "CEMAC, UEMOA, Nigeria",
  },
];

export default function OutilsHubPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold">
              W
            </div>
            <span className="font-bold text-white tracking-tight">Wezas Africa</span>
          </Link>
          <Link
            href="/"
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
          >
            <span>Retour au Playground MCP</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-8 py-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Gratuits · Sans Inscription · Précision Bancaire
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Micro-Outils Fintech & Fiscaux pour l'Afrique
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Des utilitaires professionnels pour développeurs, équipes comptables et marchands africains. 
            Aucune donnée confidentielle n'est stockée ni partagée.
          </p>
        </div>

        {/* Grille des outils */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
          {SEO_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.slug}
                href={`/outils/${tool.slug}`}
                className="group relative bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition-all shadow-lg hover:shadow-amber-500/5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {tool.badge}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {tool.title}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{tool.country}</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Ouvrir l'outil <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bannière Développeurs & SDK */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white">Besoin d'automatiser ces calculs dans vos serveurs ?</h3>
            <p className="text-xs text-slate-400">
              Tous ces moteurs de validation et de calcul sont disponibles via notre SDK TypeScript / Python et serveur MCP.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg"
          >
            Explorer l'API & le SDK
          </Link>
        </div>
      </main>
    </div>
  );
}
