# wezas-sdk (Python)

SDK Python officiel pour le **Wezas Africa Toolkit**.
Permet de valider et manipuler facilement les numéros de téléphones, devises, TVA, taxes transactionnelles et identifiants fiscaux en Afrique.

## Installation

```bash
pip install wezas-sdk
```

## Utilisation rapide

```python
from wezas import WezasClient

# Initialisation avec votre clé API Wezas
client = WezasClient(
    base_url="https://api.wezas.africa",
    api_key="wz_live_..."
)

# 1. Validation de téléphone
res = client.valider_telephone(pays="GA", numero="077123456")
print(res.data)

# 2. Conversion de devises
conv_res = client.convertir_devise(montant=10000, de="XOF", vers="EUR")
print(conv_res.data)
```
