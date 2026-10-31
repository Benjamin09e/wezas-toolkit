# @wezas/react

Composants React prêts à l'emploi pour fintechs et paiements en Afrique, propulsés par **Wezas Africa Toolkit**.

[![NPM Version](https://img.shields.io/npm/v/@wezas/react.svg?color=cb3837)](https://www.npmjs.com/package/@wezas/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🚀 Installation

```bash
npm install @wezas/react wezas-africa-toolkit
# ou
pnpm add @wezas/react wezas-africa-toolkit
# ou
yarn add @wezas/react wezas-africa-toolkit
```

---

## 📦 Composants Inclus

### 1. `<AfricaPhoneInput />`
Saisie intelligente de numéros de téléphone africains avec :
- Sélecteur de 22+ pays avec drapeaux et indicatifs
- Détection automatique et temps réel de l'opérateur (Orange, MTN, Wave, Moov, Airtel)
- Validation au format international E.164

```tsx
import { AfricaPhoneInput } from "@wezas/react";

export function MonFormulaire() {
  return (
    <AfricaPhoneInput
      defaultCountry="CI"
      onChange={(num, international, country) => {
        console.log("International:", international);
      }}
      onValid={(data) => {
        console.log("Opérateur détecté:", data.operateur.nom);
      }}
    />
  );
}
```

---

### 2. `<AfricaCheckoutWidget />`
Widget d'encaissement Mobile Money et cartes locales (GIMAC / Verve) :
- Sélection de l'opérateur (Wave, Orange Money, MTN MoMo, Cartes bancaires)
- Déclenchement automatique des liens de paiement profonds (deeplinks)
- Gestion des devises XOF, XAF, GHS, NGN...

```tsx
import { AfricaCheckoutWidget } from "@wezas/react";

export function PagePaiement() {
  return (
    <AfricaCheckoutWidget
      amount={5000}
      currency="XOF"
      country="SN"
      recipientPhone="771234567"
      reference="COMMANDE-42"
      onSuccess={(details) => {
        alert("Paiement réussi !");
      }}
    />
  );
}
```

---

## 📄 Licence
MIT © Benjamin EKIA
