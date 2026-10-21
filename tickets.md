# Wezas Africa Toolkit – Tickets

> Décisions de cadrage validées : voir `docs/decisions.md`.

**Légende avancement** : `À faire` · `En cours` · `En revue` · `Terminé` · `Bloqué`
**Priorité** : P0 (bloquant) · P1 (v0.1) · P2 (après v0.1)
**Taille** : S (<½ j) · M (1 j) · L (2-3 j)

## Suivi global

| Epic | Tickets | Avancement |
|---|---|---|
| E0 – Cadrage | WAT-001 → 002 | 100 % |
| E1 – Socle technique | WAT-003 → 008 | 100 % |
| E2 – Données pays | WAT-009 → 012 | 100 % |
| E3 – `valider_telephone` | WAT-013 → 017 | 100 % |
| E4 – `convertir_devise` | WAT-018 → 022 | 100 % |
| E5 – `info_pays` | WAT-023 → 027 | 100 % |
| E6 – Qualité & CI | WAT-028 → 031 | 100 % |
| E7 – Contribution communautaire | WAT-032 → 035 | 100 % |
| E8 – Distribution & release | WAT-036 → 039 | 0 % |
| E9 – Outils bonus | WAT-040 → 042 | 0 % |
| E10 – Volet 2 (en ligne) | WAT-043 → 045 | 0 % |

---

## E0 – Cadrage

### WAT-001 – Valider les décisions de cadrage
- **Priorité / Taille** : P0 / S
- **Avancement** : Terminé (voir `docs/decisions.md`)
- **Description** : Trancher langage/framework (Python FastMCP vs TypeScript), liste des pays v0.1, périmètre du volet 2, licence (MIT/Apache-2.0), langue des noms d'outils.
- **Critères d'acceptation** : décisions consignées dans `docs/decisions.md` (ADR courts).
- **Skills** : product ownership, architecture logicielle, connaissance de l'écosystème MCP.

### WAT-002 – Définir le contrat de sortie commun
- **Priorité / Taille** : P0 / S
- **Avancement** : Terminé
- **Description** : Spécifier l'enveloppe JSON commune : `data`, `source`, `derniere_verification`, `confiance`, `avertissements`, et le format des erreurs (codes, messages FR/EN).
- **Critères d'acceptation** : schéma JSON documenté dans `docs/output-contract.md`.
- **Skills** : conception d'API, JSON Schema, rédaction technique.

---

## E1 – Socle technique

### WAT-003 – Initialiser le dépôt
- **Priorité / Taille** : P0 / S
- **Avancement** : Terminé
- **Description** : Structure du repo (`src/`, `data/`, `tests/`, `docs/`), `pyproject.toml`, gestion des dépendances (uv), `.gitignore`, LICENSE, README minimal.
- **Skills** : Python packaging, Git.

### WAT-004 – Serveur MCP minimal
- **Priorité / Taille** : P0 / M
- **Avancement** : Terminé (test in-process + appel stdio réel OK ; MCP Inspector et client desktop non testés)
- **Description** : Serveur FastMCP avec transport stdio, un outil `ping` de test, vérifié avec MCP Inspector et un client réel (Claude Desktop/CLI).
- **Skills** : protocole MCP, FastMCP, debug client/serveur.

### WAT-005 – Chargeur de données et validation
- **Priorité / Taille** : P0 / M
- **Avancement** : Terminé
- **Description** : Module qui charge les fichiers pays (JSON/YAML), les valide via schéma (pydantic/jsonschema), et les met en cache en mémoire. Fonctionnement 100 % hors ligne, données embarquées dans le package.
- **Skills** : Python, pydantic, JSON Schema, packaging de ressources.

### WAT-006 – Gestion d'erreurs et normalisation des entrées
- **Priorité / Taille** : P1 / S
- **Avancement** : Terminé
- **Description** : Normalisation des pays (nom FR/EN, ISO-2, ISO-3, « Gabon », « GA »), des espaces et caractères du numéro, messages d'erreur clairs avec suggestions.
- **Skills** : Python, ISO 3166, UX d'API.

### WAT-007 – Internationalisation FR/EN
- **Priorité / Taille** : P2 / S
- **Avancement** : Terminé (catalogue de messages FR/EN dans `i18n.py` ; les noms de pays FR/EN sont dans les fichiers pays)
- **Description** : Descriptions d'outils et messages bilingues, noms de pays localisés.
- **Skills** : i18n, rédaction FR/EN.

### WAT-008 – Logging et télémétrie locale
- **Priorité / Taille** : P2 / S
- **Avancement** : Terminé (`log.py` : stderr, niveau `WEZAS_LOG_LEVEL`, masquage des numéros)
- **Description** : Logs sur stderr (jamais stdout en stdio), niveau configurable. Aucune télémétrie réseau.
- **Skills** : Python logging, protocole stdio MCP.

