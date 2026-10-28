# Release v1.6.0 – Wezas Africa Toolkit

**Date de release** : 28 Octobre 2026  
**Tag Git** : `v1.6.0`  
**Dépôt** : [github.com/Benjamin09e/wezas-toolkit](https://github.com/Benjamin09e/wezas-toolkit)

---

## 🌟 Points Forts de la Version 1.6.0

Cette version majeure étend significativement les capacités Fintech et développeur de l'écosystème Wezas en introduisant la validation des cartes bancaires régionales, la prise en charge du standard de paiement par QR code EMVCo, le SDK Python officiel et un playground visuel enrichi.

---

### 💳 1. Cartes Bancaires Régionales & Panafricaines (`valider_carte_bancaire`)
* **Détection automatique du réseau émetteur** via les plages BIN :
  * **GIMAC** (Afrique Centrale : Cameroun, Gabon, Congo, Tchad, RCA, Guinée Équatoriale).
  * **GIM-UEMOA** (Afrique de l'Ouest : Côte d'Ivoire, Sénégal, Bénin, Burkina Faso, Mali, Niger, Togo, Guinée-Bissau).
  * **Verve** (Nigeria / Pan-africain : Nigeria, Ghana, Kenya, Ouganda).
  * **Visa & Mastercard** (Réseaux internationaux).
* **Contrôle algorithmique de Luhn** (Mod 10 / ISO/IEC 7812-1).
* **Masquage conforme PCI-DSS** (préserve les 6 premiers chiffres du BIN et les 4 derniers).
* Exposition : Outil FastMCP, API REST (`POST /v1/bank/card/validate`), SDK TypeScript et SDK Python.

---

### 📱 2. QR Codes de Paiement Unifiés EMVCo & Mobile Money (`generer_qr_emvco`, `decoder_qr_paiement`)
* **Générateur EMVCo Merchant-Presented Mode** (ISO/IEC 18004) :
  * Standard utilisé par **GHQR** (Ghana), **NQR** (Nigeria) et les systèmes interbancaires régionaux.
  * Modes statique et dynamique avec calcul automatique de la somme de contrôle **CRC16-CCITT** (Tag 63).
  * Résolution des devises ISO 4217 numériques (XOF, XAF, GHS, NGN, KES, etc.).
* **Décodeur universel de QR codes de paiement** :
  * Décodage et contrôle d'intégrité CRC des formats EMVCo.
  * Détection et analyse des formats propriétaires directs **Wave**, **Orange Money** et **MTN MoMo**.

---

### 🐍 3. SDK Python Officiel (`wezas-sdk` sur PyPI)
* Package Python moderne prêt pour `pip install wezas-sdk` (PEP 621 / hatchling).
* Modèles de données Pydantic génériques et typés (`WezasResponse[T]`, `ErrorInfo`).
* **Deux clients HTTP httpx intégrés** :
  * Client synchrone : `WezasClient` (pour Django, scripts, Flask).
  * Client asynchrone : `AsyncWezasClient` (pour FastAPI, asyncio, Starlette).
* Couverture complète des 12 outils et méthodes de l'API.

---

### 💻 4. Playground Web Interactif (`apps/web`)
* **Simulateur de carte bancaire dynamique** : affichage en direct d'une carte bancaire avec dégradé thématique par réseau (GIMAC émeraude, UEMOA ambre, Verve bleu, Mastercard bicolore), badge de conformité Luhn et pays membres.
* **Aperçu QR Code de paiement scannable** : affichage du QR Code généré en direct à l'écran, scannable immédiatement par smartphone avec détails du marchand et montant.
* **Décodeur de QR Code** : analyse de payload en un clic.

---

## 🧪 Qualité & Tests

* **210 tests unitaires et d'intégration Python validés** (`pytest`) avec 0 régression.
* **Tests SDK TypeScript validés** (`client.test.mjs`).
* **Build Next.js validé avec Turbopack** (`apps/web`).
* Suivi des 18 Epics (WAT-001 à WAT-066) à 100% dans `tickets.md`.

---

## 📦 Installation & Dépendances

### Python
```bash
pip install wezas-sdk
```

### TypeScript / Node.js
```bash
npm install @wezas/toolkit
```

### Serveur MCP FastMCP
```bash
uvx wezas-africa-toolkit
```
