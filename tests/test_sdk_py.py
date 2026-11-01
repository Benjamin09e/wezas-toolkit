"""Tests unitaires et d'intégration pour le SDK Python Wezas."""

import httpx
import pytest
from wezas import AsyncWezasClient, WezasClient
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

    # 2. Test conversion devise
    conv_res = client.convertir_devise(montant=1000, de="XOF", vers="EUR")
    assert conv_res.ok is True
    assert conv_res.data["resultat"] is not None


@pytest.mark.anyio
async def test_sdk_python_async_client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as http_client:
        client = AsyncWezasClient(
            base_url="http://testserver",
            http_client=http_client,
        )

        phone_res = await client.valider_telephone(pays="GA", numero="+24177123456")
        assert phone_res.ok is True
        assert phone_res.data["valide"] is True
