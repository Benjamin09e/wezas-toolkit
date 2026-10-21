# @wezas/toolkit

SDK TypeScript / JavaScript officiel pour le **Wezas Africa Toolkit**.  
Outils dédiés aux builders et fintechs en Afrique (validation de téléphones, opérateurs, conversion devises, TVA, jours fériés).

## 🚀 Installation

```bash
npm install @wezas/toolkit
# ou
pnpm add @wezas/toolkit
# ou
yarn add @wezas/toolkit
```

---

## 💡 Utilisation

### 1. Validation de Téléphone & Mobile Money
```typescript
import { wezas } from "@wezas/toolkit";

const res = await wezas.validerTelephone("Gabon", "077 12 34 56");

if (res.ok && res.data) {
  console.log(res.data.e164);               // "+24177123456"
  console.log(res.data.operateur_probable); // "Airtel Gabon"
  console.log(res.data.mobile_money);       // ["Airtel Money"]
}
```

### 2. Calcul de TVA officielle (HT / TTC)
```typescript
import { wezas } from "@wezas/toolkit";

const tva = await wezas.calculerTva(100000, "Cameroun", { mode: "ht" });

if (tva.ok && tva.data) {
  console.log(tva.data.nom_taxe);          // "TVA (avec CAC)"
  console.log(tva.data.taux_pourcentage);  // "19.25%"
  console.log(tva.data.montant_ttc);       // "119250"
}
```

### 3. Conversion de devises (Parité fixe garantie)
```typescript
import { wezas } from "@wezas/toolkit";

const conv = await wezas.convertirDevise(50, "EUR", "XAF");

if (conv.ok && conv.data) {
  console.log(conv.data.resultat); // "32798"
}
```

### 4. Formatage hors ligne immédiat
```typescript
import { formatAmountOffline } from "@wezas/toolkit";

const format = formatAmountOffline(1500000, "XOF");
console.log(format.data?.montant_formate); // "1 500 000 FCFA"
```

---

## 🛠️ Configuration d'un backend personnalisé

Par défaut, le client contacte l'API Render. Vous pouvez pointer vers votre propre instance ou serveur local :

```typescript
import { WezasClient } from "@wezas/toolkit";

const wezas = new WezasClient({
  baseUrl: "https://votre-backend.onrender.com"
});
```

## 📄 Licence
MIT
