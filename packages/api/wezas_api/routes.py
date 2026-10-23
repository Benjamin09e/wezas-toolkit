
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from wezas_core.country import get_country_info
from wezas_core.currency import convert as convert_currency
from wezas_core.format_amount import format_amount
from wezas_core.iban import validate_african_iban
from wezas_core.nuban import validate_nuban
from wezas_core.phone import validate_phone
from wezas_core.rib import validate_rib
from wezas_core.tin import validate_tax_id
from wezas_core.vat import calculate_vat

from wezas_api.auth import verify_api_key

router = APIRouter(prefix="/v1", tags=["Outils"])


class TaxIdValidationRequest(BaseModel):
    pays: str = Field(..., description="Code pays ISO (ex: CI, SN, CM, GA, KE, MA)")
    identifiant: str = Field(
        ...,
        description="Numéro fiscal d'entreprise (ex: NCC, NINEA, NIU, NIF, KRA PIN)",
    )


class RibValidationRequest(BaseModel):
    code_banque: str = Field(
        ...,
        description="Code banque à 5 caractères (ex: CI008, SN012, GA040)",
    )
    code_guichet: str = Field(..., description="Code guichet à 5 chiffres (ex: 01111)")
    numero_compte: str = Field(..., description="Numéro de compte à 11 ou 12 caractères")
    cle_rib: str = Field(..., description="Clé de contrôle à 2 chiffres")


class NubanValidationRequest(BaseModel):
    code_banque: str = Field(
        ...,
        description="Code CBN banque à 3 ou 6 chiffres (ex: 044 Access Bank, 090267 Kuda)",
    )
    numero_compte: str = Field(..., description="Numéro de compte NUBAN à 10 chiffres")
    pays: str = Field("NG", description="Code pays ISO (NG ou GH)")


class IbanValidationRequest(BaseModel):
    iban: str = Field(
        ...,
        description="Numéro IBAN complet (ex: MA64011780000012345678901234)",
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


@router.post("/bank/rib/validate")
async def api_validate_rib(
    req: RibValidationRequest,
    api_key: str | None = Depends(verify_api_key),
):
    envelope = validate_rib(
        code_banque=req.code_banque,
        code_guichet=req.code_guichet,
        numero_compte=req.numero_compte,
        cle_rib=req.cle_rib,
    )
    return envelope.model_dump()


@router.post("/tax/tin/validate")
async def api_validate_tax_id(
    req: TaxIdValidationRequest,
    api_key: str | None = Depends(verify_api_key),
):
    envelope = validate_tax_id(pays=req.pays, identifiant=req.identifiant)
    return envelope.model_dump()


@router.post("/bank/nuban/validate")
async def api_validate_nuban(
    req: NubanValidationRequest,
    api_key: str | None = Depends(verify_api_key),
):
    envelope = validate_nuban(
        bank_code=req.code_banque,
        account_number=req.numero_compte,
        country=req.pays,
    )
    return envelope.model_dump()


@router.post("/bank/iban/validate")
async def api_validate_iban(
    req: IbanValidationRequest,
    api_key: str | None = Depends(verify_api_key),
):
    envelope = validate_african_iban(iban_str=req.iban)
    return envelope.model_dump()
