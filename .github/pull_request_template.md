## Description des changements
<!-- Décrivez clairement les modifications apportées (ex: ajout du pays Rwanda, correction des préfixes Togo...) -->

## Type de modification
- [ ] Ajout d'un nouveau pays
- [ ] Correction de plan de numérotation / opérateur
- [ ] Mise à jour des jours fériés / Mobile Money
- [ ] Amélioration de code / tests / documentation

## Sources officielles
<!-- Indiquez impérativement la source de vos données (régulateur ARCEP/ART, UIT/ITU, texte légal) -->
- Source : 

## Checklist de validation
- [ ] Le fichier respecte le schéma JSON (`data/schema/country.schema.json`)
- [ ] Le script `uv run python scripts/validate_data.py` s'exécute sans erreur
- [ ] Les tests passent en local (`uv run pytest`)
- [ ] `last_verified` est mis à jour avec la date du jour
