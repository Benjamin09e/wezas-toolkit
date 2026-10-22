from fastapi.testclient import TestClient
from wezas_api.main import app

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "Wezas Africa API" in data["service"]


def test_phone_validation_endpoint():
    response = client.post("/v1/phone/validate", json={"pays": "GA", "numero": "+24177123456"})
    assert response.status_code == 200
    res = response.json()
    assert res["data"]["valide"] is True
    assert res["data"]["pays"]["iso2"] == "GA"


def test_currency_conversion_endpoint():
    response = client.post(
        "/v1/currency/convert",
        json={"montant": 10000, "de": "XOF", "vers": "EUR"},
    )
    assert response.status_code == 200
    res = response.json()
    assert res["data"]["resultat"] is not None
    assert res["confiance"] == "haute"


def test_vat_endpoint():
    response = client.post(
        "/v1/tax/vat",
        json={"montant": 10000, "pays": "SN", "type_calcul": "HT_VERS_TTC"},
    )
    assert response.status_code == 200
    res = response.json()
    assert "18" in str(res["data"]["taux_pourcentage"])
