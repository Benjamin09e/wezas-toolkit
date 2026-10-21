# Guide de contribution au Wezas Africa Toolkit

Bienvenue ! Le **Wezas Africa Toolkit** est un projet open source communautaire (licence MIT) pensé par et pour les builders africains.

Le principe fondamental du projet est strict :
> [!IMPORTANT]
> **100% hors ligne, zéro clé API et rigoureusement sourcé.**
> Pour un outil financier ou télécom, une donnée erronée coûte cher. Chaque donnée (plan de numérotation, barème de TVA, jours fériés, opérateurs Mobile Money) doit provenir d'une autorité officielle (régulateur télécom, Journal Officiel, Direction des Impôts, Banque Centrale, UIT) et comporter une date de vérification récente.

---

## Sommaire

1. [Structure d'un pays](#1-structure-d-un-pays)
2. [Étape 1 : Créer le fichier du pays](#étape-1--créer-le-fichier-du-pays)
3. [Étape 2 : Ajouter la fiscalité (TVA) et les opérateurs](#étape-2--ajouter-la-fiscalité-tva-et-les-opérateurs)
4. [Étape 3 : Écrire les tests unitaires](#étape-3--écrire-les-tests-unitaires)
5. [Étape 4 : Valider en local](#étape-4--valider-en-local)
6. [Étape 5 : Soumettre la Pull Request](#étape-5--soumettre-la-pull-request)

---

## 1. Structure d'un pays

Chaque pays est défini par un fichier de données dans `data/countries/<iso2>.yaml` (conforme au schéma JSON défini dans [`data/schema/country.schema.json`](data/schema/country.schema.json)).

### Exemple complet de structure (YAML / JSON compatible) :

```yaml
iso2: MG
iso3: MDG
name:
  fr: Madagascar
  en: Madagascar
capital: Antananarivo
dial_code: "+261"
currency: MGA
languages:
  - mg
  - fr
timezones:
  - Indian/Antananarivo

numbering_plan:
  national_length: 9
  trunk_prefix: "0"
  ranges:
    - type: mobile
      prefixes: ["32", "37"]
      operator: orange-mg
    - type: mobile
      prefixes: ["34"]
      operator: telma-mg
    - type: mobile
      prefixes: ["33"]
      operator: airtel-mg
    - type: fixed
      prefixes: ["20"]

mobile_money:
  - "Orange Money"
  - "Mvola"
  - "Airtel Money"

holidays:
  fixed:
    - date: "01-01"
      name: {fr: "Jour de l'An", en: "New Year's Day"}
    - date: "03-29"
      name: {fr: "Jour des Martyrs", en: "Martyrs' Day"}
    - date: "05-01"
      name: {fr: "Fête du Travail", en: "Labour Day"}
    - date: "06-26"
      name: {fr: "Fête de l'Indépendance", en: "Independence Day"}
    - date: "08-15"
      name: {fr: "Assomption", en: "Assumption"}
    - date: "11-01"
      name: {fr: "Toussaint", en: "All Saints' Day"}
    - date: "12-25"
      name: {fr: "Noël", en: "Christmas"}
  easter_based:
    - offset_days: 1
      name: {fr: "Lundi de Pâques", en: "Easter Monday"}
    - offset_days: 39
      name: {fr: "Ascension", en: "Ascension"}
    - offset_days: 50
      name: {fr: "Lundi de Pentecôte", en: "Whit Monday"}
  islamic:
    2026:
      - date: 2026-03-20
        name: {fr: "Aïd el-Fitr", en: "Eid al-Fitr"}
      - date: 2026-05-27
        name: {fr: "Aïd al-Adha", en: "Eid al-Adha"}

sources:
  - label: "ARTEC Madagascar / Plan National de Numérotation"
    url: "https://www.artec.mg"
last_verified: 2026-10-22
```

---

## Étape 1 : Créer le fichier du pays

Vous pouvez initialiser rapidement le fichier grâce au script d'échafaudage :

```bash
uv run python scripts/scaffold_country.py --iso MG --nom Madagascar
```

Renseignez avec précision :
1. **L'indicatif et le plan de numérotation** selon les décisions officielles du régulateur national des télécoms.
2. **Les jours fériés** : les fêtes fixes, les fêtes mobiles basées sur Pâques (`easter_based`) et les fêtes musulmanes (`islamic`).
3. **Le bloc `sources`** obligatoire : URL du régulateur ou de la loi nationale.
4. **`last_verified`** : la date du jour au format `YYYY-MM-DD`.

Synchronisez également le fichier dans le package python embarqué :
```bash
cp data/countries/mg.yaml packages/core/wezas_core/data/countries/
```

---

## Étape 2 : Ajouter la fiscalité (TVA) et les opérateurs

### 1. TVA (`data/vat.yaml` et `packages/core/wezas_core/data/vat.yaml`)
Ajoutez la règle fiscale du pays :
```yaml
  MG:
    standard: 0.20
    reduit: 0.05
    nom_local: "TVA"
    source: "Direction Générale des Impôts de Madagascar - Code Général des Impôts (20%)"
    derniere_verification: "2026-10-22"
```

### 2. Opérateurs (`data/operators.yaml` et `packages/core/wezas_core/data/operators.yaml`)
Déclarez les opérateurs du pays et leurs solutions Mobile Money :
```yaml
  orange-mg:
    nom: "Orange Madagascar"
    pays: ["MG"]
    mobile_money: ["Orange Money"]
  telma-mg:
    nom: "Telma Madagascar"
    pays: ["MG"]
    mobile_money: ["Mvola"]
  airtel-mg:
    nom: "Airtel Madagascar"
    pays: ["MG"]
    mobile_money: ["Airtel Money"]
```

---

## Étape 3 : Écrire les tests unitaires

Chaque nouveau pays doit être accompagné de tests unitaires pour garantir qu'aucune régression n'intervienne.

### 1. Test des informations pays (`tests/test_country.py`)
Ajoutez une fonction de test pour vérifier la résolution du pays et ses données clés :

```python
def test_get_country_info_madagascar():
    res = get_country_info("Madagascar", annee=2026).model_dump(mode="json")
    assert res["ok"] is True
    data = res["data"]
    assert data["indicatif"] == "+261"
    assert data["devise"]["code"] == "MGA"
    assert data["pays"]["capitale"] == "Antananarivo"
    assert res["source"] is not None
    assert res["derniere_verification"] is not None
```

### 2. Test de validation du numéro de téléphone (`tests/test_phone.py`)
Ajoutez des assertions testant à la fois un numéro valide, le format E.164, la détection de l'opérateur et un numéro erroné :

```python
def test_validate_phone_madagascar():
    # Numéro mobile valide avec préfixe national '0'
    res = validate_phone("MG", "032 12 345 67").model_dump(mode="json")
    assert res["ok"] is True
    assert res["data"]["e164"] == "+261321234567"
    assert res["data"]["operateur_probable"] == "Orange Madagascar"
    assert "Orange Money" in res["data"]["mobile_money"]

    # Numéro trop court -> doit échouer proprement
    res_bad = validate_phone("MG", "032 12").model_dump(mode="json")
    assert res_bad["ok"] is False
    assert res_bad["error"]["code"] == "NUMERO_INVALIDE"
```

### 3. Test de calcul de TVA (`tests/test_vat.py`)
Vérifiez le calcul HT vers TTC selon le barème officiel du pays :

```python
def test_vat_madagascar():
    res = calculate_vat(100000, "MG", mode="ht").model_dump(mode="json")
    assert res["ok"] is True
    # 100 000 MGA + 20% TVA = 120 000 MGA
    assert res["data"]["montant_ttc"] == "120000.00"
    assert res["data"]["taux_pourcentage"] == "20%"
    assert res["derniere_verification"] is not None
```

---

## Étape 4 : Valider en local

Avant de pousser votre code ou d'ouvrir une PR, exécutez la suite de contrôle :

```bash
# 1. Valider le schéma JSON et l'intégrité des fichiers YAML
uv run python scripts/validate_data.py

# 2. Synchroniser les fichiers dans le paquet core
cp data/countries/*.yaml packages/core/wezas_core/data/countries/
cp data/vat.yaml packages/core/wezas_core/data/vat.yaml
cp data/operators.yaml packages/core/wezas_core/data/operators.yaml

# 3. Lancer le linter et le vérificateur de types
uv run ruff check .
uv run mypy packages

# 4. Lancer l'intégralité de la suite de tests
uv run pytest
```

Tous les tests doivent être au vert (`passed`).

---

## Étape 5 : Soumettre la Pull Request

1. Créez une branche descriptive :
   ```bash
   git checkout -b feat/add-country-madagascar
   ```
2. Commitez vos modifications avec des commits conventionnels :
   ```bash
   git add data/ packages/ tests/
   git commit -m "feat(data): add Madagascar (MG) numbering plan, VAT and holidays"
   ```
3. Poussez votre branche sur votre fork et ouvrez une Pull Request sur le dépôt principal `Benjamin09e/wezas-toolkit`.
4. Renseignez dans la description de la PR le résumé des données ajoutées et les liens vers les textes légaux officiels.
5. La CI GitHub Actions exécutera automatiquement la validation du schéma et les tests multi-versions Python (3.10 à 3.13).

Merci pour votre contribution à l'écosystème tech africain ! 🚀
