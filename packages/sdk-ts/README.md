# wezas-africa-toolkit

Client SDK TypeScript / JavaScript et serveur MCP officiel pour le **Wezas Africa Toolkit**.  
Outils dédiés aux builders et fintechs en Afrique (validation de téléphones, opérateurs Mobile Money, conversion devises, TVA, jours fériés légaux pour 15 pays).

[![npm version](https://img.shields.io/npm/v/wezas-africa-toolkit.svg?color=cb3837)](https://www.npmjs.com/package/wezas-africa-toolkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ⚡ Utilisation comme serveur MCP (Claude Desktop, Cursor, Windsurf)

Exécutez directement le serveur MCP sans installation globale :

```bash
npx -y wezas-africa-toolkit
```

### Configuration Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "wezas-africa": {
      "command": "npx",
      "args": ["-y", "wezas-africa-toolkit"]
    }
  }
}
```

---

## 📦 Utilisation comme SDK TypeScript / Node.js

### Installation

```bash
npm install wezas-africa-toolkit
# ou
pnpm add wezas-africa-toolkit
# ou
yarn add wezas-africa-toolkit
```

### 1. Validation de Téléphone & Détection Mobile Money
```typescript
import { wezas } from "wezas-africa-toolkit";

const res = await wezas.validerTelephone("Sénégal", "77 123 45 67");

if (res.ok && res.data) {
  console.log(res.data.e164);               // "+221771234567"
  console.log(res.data.operateur_probable); // "Orange Sénégal (Sonatel)"
  console.log(res.data.mobile_money);       // ["Orange Money", "Wave"]
}
```

### 2. Calcul de TVA officielle (HT / TTC)
```typescript
import { wezas } from "wezas-africa-toolkit";

const tva = await wezas.calculerTva(100000, "Cameroun", { mode: "ht" });

if (tva.ok && tva.data) {
  console.log(tva.data.nom_taxe);          // "TVA (avec CAC)"
  console.log(tva.data.taux_pourcentage);  // "19.25%"
  console.log(tva.data.montant_ttc);       // "119250"
}
```

### 3. Conversion de devises (Parité fixe garantie CFA/EUR)
```typescript
import { wezas } from "wezas-africa-toolkit";

const conv = await wezas.convertirDevise(50, "EUR", "XAF");

if (conv.ok && conv.data) {
  console.log(conv.data.resultat); // "32798"
}
```

### 4. Formatage monétaire local hors ligne immédiat
```typescript
import { formatAmountOffline } from "wezas-africa-toolkit";

const format = formatAmountOffline(1500000, "XOF");
console.log(format.data?.montant_formate); // "1 500 000 FCFA"
```

---

## 🛠️ Configuration d'un backend personnalisé

Par défaut, le client contacte l'API Render haute disponibilité. Vous pouvez pointer vers votre propre instance ou serveur local :

```typescript
import { WezasClient } from "wezas-africa-toolkit";

const wezas = new WezasClient({
  baseUrl: "https://votre-backend.onrender.com"
});
```

---

## 📄 Licence
MIT © Benjamin EKIA
