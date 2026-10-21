# Décisions de cadrage (WAT-001)

Date : 2026-10-21 · Statut : **validé par le product owner**

| # | Sujet | Décision | Raison |
|---|---|---|---|
| D1 | Langage / framework serveur | Python + **FastMCP** | Choix PO ; écosystème MCP mature, `Decimal` natif |
| D2 | Front | **Next.js** (App Router, TypeScript) | Choix PO ; portail, playground, espace membre |
| D3 | Base de données | **MongoDB**, réservée au portail et au volet 2 | Choix PO ; le volet 1 reste hors ligne (cf. `archi.md`, ADR-3) |
| D4 | Licence | **MIT** | Adoption maximale, contribution facile |
| D5 | Pays v0.1 | 12 pays : Gabon, Cameroun, Congo, Tchad, RCA, Guinée équatoriale (XAF) ; Sénégal, Côte d'Ivoire, Mali, Bénin, Togo, Burkina Faso (XOF) | Couvre les deux zones CFA |
| D6 | Langue des outils MCP | Noms en **français** (`valider_telephone`, `convertir_devise`, `info_pays`), descriptions et messages bilingues FR/EN | Cohérence avec la communauté, découvrabilité |
| D7 | Contenu du volet 2 (v1.0) | Taux de change rafraîchis, API hébergée avec clés API, contributions via le portail | Choix PO |
| D8 | Principe d'architecture | Le volet 1 fonctionne seul : sans réseau, sans clé, sans base | Argument différenciant du projet |

## Conséquences
- WAT-003 peut démarrer avec Python/FastMCP et la licence MIT.
- WAT-010 et WAT-011 couvrent les 12 pays listés en D5.
- WAT-045 est précisé par D7.
- Tickets à ajouter : portail Next.js, API hébergée, MongoDB (voir `archi.md`, section 13).
