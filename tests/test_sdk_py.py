"""Tests unitaires et d'intégration pour le SDK Python Wezas."""

import pytest
import httpx
from wezas import WezasClient, AsyncWezasClient
from wezas_api.main import app


def test_sdk_python_sync_client():
    from fastapi.testclient import TestClient

    # Utilisation d'un wrapper basé sur TestClient pour le client synchrone
    class TestClientAdapter:
        def __init__(self, tc: TestClient):
            self.tc = tc

        def post(self, url: str, json: dict, headers: dict):
            # TestClient attend le chemin relatif ou absolu
            path = url.replace("http://testserver", "")
            return self.tc.post(path, json=json, headers=headers)

    tc = TestClient(app)
    adapter = TestClientAdapter(tc)

    client = WezasClient(
        base_url="http://testserver",
        api_key=None,
        http_client=adapter,  # type: ignore
    )

    # 1. Test validation téléphone
    phone_res = client.valider_telephone(pays="GA", numero="+24177123456")
    assert phone_res.ok is True
    assert phone_res.data["valide"] is True
    assert phone_res.data["pays"]["iso2"] == "GA"

    # 2. Test validation de carte bancaire GIMAC
    card_res = client.valider_carte(numero_carte="5054851234567899")
    assert card_res.ok is True
    assert card_res.data["valide"] is True
    assert card_res.data["reseau"]["id"] == "gimac"
    assert card_res.data["pan_masque"] == "505485******7899"

    # 3. Test génération QR Code EMVCo
    qr_res = client.generer_qr_emvco(
        nom_marchand="Boutique Dakar",
        ville_marchand="Dakar",
        pays="SN",
        compte_marchand="ACC123",
        devise="XOF",
        montant=5000,
        reference="CMD-01",
    )
    assert qr_res.ok is True
    assert qr_res.data["payload"].startswith("000201")
    assert qr_res.data["crc"] is not None

    # 4. Test décodage QR Code Wave
    decode_res = client.decoder_qr_paiement(payload="WAVE:+221770001122:3000:REF1")
    assert decode_res.ok is True
    assert decode_res.data["type"] == "mobile_money_direct"
    assert decode_res.data["operateur"] == "Wave"


@pytest.mark.anyio
async def test_sdk_python_async_client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as http_client:
        client = AsyncWezasClient(
            base_url="http://testserver",
            http_client=http_client,
        )

        card_res = await client.valider_carte(numero_carte="5058011234567896")
        assert card_res.ok is True
        assert card_res.data["valide"] is True
        assert card_res.data["reseau"]["id"] == "gim_uemoa"
