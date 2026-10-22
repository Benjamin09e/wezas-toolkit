from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from wezas_core.phone import validate_phone
from wezas_core.currency import convert as convert_currency
from wezas_core.country import get_country_info
from wezas_core.vat import calculate_vat
from wezas_core.format_amount import format_amount
from wezas_api.auth import verify_api_key

router = APIRouter(prefix="/v1", tags=["Outils"])


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


class FormatAmountRequest(BaseModel):
    montant: float = Field(..., description="Montant à formater")
    devise: str = Field(..., description="Code devise (ex: XOF, XAF, EUR)")
    pays: Optional[str] = Field(None, description="Code pays optionnel")


@router.post("/phone/validate")
async def api_validate_phone(
    req: PhoneValidationRequest,
    api_key: Optional[str] = Depends(verify_api_key),
):
    envelope = validate_phone(pays=req.pays, numero=req.numero)
    return envelope.model_dump()


@router.post("/currency/convert")
async def api_convert_currency(
    req: CurrencyConvertRequest,
    api_key: Optional[str] = Depends(verify_api_key),
):
    envelope = convert_currency(amount=req.montant, de=req.de, vers=req.vers)
    return envelope.model_dump()


@router.get("/country/{code}")
async def api_get_country_info(
    code: str,
    api_key: Optional[str] = Depends(verify_api_key),
):
    envelope = get_country_info(pays=code)
    return envelope.model_dump()


@router.post("/tax/vat")
async def api_calculate_vat(
    req: VatRequest,
    api_key: Optional[str] = Depends(verify_api_key),
):
    envelope = calculate_vat(
        montant=req.montant,
        pays=req.pays,
        type_taux="standard" if req.taux_type == "normal" else req.taux_type,
        mode="ht" if req.type_calcul == "HT_VERS_TTC" else "ttc",
    )
    return envelope.model_dump()


@router.post("/currency/format")
async def api_format_amount(
    req: FormatAmountRequest,
    api_key: Optional[str] = Depends(verify_api_key),
):
    envelope = format_amount(
        amount=req.montant,
        devise=req.devise,
        pays=req.pays,
    )
    return envelope.model_dump()
