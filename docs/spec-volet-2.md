# Spécification détaillée – Volet 2 en ligne (WAT-045)

**Version** : 1.0.0  
**Statut** : Validé  
**Date** : 2026-10-22  

---

## 1. Contexte & Principes directeurs

Le projet **Wezas Africa Toolkit** repose sur deux principes cardinaux (cf. `archi.md`) :
1. **Autonomie absolue du Volet 1** : Le package `wezas-core` et le serveur MCP local fonctionnent hors ligne, sans clé API, sans base de données, avec des taux garantis et des données de repli intégrées.
2. **Valeur ajoutée du Volet 2** : L'activation en ligne enrichit les données en temps réel (taux de devises spot, vérification bancaire / BIC, actualisation dynamique des opérateurs) et met à disposition une API REST hébergée destinée aux intégrateurs et au portail communautaire.

---

## 2. Périmètre des Outils & Fonctionnalités En Ligne

| Domaine | Outil / Fonctionnalité | Source / Provider | Mode d'accès | Repli hors ligne |
|---|---|---|---|---|
| **Taux de change** | USD/EUR & devises africaines dynamiques | Frankfurter API (BCE) / Banque Centrale | Gratuit, sans clé requise | Repli strict sur `rates.yaml` avec avertissement `TAUX_INDICATIF_HORS_LIGNE` |
| **Vérification Bancaire / BIC** | Lookup indicatif codes banques & BIC zone CEMAC/UEMOA | Référentiel centralisé + API publique | Sans clé / Service interne | Base locale embarquée |
| **Opérateurs Télécoms** | Détection d'enrichissement (MNP / portabilité lorsque disponible) | Module de règles dynamiques | Optionnel via API hébergée | Détection par indicatif/préfixe statique YAML |
| **Service Santé & Métriques** | Endpoint `/health` et statut des caches | Interne (FastAPI) | Public | N/A |

---

## 3. Architecture des Clés API & Sécurité

### 3.1 Gestion des Clés Utilisateurs (API Hébergée)
- **Format de clé** : Préfixe explicite `wz_live_<random_32_chars>` pour l'environnement de production et `wz_test_<random_32_chars>` pour le bac à sable.
- **Stockage sécurisé** : Les clés API ne sont **jamais stockées en clair**. Elles sont hachées avec **SHA-256** (avec sel d'environnement) avant insertion en base (MongoDB).
- **Révocation & Portée (`scopes`)** :
  - `read:tools` : Accès aux endpoints de calcul et conversion.
  - `contrib:write` : Soumission de propositions de mise à jour de données pays.
  - `admin` : Validation et modération.

### 3.2 Gestion des Secrets & Providers Tiers
- Les clés et URLs de services externes (ex: MongoDB Atlas, Sentry, JWT secret) sont configurées exclusivement via des **variables d'environnement**.
- Aucune clé n'est commise dans le dépôt Git (bloqué par pré-commit et CI).

### 3.3 Protection contre les abus (Rate Limiting)
- Niveau gratuit sans clé (anonyme) : 30 requêtes / minute / IP.
- Utilisateur authentifié (`wz_live_...`) : 600 requêtes / minute.
- En-têtes HTTP standard retournés : `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

---

## 4. Données & Confidentialité (Vie Privée)
- **Zéro journalisation des données sensibles** : Les numéros de téléphone soumis pour validation ou formatage ne sont **jamais persistés** ni enregistrés dans les logs applicatifs (cf. ADR-6).
- Seules les métriques agrégées (pays demandé, code de statut HTTP, latence d'exécution) sont collectées.

---

## 5. Synthèse des Variables d'Environnement

| Variable | Composant | Obligatoire ? | Description |
|---|---|---|---|
| `WEZAS_ONLINE` | core / mcp | Non (défaut: `0`) | Active les requêtes réseau (ex: taux en direct) |
| `MONGODB_URI` | api | Oui (si hébergée) | Chaîne de connexion MongoDB (ex: `mongodb://localhost:27017/wezas`) |
| `API_SECRET_SALT` | api | Oui (si hébergée) | Sel pour le hachage des clés API |
| `JWT_SECRET` | api / web | Oui (si hébergée) | Clé de signature pour sessions portail |
| `RATES_CACHE_TTL_HOURS` | core / api | Non (défaut: `12`) | Durée de vie du cache des taux en mémoire/disque |
