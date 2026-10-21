# Contrat de sortie (WAT-002)

Tous les outils (`valider_telephone`, `convertir_devise`, `info_pays`, et les suivants) renvoient la **même enveloppe JSON**. Les agents peuvent ainsi lire l'incertitude et les erreurs de façon uniforme.

- Implémentation : `packages/core/wezas_core/envelope.py`
- Schéma JSON : [`data/schema/envelope.schema.json`](../data/schema/envelope.schema.json) (généré par `scripts/export_schema.py`)

## Champs

| Champ | Type | Description |
|---|---|---|
| `ok` | booléen | `true` si l'outil a produit un résultat, `false` sinon |
| `data` | objet \| `null` | Résultat propre à l'outil. Présent si et seulement si `ok = true` |
| `error` | objet \| `null` | Erreur. Présente si et seulement si `ok = false` |
| `source` | texte \| `null` | Origine de la donnée (régulateur, texte officiel, « parité fixe », etc.) |
| `derniere_verification` | date ISO \| `null` | Dernière vérification humaine de la donnée |
| `confiance` | `haute` \| `moyenne` \| `faible` \| `null` | Fiabilité du résultat |
| `avertissements` | liste | Remarques non bloquantes (liste vide si aucune) |

**Règle** : `ok = true` exige `data` et interdit `error` ; `ok = false` exige `error` et interdit `data`.

### `avertissements[]`
```json
{ "code": "TAUX_PERIME", "message": { "fr": "...", "en": "..." } }
```
`code` : MAJUSCULES, chiffres et `_`.

### `error`
```json
{
  "code": "PAYS_INCONNU",
  "message": { "fr": "...", "en": "..." },
  "details": {},
  "suggestions": []
}
```

## Codes d'erreur

| Code | Cas |
|---|---|
| `ENTREE_INVALIDE` | Paramètre manquant, mal typé ou mal formé |
| `PAYS_INCONNU` | Pays absent des données ou non reconnu (avec suggestions) |
| `NUMERO_INVALIDE` | Numéro illisible (un numéro bien lu mais non valide renvoie `ok = true` et `valide = false`) |
| `DEVISE_NON_SUPPORTEE` | Devise hors XAF / XOF / EUR / USD |
| `MONTANT_INVALIDE` | Négatif, non numérique, NaN, trop grand |
| `TAUX_INVALIDE` | Taux personnalisé nul, négatif ou aberrant |
| `DONNEES_INDISPONIBLES` | Donnée absente pour ce pays ou cette année |
| `ERREUR_INTERNE` | Erreur inattendue |

Les messages sont toujours bilingues (`fr`, `en`). Les messages d'erreur ne contiennent jamais le numéro de téléphone saisi en clair dans les logs.

## Niveaux de confiance

| Valeur | Sens | Exemple |
|---|---|---|
| `haute` | Donnée exacte ou règle déterministe | Parité XAF/EUR, format E.164 |
| `moyenne` | Donnée sourcée mais pouvant évoluer | Plage d'opérateur, jour férié fixe |
| `faible` | Heuristique ou donnée possiblement périmée | Opérateur après portabilité, taux USD ancien, fête lunaire |

## Exemples

### Succès
```json
{
  "ok": true,
  "data": { "valide": true, "e164": "+24106123456", "operateur_probable": "Libertis" },
  "error": null,
  "source": "ARCEP Gabon",
  "derniere_verification": "2026-10-21",
  "confiance": "moyenne",
  "avertissements": [
    {
      "code": "PORTABILITE",
      "message": {
        "fr": "L'opérateur peut avoir changé (portabilité).",
        "en": "The operator may have changed (number portability)."
      }
    }
  ]
}
```
Les valeurs de `data` ci-dessus sont illustratives : le contenu réel de `data` est défini par chaque outil.

### Échec
```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "PAYS_INCONNU",
    "message": { "fr": "Pays inconnu : « Gabn ».", "en": "Unknown country: \"Gabn\"." },
    "details": { "entree": "Gabn" },
    "suggestions": ["GA"]
  },
  "source": null,
  "derniere_verification": null,
  "confiance": null,
  "avertissements": []
}
```

## Règles pour les outils
1. Un outil renvoie toujours cette enveloppe, jamais une exception brute.
2. Une entrée valide au sens du format mais « non valide » métier (ex. numéro de longueur incorrecte) est un **succès** avec `valide = false` et la raison dans `data`.
3. Toute donnée datée ou incertaine renseigne `derniere_verification`, `confiance` et `avertissements`.
4. Les champs de `data` sont en `snake_case` français, sans accents.