---

## E2 – Données pays

### WAT-009 – Schéma de données pays
- **Priorité / Taille** : P0 / M
- **Avancement** : Terminé
- **Description** : Définir le schéma d'un fichier `data/countries/<iso2>.yaml` : indicatif, plan de numérotation (longueurs, préfixes par opérateur), devise, langues, fuseaux, jours fériés, opérateurs Mobile Money, champs `sources[]` et `derniere_verification`.
- **Skills** : modélisation de données, JSON Schema, télécoms (plans de numérotation E.164).

### WAT-010 – Collecte : Afrique centrale (XAF)
- **Priorité / Taille** : P1 / L
- **Avancement** : Terminé (Gabon, Cameroun, Congo, Tchad, RCA, Guinée équatoriale)
- **Description** : Données sourcées pour Gabon, Cameroun, Congo, Tchad, RCA, Guinée équatoriale (plans ARCEP/ART/régulateurs, opérateurs, Mobile Money). Noter les changements historiques (ex. Gabon 9 chiffres en 2019).
- **Skills** : recherche documentaire, connaissance télécoms africains, rigueur de sourçage.

### WAT-011 – Collecte : Afrique de l'Ouest (XOF)
- **Priorité / Taille** : P1 / L
- **Avancement** : Terminé (Sénégal, Côte d'Ivoire, Mali, Bénin, Togo, Burkina Faso)
- **Description** : Idem pour Sénégal, Côte d'Ivoire, Mali, Bénin, Togo, Burkina Faso (Wave, Orange Money, Moov, MTN).
- **Skills** : recherche documentaire, télécoms, Mobile Money.

### WAT-012 – Registre des opérateurs et services Mobile Money
- **Priorité / Taille** : P1 / M
- **Avancement** : Terminé (data/operators.yaml avec opérateurs et Mobile Money)
- **Description** : Fichier `data/operators.yaml` : opérateurs, services Mobile Money (Orange Money, MTN MoMo, Airtel Money, Moov Money, Wave), pays couverts, interopérabilité connue.
- **Skills** : connaissance fintech africaine, modélisation de données.

---

## E3 – Outil `valider_telephone`

### WAT-013 – Parsing et format international
- **Priorité / Taille** : P0 / M
- **Avancement** : Terminé (E.164, local, nettoyage, trunk)
- **Description** : Accepter formats locaux/internationaux (`+241…`, `00241…`, `06…`), retourner E.164, format national, format lisible. Gérer le zéro de tête et les anciens formats.
- **Skills** : E.164, regex, Python, éventuelle comparaison avec `phonenumbers`.

### WAT-014 – Validation de longueur et préfixes
- **Priorité / Taille** : P0 / M
- **Avancement** : Terminé (validation longueur et préfixes)
- **Description** : Valider selon le plan du pays, distinguer mobile/fixe, renvoyer la raison précise de l'invalidité.
- **Skills** : plans de numérotation, TDD.

### WAT-015 – Détection probable de l'opérateur
- **Priorité / Taille** : P1 / M
- **Avancement** : Terminé (détection opérateur avec avertissement portabilité)
- **Description** : Retourner `operateur_probable` avec `confiance` (haute/moyenne/faible) et avertissement sur la portabilité.
- **Skills** : télécoms, conception de heuristiques.

### WAT-016 – Compatibilité Mobile Money
- **Priorité / Taille** : P1 / M
- **Avancement** : Terminé (compatibilité Mobile Money)
- **Description** : Lister les services Mobile Money probablement compatibles, marqués indicatifs.
- **Skills** : fintech/Mobile Money, modélisation.

### WAT-017 – Enregistrement de l'outil MCP et docs
- **Priorité / Taille** : P1 / S
- **Avancement** : Terminé (outil MCP valider_telephone enregistré et testé)
- **Description** : Exposer l'outil avec description bilingue, exemples d'appel et de réponse dans la doc.
- **Skills** : FastMCP, rédaction technique.

---

## E4 – Outil `convertir_devise`

### WAT-018 – Conversion à parité fixe XAF/XOF/EUR
- **Priorité / Taille** : P0 / M
- **Avancement** : Terminé
- **Description** : Parité 1 EUR = 655,957 XAF/XOF, calcul exact avec `Decimal`. XAF↔XOF à 1:1.
- **Skills** : Python `decimal`, finance de base, zone franc CFA.

### WAT-019 – Gestion USD avec taux de repli daté
- **Priorité / Taille** : P1 / M
- **Avancement** : Terminé (data/rates.yaml + repli indicatif daté + avertissement)
- **Description** : Fichier `data/rates.yaml` avec taux USD/EUR, date et source. Retourner `date_taux` et avertissement de péremption au-delà d'un seuil (ex. 30 jours).
- **Skills** : finance, modélisation de données.

### WAT-020 – Taux personnalisé optionnel
- **Priorité / Taille** : P1 / S
- **Avancement** : Terminé (paramètre 'taux' validé avec surchage)
- **Description** : Paramètre `taux` pour surcharger le taux USD ; validation et traçabilité dans la réponse.
- **Skills** : conception d'API, validation d'entrées.

### WAT-021 – Arrondi et formatage
- **Priorité / Taille** : P1 / S
- **Avancement** : Terminé (arrondi 0 décimale XAF/XOF, 2 décimales EUR/USD, max 10^15)
- **Description** : Pas de décimales pour XAF/XOF, 2 pour EUR/USD, arrondi bancaire ou commercial documenté, validation des montants (négatifs, NaN, énormes).
- **Skills** : `decimal`, tests de cas limites.

### WAT-022 – Enregistrement de l'outil MCP et docs
- **Priorité / Taille** : P1 / S
- **Avancement** : Terminé (outil MCP convertir_devise enregistré avec doc bilingue)
- **Description** : Exposer l'outil, documenter limites et précision.
- **Skills** : FastMCP, rédaction technique.

---

## E5 – Outil `info_pays`

### WAT-023 – Infos de base du pays
- **Priorité / Taille** : P0 / S
- **Avancement** : Terminé (indicatif, devise, langues, fuseaux IANA)
- **Description** : Retourner indicatif, devise (code, nom, symbole), langues officielles, capitale, fuseau(x) horaire(s) IANA.
- **Skills** : Python, données géographiques.

### WAT-024 – Jours fériés fixes
- **Priorité / Taille** : P1 / M
- **Avancement** : Terminé (jours fériés à date fixe)
- **Description** : Jours fériés à date fixe par pays, paramètre `annee`.
- **Skills** : recherche documentaire, droit du travail local.

### WAT-025 – Fêtes mobiles (chrétiennes et musulmanes)
- **Priorité / Taille** : P1 / L
- **Avancement** : Terminé (Pâques/Ascension/Pentecôte calculés via Butcher + fêtes musulmanes tabulées)
- **Description** : Calcul de Pâques, Ascension, Pentecôte ; fêtes islamiques (Aïd, Tabaski, Mawlid) par table annuelle stockée, avec mention que la date dépend de l'observation lunaire.
- **Skills** : algorithmes de calendrier (Computus), calendrier hégirien, rigueur sur l'incertitude.

### WAT-026 – Fuseaux et heure locale
- **Priorité / Taille** : P2 / S
- **Avancement** : Terminé (heure locale et décalage UTC dynamique via zoneinfo)
- **Description** : Retourner heure locale actuelle et décalage UTC (via `zoneinfo`, hors ligne).
- **Skills** : Python `zoneinfo`.

### WAT-027 – Enregistrement de l'outil MCP et docs
- **Priorité / Taille** : P1 / S
- **Avancement** : Terminé (outil MCP info_pays avec filtrage des champs)
- **Description** : Exposer l'outil, paramètre `champs` optionnel pour limiter la réponse.
- **Skills** : FastMCP, rédaction technique.

---

## E6 – Qualité & CI

### WAT-028 – Tests unitaires et jeux de cas réels
- **Priorité / Taille** : P0 / L
- **Avancement** : Terminé (127 tests unitaires, 97% de couverture de code)
- **Description** : pytest, cas valides/invalides par pays, cas limites, couverture ≥ 90 % sur la logique.
- **Skills** : pytest, TDD, connaissance du domaine.

### WAT-029 – CI GitHub Actions
- **Priorité / Taille** : P1 / M
- **Avancement** : Terminé (.github/workflows/ci.yml avec matrice Python 3.10-3.13, ruff, mypy)
- **Description** : Lint (ruff), typage (mypy), tests, matrice Python 3.10-3.13.
- **Skills** : GitHub Actions, ruff, mypy.

### WAT-030 – Validation CI des fichiers de données
- **Priorité / Taille** : P1 / M
- **Avancement** : Terminé (scripts/validate_data.py exécuté en CI)
- **Description** : Job qui valide chaque fichier pays contre le schéma, vérifie `sources` non vide et `derniere_verification` présent.
- **Skills** : JSON Schema, CI.

### WAT-031 – Tests d'intégration MCP
- **Priorité / Taille** : P1 / M
- **Avancement** : Terminé (tests/test_mcp_integration.py avec transport stdio réel)
- **Description** : Tests via client MCP (stdio) vérifiant listing et appels des 3 outils, et garantie d'absence d'accès réseau.
- **Skills** : protocole MCP, tests d'intégration.

---

## E7 – Contribution communautaire

### WAT-032 – CONTRIBUTING.md
- **Priorité / Taille** : P1 / S
- **Avancement** : Terminé (CONTRIBUTING.md avec guide d'ajout pas à pas)
- **Description** : Guide court : ajouter un pays, corriger une plage, sourcer, lancer les tests.
- **Skills** : rédaction technique, animation de communauté.

### WAT-033 – Gabarits d'issues et de PR
- **Priorité / Taille** : P1 / S
- **Avancement** : Terminé (templates GitHub d'issues et de PR)
- **Description** : Templates : « Ajouter un pays », « Donnée erronée », « Nouvel outil ».
- **Skills** : GitHub, gestion de communauté.

### WAT-034 – Template de pays et script de scaffolding
- **Priorité / Taille** : P2 / M
- **Avancement** : Terminé (scripts/scaffold_country.py)
- **Description** : Commande `make new-country ISO=XX` générant le fichier pré-rempli.
- **Skills** : Python CLI, outillage développeur.

### WAT-035 – Code de conduite et gouvernance
- **Priorité / Taille** : P2 / S
- **Avancement** : Terminé (CODE_OF_CONDUCT.md)
- **Description** : Code de conduite, rôles de mainteneurs, processus de revue des données.
- **Skills** : gouvernance open source.

---

## E8 – Distribution & release

### WAT-036 – README complet
- **Priorité / Taille** : P1 / M
- **Avancement** : À faire
- **Description** : Présentation, installation en 1 commande, configuration Claude Desktop/Cursor/etc., exemples en FR, démonstration.
- **Skills** : rédaction technique, DX.

### WAT-037 – Publication PyPI et `uvx`
- **Priorité / Taille** : P1 / M
- **Avancement** : À faire
- **Description** : Package publié, lancement par `uvx wezas-africa-toolkit`, versionnage SemVer, changelog.
- **Skills** : packaging Python, PyPI, release management.

### WAT-038 – Image Docker (optionnel)
- **Priorité / Taille** : P2 / S
- **Avancement** : À faire
- **Description** : Image légère pour usage conteneurisé.
- **Skills** : Docker.

### WAT-039 – Référencement dans les annuaires MCP et annonce
- **Priorité / Taille** : P2 / S
- **Avancement** : À faire
- **Description** : Soumission aux registres MCP, post d'annonce communauté, démo avec MedRDV/StockR/Gabozon.
- **Skills** : communication, marketing développeur.

---

## E9 – Outils bonus (après v0.1)

### WAT-040 – `formater_montant`
- **Priorité / Taille** : P2 / S
- **Avancement** : À faire
- **Description** : Format local (1 000 FCFA), séparateurs et symboles par pays.
- **Skills** : i18n, formatage.

### WAT-041 – `calculer_tva`
- **Priorité / Taille** : P2 / M
- **Avancement** : À faire
- **Description** : Taux de TVA par pays, calcul HT/TTC, sources fiscales datées.
- **Skills** : fiscalité africaine, recherche documentaire.

### WAT-042 – `lister_operateurs`
- **Priorité / Taille** : P2 / S
- **Avancement** : À faire
- **Description** : Opérateurs et services Mobile Money par pays, réutilisant WAT-012.
- **Skills** : FastMCP, modélisation de données.

---

## E10 – Volet 2 (en ligne, optionnel)

### WAT-043 – Architecture de séparation volet 1 / volet 2
- **Priorité / Taille** : P2 / M
- **Avancement** : À faire
- **Description** : Le volet 1 doit fonctionner seul. Volet 2 activé par extra (`pip install wezas-africa-toolkit[online]`) ou variable d'environnement.
- **Skills** : architecture logicielle, packaging.

### WAT-044 – Rafraîchissement des taux de change en ligne
- **Priorité / Taille** : P2 / M
- **Avancement** : À faire
- **Description** : Récupération du taux USD/EUR via API publique, avec cache et repli sur les données hors ligne.
- **Skills** : HTTP async, gestion de cache, résilience.

### WAT-045 – Définition du contenu du volet 2
- **Priorité / Taille** : P2 / S
- **Avancement** : À faire
- **Description** : Spécifier les outils en ligne (à définir avec le product owner) et leurs besoins en clés API.
- **Skills** : product ownership, sécurité des secrets.

---

## Jalons

| Version | Contenu | Tickets |
|---|---|---|
| **v0.1** | 3 outils, 12 pays, CI, publication | P0 + P1 des epics E0-E8 |
| **v0.2** | Outils bonus, outils de contribution | E9, WAT-034, 035 |
| **v1.0** | Volet 2, Docker, annuaires | E10, WAT-038, 039 |
