# wezas-sdk (Python)

SDK Python officiel pour le **Wezas Africa Toolkit**.
Permet de valider et manipuler facilement les numéros de téléphones, devises, RIB, NUBAN, IBAN, cartes bancaires (GIMAC, GIM-UEMOA, Verve) et QR Codes EMVCo/Mobile Money en Afrique.

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

# 2. Validation de carte bancaire (GIMAC, GIM-UEMOA, Verve, Visa...)
card_res = client.valider_carte(numero_carte="5054851234567899")
print(card_res.data["reseau"]["nom"])  # GIMAC

# 3. Génération de QR Code EMVCo
qr_res = client.generer_qr_emvco(
    nom_marchand="Boutique Dakar",
    ville_marchand="Dakar",
    pays="SN",
    compte_marchand="ACC123",
    devise="XOF",
    montant=5000,
)
print(qr_res.data["payload"])
```
