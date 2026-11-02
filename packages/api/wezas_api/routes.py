
from typing import Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from wezas_core.country import get_country_info
from wezas_core.currency import convert as convert_currency
from wezas_core.format_amount import format_amount
from wezas_core.phone import validate_phone
from wezas_core.taxes import calculate_transaction_tax
from wezas_core.tin import validate_tax_id
from wezas_core.vat import calculate_vat

from wezas_api.auth import require_scope, verify_api_key
from wezas_api.keys import ApiKeyRecord, ScopeType, api_key_repo

router = APIRouter(prefix="/v1", tags=["Outils"])
admin_required = Depends(require_scope("admin"))


class CreateApiKeyRequest(BaseModel):
    name: str = Field(..., description="Nom de l'application ou développeur")
    environment: Literal["live", "test"] = Field("live", description="'live' ou 'test'")
    scopes: list[ScopeType] = Field(default_factory=lambda: ["read:tools"])


class RevokeApiKeyRequest(BaseModel):
    key_id: str = Field(..., description="Identifiant public de la clé (wz_key_...)")


class TaxIdValidationRequest(BaseModel):
    pays: str = Field(..., description="Code pays ISO (ex: CI, SN, CM, GA, KE, MA)")
    identifiant: str = Field(
        ...,
        description="Numéro fiscal d'entreprise (ex: NCC, NINEA, NIU, NIF, KRA PIN)",
    )


class PhoneValidationRequest(BaseModel):
    numero: str = Field(..., description="Numéro de téléphone à valider")
    pays: str = Field(..., description="Code pays ISO (ex: GA, SN)")


class CurrencyConvertRequest(BaseModel):
    montant: float = Field(..., gt=0, description="Montant numérique")
    de: str = Field(..., description="Devise source (ex: EUR, XOF, USD)")
    vers: str = Field(..., description="Devise cible (ex: XAF, EUR, USD)")


class VatRequest(BaseModel):
    montant: float = Field(..., gt=0, description="Montant de base")
    pays: str = Field(..., description="Code pays ISO")
    type_calcul: str = Field("HT_VERS_TTC", description="'HT_VERS_TTC' ou 'TTC_VERS_HT'")
    taux_type: str = Field("normal", description="'normal' ou 'reduit'")


class TransactionTaxRequest(BaseModel):
    pays: str = Field(..., description="Code pays ISO (ex: GH, CM, CI, SN, KE, NG)")
    montant: float = Field(..., gt=0, description="Montant de la transaction ou de la prestation")
    type_taxe: str | None = Field(None, description="Type de taxe spécifique (ex: e_levy, brs_services, emtl)")
    cumul_journalier_precedent: float = Field(0.0, ge=0, description="Cumul déjà effectué aujourd'hui")


class FormatAmountRequest(BaseModel):
    montant: float = Field(..., description="Montant à formater")
    devise: str = Field(..., description="Code devise (ex: XOF, XAF, EUR)")
    pays: str | None = Field(None, description="Code pays optionnel")


@router.post("/phone/validate")
async def api_validate_phone(
    req: PhoneValidationRequest,
    api_key: str | None = Depends(verify_api_key),
):
    envelope = validate_phone(pays=req.pays, numero=req.numero)
    return envelope.model_dump()


@router.post("/currency/convert")
async def api_convert_currency(
    req: CurrencyConvertRequest,
    api_key: str | None = Depends(verify_api_key),
):
    envelope = convert_currency(amount=req.montant, de=req.de, vers=req.vers)
    return envelope.model_dump()


@router.get("/country/{code}")
async def api_get_country_info(
    code: str,
    api_key: str | None = Depends(verify_api_key),
):
    envelope = get_country_info(pays=code)
    return envelope.model_dump()


@router.post("/tax/vat")
async def api_calculate_vat(
    req: VatRequest,
    api_key: str | None = Depends(verify_api_key),
):
    envelope = calculate_vat(
        montant=req.montant,
        pays=req.pays,
        type_taux="standard" if req.taux_type == "normal" else req.taux_type,
        mode="ht" if req.type_calcul == "HT_VERS_TTC" else "ttc",
    )
    return envelope.model_dump()


@router.post("/tax/transaction/calculate")
async def api_calculate_transaction_tax(
    req: TransactionTaxRequest,
    api_key: str | None = Depends(verify_api_key),
):
    envelope = calculate_transaction_tax(
        pays=req.pays,
        montant=req.montant,
        type_taxe=req.type_taxe,
        cumul_journalier_precedent=req.cumul_journalier_precedent,
    )
    return envelope.model_dump()


@router.post("/currency/format")
async def api_format_amount(
    req: FormatAmountRequest,
    api_key: str | None = Depends(verify_api_key),
):
    envelope = format_amount(
        amount=req.montant,
        devise=req.devise,
        pays=req.pays,
    )
    return envelope.model_dump()


@router.post("/tax/tin/validate")
async def api_validate_tax_id(
    req: TaxIdValidationRequest,
    api_key: str | None = Depends(verify_api_key),
):
    envelope = validate_tax_id(pays=req.pays, identifiant=req.identifiant)
    return envelope.model_dump()


@router.post("/keys/create", tags=["Gestion Clés API"])
async def api_create_api_key(
    req: CreateApiKeyRequest,
):
    """
    Génère une nouvelle clé API Wezas (Volet 2).
    La clé secrète n'est retournée qu'une seule fois.
    """
    secret_key, record = api_key_repo.create_key(
        name=req.name,
        environment=req.environment,
        scopes=req.scopes,
    )
    return {
        "ok": True,
        "api_key": secret_key,
        "key_id": record.key_id,
        "name": record.name,
        "environment": record.environment,
        "scopes": record.scopes,
        "created_at": record.created_at,
        "message": "Conservez précieusement votre clé API. Elle ne pourra plus être réaffichée.",
    }


@router.post("/keys/revoke", tags=["Gestion Clés API"])
async def api_revoke_api_key(
    req: RevokeApiKeyRequest,
    current_admin: ApiKeyRecord = admin_required,
):
    """Révoque une clé API existante (requiert scope admin)."""
    success = api_key_repo.revoke_key(req.key_id)
    return {"ok": success, "key_id": req.key_id}

