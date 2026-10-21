import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wezas Africa Toolkit - Données & Outils Fintech Afrique Subsaharienne",
  description:
    "Serveur MCP et SDK open source pour builders africains : validation de téléphone E.164, Mobile Money, calcul de TVA certifié, conversion de devises (XAF/XOF/EUR/USD) et jours fériés légaux pour 15 pays.",
  keywords: [
    "Afrique",
    "Fintech",
    "MCP",
    "Model Context Protocol",
    "Mobile Money",
    "Orange Money",
    "MTN MoMo",
    "Wave",
    "M-Pesa",
    "TVA Afrique",
    "FCFA",
    "XAF",
    "XOF",
    "Télécoms Afrique",
  ],
  authors: [{ name: "Benjamin EKIA" }],
  openGraph: {
    title: "Wezas Africa Toolkit - Outils Fintech & Télécoms pour l'Afrique",
    description:
      "Boîte à outils open source 100% hors ligne : validation de téléphone, Mobile Money, parité fixe CFA/EUR, TVA certifiée et jours fériés.",
    url: "https://wezas-africa.netlify.app",
    siteName: "Wezas Africa Toolkit",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wezas Africa Toolkit",
    description:
      "Serveur MCP & SDK pour les développeurs et l'IA en Afrique subsaharienne.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
