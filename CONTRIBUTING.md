# Guide de contribution au Wezas Africa Toolkit

Bienvenue ! Le Wezas Africa Toolkit est un projet open source communautaire pensé par et pour les builders africains.

Le principe clé du projet est simple : **le volet 1 fonctionne 100% hors ligne et sans clé API**. Les données (plans télécom, jours fériés, opérateurs Mobile Money) sont embarquées sous forme de fichiers YAML versionnés et vérifiables.

---

## Comment contribuer ?

Vous pouvez contribuer de plusieurs manières :
1. **Ajouter un nouveau pays africain** qui n'est pas encore couvert.
2. **Corriger ou mettre à jour un plan de numérotation** (ex. changement d'opérateur, nouvelle plage ARCEP, passage de 8 à 9 ou 10 chiffres).
3. **Mettre à jour les jours fériés** ou les services Mobile Money disponibles.
4. **Proposer ou améliorer les outils logiciels**.

---

## Règle d'or : Rigueur et Sourçage

> [!IMPORTANT]
> **Aucune donnée inventée.** Chaque fichier de pays (`data/countries/<iso2>.yaml`) doit impérativement comporter au moins une **source officielle ou vérifiable** dans le champ `sources` (ex. régulateur national ARCEP/ART, Union Internationale des Télécommunications UIT/ITU, Journal Officiel, etc.) et une date de vérification `last_verified`.

---

## Ajouter un pays étape par étape

### 1. Utiliser le script de génération automatique
Un script interactif permet d'initialiser rapidement un gabarit pré-rempli :
```bash
uv run python scripts/scaffold_country.py --iso GA --nom Gabon
```
Le fichier sera créé dans `data/countries/<iso>.yaml`.

### 2. Renseigner les données
Suivre le schéma JSON documenté dans [`data/schema/country.schema.json`](data/schema/country.schema.json) :
- `iso2` (ex. `GA`) et `iso3` (ex. `GAB`).
- `dial_code` : indicatif international (ex. `+241`).
- `currency` : code ISO-4217 (ex. `XAF`, `XOF`).
- `numbering_plan` :
  - `national_length` : nombre de chiffres hors indicatif.
  - `trunk_prefix` : préfixe local éventuel (souvent `0`).
  - `ranges` : liste des préfixes par opérateur (`type: mobile` ou `type: fixed`).
- `mobile_money` : liste des services disponibles dans le pays.
- `holidays` : jours fériés à date fixe (`fixed`), décalages par rapport à Pâques (`easter_based`) et fêtes musulmanes (`islamic`).
- `sources` : URL ou référence officielle.

### 3. Valider vos modifications en local
Avant de soumettre votre Pull Request, lancez les vérifications automatiques :
```bash
# 1. Valider la syntaxe et le schéma des fichiers de données
uv run python scripts/validate_data.py

# 2. Synchroniser les données dans le package embarqué
cp -r data/countries/*.yaml packages/core/wezas_core/data/countries/
cp data/operators.yaml packages/core/wezas_core/data/

# 3. Lancer le linter et les tests unitaires
uv run ruff check .
uv run mypy packages
uv run pytest
```

---

## Cycle de vie d'une Pull Request (PR)

1. Forkez le dépôt et créez une branche descriptive : `git checkout -b feat/add-country-madagascar`.
2. Ajoutez vos modifications et commitez avec des messages conventionnels (`feat: add Madagascar country data`).
3. Ouvrez une Pull Request sur GitHub en précisant le contexte et les sources.
4. Les tests d'intégration continue (CI) valident automatiquement le schéma YAML, le linting et les tests multi-versions Python.
5. Après revue et approbation par les mainteneurs, la PR est fusionnée et incluse dans la prochaine release du package.
