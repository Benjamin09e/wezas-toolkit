# Wezas Africa Toolkit

<div align="center">
  <h3>Serveur MCP & boîte à outils open source pour les builders africains.</h3>
  <p><strong>100% hors ligne · Zéro clé API requise · Données sourcées</strong></p>
  <p>
    <a href="https://github.com/Benjamin09e/wezas-toolkit/actions/workflows/ci.yml"><img src="https://github.com/Benjamin09e/wezas-toolkit/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License MIT"></a>
    <a href="https://www.npmjs.com/package/wezas-africa-toolkit"><img src="https://img.shields.io/npm/v/wezas-africa-toolkit.svg?color=cb3837" alt="NPM Version"></a>
    <a href="https://glama.ai/mcp/servers/Benjamin09e/wezas-toolkit"><img src="https://glama.ai/mcp/servers/Benjamin09e/wezas-toolkit/badge" alt="Glama MCP Badge"></a>
  </p>
</div>

---

## 💡 Pourquoi Wezas Africa Toolkit ?

Dans des projets comme **MedRDV**, **StockR** ou **Gabozon**, nous retrouvons systématiquement les mêmes besoins :
- Valider un numéro de téléphone africain avec les bons formats (8, 9 ou 10 chiffres selon les récentes réformes ARCEP), détecter l'opérateur et sa compatibilité Mobile Money.
- Convertir des devises de la zone franc (`XAF`, `XOF`, `EUR`) avec parité fixe garantie sans dépendre d'une connexion réseau instable.
- Connaître les indicatifs, les langues, les fuseaux horaires et les jours fériés légaux (fixes, fêtes mobiles chrétiennes calculées dynamiquement, fêtes musulmanes).

**Wezas Africa Toolkit** résout ces problèmes sous la forme d'un serveur **Model Context Protocol (MCP)** standardisé, utilisable directement par vos assistants IA (Claude Desktop, Cursor, Windsurf, Copilot, etc.) ou en bibliothèque Python autonome.

---

## ⚡ Installation rapide & Connexion MCP

### Option A : Directement via `npx` (Recommandé, Node.js / Claude Desktop)
```bash
npx -y wezas-africa-toolkit
```

### Option B : En local via `uvx` (Python)
```bash
uvx wezas-africa-toolkit
```

### Option C : Découverte & Registre MCP via Glama
Consultez la fiche et explorez les outils sur le registre Glama MCP :
- **Registre Glama** : [glama.ai/mcp/servers/Benjamin09e/wezas-toolkit](https://glama.ai/mcp/servers/Benjamin09e/wezas-toolkit)

### Option D : Connexion distante via Server-Sent Events (SSE)
Vous pouvez également connecter vos agents directement au serveur hébergé sur Render sans rien exécuter en local :
- **URL SSE** : `https://wezas-backend.onrender.com/sse`
- **Méthode** : `sse`

---

## 🔌 Configuration dans vos IDE & Clients IA

### 1. Claude Desktop

Ajoutez ce bloc de configuration prêt à copier dans votre fichier de configuration Claude Desktop :

- **macOS** : `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows** : `%APPDATA%\Claude\claude_desktop_config.json`

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

*(Si vous préférez l'environnement Python avec `uvx`, remplacez `"command": "uvx"` et `"args": ["wezas-africa-toolkit"]`).*

### 2. Cursor IDE
Dans **Cursor Settings** > **Features** > **MCP Servers** > **Add New MCP Server** :
- **Name** : `wezas-africa`
- **Type** : `command`
- **Command** : `npx -y wezas-africa-toolkit`

### 3. Windsurf
Dans votre fichier `~/.codeium/windsurf/mcp_config.json` :
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

## 🛠️ Outils disponibles (Volet 1)

Tous les outils retournent une réponse enveloppée uniforme (`Envelope`) contenant `ok`, `data`, `source`, `derniere_verification`, `confiance` et d'éventuels `avertissements`.

### 1. `valider_telephone(pays, numero)`
Valide et normalise n'importe quel numéro de téléphone local ou international.

- **Exemple d'appel** : `valider_telephone(pays="Gabon", numero="077 12 34 56")`
- **Réponse** :
  ```json
  {
    "ok": true,
    "data": {
      "valide": true,
      "e164": "+24177123456",
      "format_national": "077123456",
      "type": "mobile",
      "operateur_probable": "Airtel Gabon",
      "mobile_money": ["Airtel Money"],
      "pays": { "iso2": "GA", "nom": "Gabon" }
    },
    "source": "ARCEP Gabon / UIT Décision Plan National de Numérotation 2024",
    "confiance": "moyenne",
    "avertissements": [
      {
        "code": "PORTABILITE_NUMERO",
        "message": { "fr": "L'opérateur et la compatibilité Mobile Money sont probables mais peuvent différer en cas de portabilité." }
      }
    ]
  }
  ```

### 2. `convertir_devise(montant, de, vers, taux?)`
Conversion exacte par fractions sans approximation binaire.
- Parité fixe garantie : `1 EUR = 655,957 XAF = 655,957 XOF`.
- Gestion de l'USD avec taux indicatif de repli daté ou taux personnalisé fourni par l'utilisateur.
- **Exemple** : `convertir_devise(montant=15000, de="EUR", vers="XAF")` -> `9839355 XAF`.

### 3. `info_pays(pays, annee?, champs?)`
Informations clés complètes et calendrier des jours fériés légaux.
- Indicatif international, capitale, fuseaux horaires avec heure locale dynamique (`zoneinfo`).
- Jours fériés à date fixe, calcul automatique de Pâques (Vendredi Saint, Ascension, Pentecôte) et fêtes musulmanes.
- **Exemple** : `info_pays(pays="Sénégal", annee=2026)`

---

## 🌍 Couverture actuelle (v0.1)

| Zone | Pays couverts |
|---|---|
| **Afrique Centrale (XAF)** | 🇬🇦 Gabon (`GA`), 🇨🇲 Cameroun (`CM`), 🇨🇬 Congo (`CG`), 🇹🇩 Tchad (`TD`), 🇨🇫 République Centrafricaine (`CF`), 🇬🇶 Guinée Équatoriale (`GQ`) |
| **Afrique de l'Ouest (XOF)** | 🇸🇳 Sénégal (`SN`), 🇨🇮 Côte d'Ivoire (`CI`), 🇲🇱 Mali (`ML`), 🇧🇯 Bénin (`BJ`), 🇹🇬 Togo (`TG`), 🇧🇫 Burkina Faso (`BF`) |

---

## 🤝 Contribuer

Wezas Africa Toolkit est un projet communautaire. Vous pouvez facilement ajouter de nouveaux pays ou corriger des données télécoms :
- Consultez le [Guide de Contribution (CONTRIBUTING.md)](CONTRIBUTING.md).
- Utilisez le script de scaffolding : `uv run python scripts/scaffold_country.py --iso RW --nom Rwanda`.
- Vérifiez la conformité des schémas : `uv run python scripts/validate_data.py`.

---

## 📜 Licence
Distribué sous licence open source [MIT](LICENSE).
