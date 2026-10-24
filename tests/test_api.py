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


def test_rib_endpoint():
    from wezas_core.rib import compute_rib_key

    code_b = "CI008"
    code_g = "01111"
    compte = "01234567890"
    cle = compute_rib_key(code_b, code_g, compte)

    response = client.post(
        "/v1/bank/rib/validate",
        json={
            "code_banque": code_b,
            "code_guichet": code_g,
            "numero_compte": compte,
            "cle_rib": cle,
        },
    )
    assert response.status_code == 200
    res = response.json()
    assert res["data"]["valide"] is True
    assert res["data"]["banque"]["nom"] == "Société Générale Côte d'Ivoire (SGCI)"


def test_tax_id_endpoint():
    response = client.post(
        "/v1/tax/tin/validate",
        json={"pays": "CI", "identifiant": "1234567 A"},
    )
    assert response.status_code == 200
    res = response.json()
    assert res["ok"] is True
    assert res["data"]["identifiant_formate"] == "1234567 A"
    assert "DGI" in res["data"]["autorite_fiscale"]


def test_nuban_endpoint():
    response = client.post(
        "/v1/bank/nuban/validate",
        json={"code_banque": "044", "numero_compte": "0000014579", "pays": "NG"},
    )
    assert response.status_code == 200
    res = response.json()
    assert res["ok"] is True
    assert res["data"]["valide"] is True
    assert res["data"]["banque"]["nom"] == "Access Bank"


def test_iban_endpoint():
    # Maroc valide
    bban = "011780000012345678901234"
    pre_num = bban + "221000"
    check = 98 - (int(pre_num) % 97)
    valid_iban = f"MA{check:02d}{bban}"

    response = client.post(
        "/v1/bank/iban/validate",
        json={"iban": valid_iban},
    )
    assert response.status_code == 200
    res = response.json()
    assert res["ok"] is True
    assert res["data"]["valide"] is True
    assert res["data"]["pays"]["iso2"] == "MA"


def test_rate_limiting_headers_and_exceeded():
    from wezas_api.rate_limit import RateLimiter

    # Test avec un limiteur dédié pour tester le comportement d'épuisement
    test_limiter = RateLimiter(limit_per_minute=2)
    ok1, rem1, _ = test_limiter.is_allowed("test_client")
    assert ok1 is True
    assert rem1 == 1

    ok2, rem2, _ = test_limiter.is_allowed("test_client")
    assert ok2 is True
    assert rem2 == 0

    ok3, rem3, reset_in = test_limiter.is_allowed("test_client")
    assert ok3 is False
    assert rem3 == 0
    assert reset_in > 0

    # Test des en-têtes HTTP réels via le middleware
    resp = client.get("/v1/country/CI")
    assert resp.status_code == 200
    assert "X-RateLimit-Limit" in resp.headers
    assert "X-RateLimit-Remaining" in resp.headers
    assert "X-RateLimit-Reset" in resp.headers


def test_api_key_lifecycle_create_validate_revoke():
    # 1. Création d'une clé API admin
    create_resp = client.post(
        "/v1/keys/create",
        json={"name": "Test App", "environment": "live", "scopes": ["read:tools", "admin"]},
    )
    assert create_resp.status_code == 200
    key_data = create_resp.json()
    secret_key = key_data["api_key"]
    key_id = key_data["key_id"]
    assert secret_key.startswith("wz_live_")

    # 2. Utilisation de la clé valide
    call_resp = client.get("/v1/country/GA", headers={"X-API-Key": secret_key})
    assert call_resp.status_code == 200

    # 3. Révocation de la clé (avec autorisation admin)
    revoke_resp = client.post(
        "/v1/keys/revoke",
        json={"key_id": key_id},
        headers={"X-API-Key": secret_key},
    )
    assert revoke_resp.status_code == 200
    assert revoke_resp.json()["ok"] is True

    # 4. Appel avec la clé désormais révoquée -> 401
    revoked_call = client.get("/v1/country/GA", headers={"X-API-Key": secret_key})
    assert revoked_call.status_code == 401
    assert revoked_call.json()["detail"]["code"] == "API_KEY_REVOKED_OR_UNKNOWN"


def test_metrics_and_scalar_endpoints():
    # Appel de quelques routes pour peupler les métriques
    client.get("/v1/country/SN")
    client.get("/v1/country/CI")

    metrics_resp = client.get("/metrics")
    assert metrics_resp.status_code == 200
    metrics_data = metrics_resp.json()
    assert metrics_data["ok"] is True
    assert metrics_data["metrics"]["total_requests"] >= 2
    assert "SN" in metrics_data["metrics"]["requests_by_country"]
    assert "CI" in metrics_data["metrics"]["requests_by_country"]

    # Test documentation Scalar
    scalar_resp = client.get("/scalar")
    assert scalar_resp.status_code == 200
    assert "@scalar/api-reference" in scalar_resp.text
