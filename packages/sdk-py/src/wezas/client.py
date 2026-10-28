"""Clients synchrone et asynchrone pour l'API Wezas Africa Toolkit."""

from __future__ import annotations

from typing import Any

import httpx

from wezas.models import WezasResponse


class BaseClient:
    def __init__(
        self,
        base_url: str = "https://api.wezas.africa",
        api_key: str | None = None,
        timeout: float = 10.0,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout

    def _get_headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        if self.api_key:
            headers["X-API-Key"] = self.api_key
        return headers


class WezasClient(BaseClient):
    """Client synchrone basé sur httpx.Client."""

    def __init__(
        self,
        base_url: str = "https://api.wezas.africa",
        api_key: str | None = None,
        timeout: float = 10.0,
        http_client: httpx.Client | None = None,
    ) -> None:
        super().__init__(base_url=base_url, api_key=api_key, timeout=timeout)
        self._client = http_client or httpx.Client(timeout=self.timeout)

    def _post(self, path: str, json_data: dict[str, Any]) -> WezasResponse[Any]:
        url = f"{self.base_url}{path}"
        response = self._client.post(url, json=json_data, headers=self._get_headers())
        response.raise_for_status()
        return WezasResponse[Any].model_validate(response.json())

    def valider_telephone(self, pays: str, numero: str) -> WezasResponse[dict[str, Any]]:
        return self._post("/v1/phone/validate", {"pays": pays, "numero": numero})

    def convertir_devise(
        self,
        montant: float | str,
        de: str,
        vers: str,
        taux_personnalise: float | None = None,
    ) -> WezasResponse[dict[str, Any]]:
        payload: dict[str, Any] = {"montant": float(montant), "de": de, "vers": vers}
        if taux_personnalise is not None:
            payload["taux_personnalise"] = taux_personnalise
        return self._post("/v1/currency/convert", payload)

    def formater_montant(
        self, montant: float | str, devise: str, pays: str | None = None
    ) -> WezasResponse[dict[str, Any]]:
        return self._post("/v1/currency/format", {"montant": float(montant), "devise": devise, "pays": pays})

    def calculer_tva(
        self,
        montant: float | str,
        pays: str,
        type_calcul: str = "HT_VERS_TTC",
        taux_type: str = "normal",
    ) -> WezasResponse[dict[str, Any]]:
        return self._post(
            "/v1/tax/vat",
            {"montant": float(montant), "pays": pays, "type_calcul": type_calcul, "taux_type": taux_type},
        )

    def calculer_taxe_transaction(
        self,
        pays: str,
        montant: float | str,
        type_taxe: str | None = None,
        cumul_journalier_precedent: float | str = 0,
    ) -> WezasResponse[dict[str, Any]]:
        payload: dict[str, Any] = {
            "pays": pays,
            "montant": float(montant),
            "cumul_journalier_precedent": float(cumul_journalier_precedent),
        }
        if type_taxe:
            payload["type_taxe"] = type_taxe
        return self._post("/v1/tax/transaction/calculate", payload)

    def valider_identifiant_fiscal(self, pays: str, identifiant: str) -> WezasResponse[dict[str, Any]]:
        return self._post("/v1/tax/tin/validate", {"pays": pays, "identifiant": identifiant})

    def valider_rib(
        self, code_banque: str, code_guichet: str, numero_compte: str, cle_rib: str
    ) -> WezasResponse[dict[str, Any]]:
        return self._post(
            "/v1/bank/rib/validate",
            {
                "code_banque": code_banque,
                "code_guichet": code_guichet,
                "numero_compte": numero_compte,
                "cle_rib": cle_rib,
            },
        )

    def valider_nuban(self, code_banque: str, numero_compte: str, pays: str = "NG") -> WezasResponse[dict[str, Any]]:
        return self._post(
            "/v1/bank/nuban/validate",
            {"code_banque": code_banque, "numero_compte": numero_compte, "pays": pays},
        )

    def valider_iban(self, iban: str) -> WezasResponse[dict[str, Any]]:
        return self._post("/v1/bank/iban/validate", {"iban": iban})

    def valider_carte(self, numero_carte: str) -> WezasResponse[dict[str, Any]]:
        return self._post("/v1/bank/card/validate", {"numero_carte": numero_carte})

    def generer_qr_emvco(
        self,
        nom_marchand: str,
        ville_marchand: str,
        pays: str,
        compte_marchand: str,
        devise: str,
        montant: float | str | None = None,
        reference: str | None = None,
    ) -> WezasResponse[dict[str, Any]]:
        payload: dict[str, Any] = {
            "nom_marchand": nom_marchand,
            "ville_marchand": ville_marchand,
            "pays": pays,
            "compte_marchand": compte_marchand,
            "devise": devise,
        }
        if montant is not None:
            payload["montant"] = float(montant)
        if reference is not None:
            payload["reference"] = reference
        return self._post("/v1/payment/qr/emvco/generate", payload)

    def decoder_qr_paiement(self, payload: str) -> WezasResponse[dict[str, Any]]:
        return self._post("/v1/payment/qr/decode", {"payload": payload})


class AsyncWezasClient(BaseClient):
    """Client asynchrone basé sur httpx.AsyncClient."""

    def __init__(
        self,
        base_url: str = "https://api.wezas.africa",
        api_key: str | None = None,
        timeout: float = 10.0,
        http_client: httpx.AsyncClient | None = None,
    ) -> None:
        super().__init__(base_url=base_url, api_key=api_key, timeout=timeout)
        self._client = http_client or httpx.AsyncClient(timeout=self.timeout)

    async def _post(self, path: str, json_data: dict[str, Any]) -> WezasResponse[Any]:
        url = f"{self.base_url}{path}"
        response = await self._client.post(url, json=json_data, headers=self._get_headers())
        response.raise_for_status()
        return WezasResponse[Any].model_validate(response.json())

    async def valider_telephone(self, pays: str, numero: str) -> WezasResponse[dict[str, Any]]:
        return await self._post("/v1/phone/validate", {"pays": pays, "numero": numero})

    async def calculer_taxe_transaction(
        self,
        pays: str,
        montant: float | str,
        type_taxe: str | None = None,
        cumul_journalier_precedent: float | str = 0,
    ) -> WezasResponse[dict[str, Any]]:
        payload: dict[str, Any] = {
            "pays": pays,
            "montant": float(montant),
            "cumul_journalier_precedent": float(cumul_journalier_precedent),
        }
        if type_taxe:
            payload["type_taxe"] = type_taxe
        return await self._post("/v1/tax/transaction/calculate", payload)

    async def valider_carte(self, numero_carte: str) -> WezasResponse[dict[str, Any]]:
        return await self._post("/v1/bank/card/validate", {"numero_carte": numero_carte})

    async def generer_qr_emvco(
        self,
        nom_marchand: str,
        ville_marchand: str,
        pays: str,
        compte_marchand: str,
        devise: str,
        montant: float | str | None = None,
        reference: str | None = None,
    ) -> WezasResponse[dict[str, Any]]:
        payload: dict[str, Any] = {
            "nom_marchand": nom_marchand,
            "ville_marchand": ville_marchand,
            "pays": pays,
            "compte_marchand": compte_marchand,
            "devise": devise,
        }
        if montant is not None:
            payload["montant"] = float(montant)
        if reference is not None:
            payload["reference"] = reference
        return await self._post("/v1/payment/qr/emvco/generate", payload)

    async def decoder_qr_paiement(self, payload: str) -> WezasResponse[dict[str, Any]]:
        return await self._post("/v1/payment/qr/decode", {"payload": payload})
