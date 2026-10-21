"""Contrat de sortie commun à tous les outils (voir docs/output-contract.md)."""

from __future__ import annotations

import datetime as dt
from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from wezas_core.models import LocalizedName


class ErrorCode(str, Enum):
    ENTREE_INVALIDE = "ENTREE_INVALIDE"
    PAYS_INCONNU = "PAYS_INCONNU"
    NUMERO_INVALIDE = "NUMERO_INVALIDE"
    DEVISE_NON_SUPPORTEE = "DEVISE_NON_SUPPORTEE"
    MONTANT_INVALIDE = "MONTANT_INVALIDE"
    TAUX_INVALIDE = "TAUX_INVALIDE"
    DONNEES_INDISPONIBLES = "DONNEES_INDISPONIBLES"
    ERREUR_INTERNE = "ERREUR_INTERNE"


class Warning_(BaseModel):
    """Avertissement non bloquant (ex. taux USD périmé, opérateur incertain)."""

    model_config = ConfigDict(extra="forbid")

    code: str = Field(pattern=r"^[A-Z][A-Z0-9_]+$")
    message: LocalizedName


class ErrorInfo(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: ErrorCode
    message: LocalizedName
    details: dict[str, Any] = Field(default_factory=dict)
    suggestions: list[str] = Field(default_factory=list)


class Envelope(BaseModel):
    """Enveloppe de réponse : succès (`data`) ou échec (`error`), jamais les deux."""

    model_config = ConfigDict(extra="forbid")

    ok: bool
    data: dict[str, Any] | None = None
    error: ErrorInfo | None = None
    source: str | None = Field(default=None, description="Origine de la donnée (régulateur, etc.)")
    derniere_verification: dt.date | None = None
    confiance: Literal["haute", "moyenne", "faible"] | None = None
    avertissements: list[Warning_] = Field(default_factory=list)

    @model_validator(mode="after")
    def _ok_xor_error(self) -> Envelope:
        if self.ok and (self.data is None or self.error is not None):
            raise ValueError("ok=true exige `data` et interdit `error`")
        if not self.ok and (self.error is None or self.data is not None):
            raise ValueError("ok=false exige `error` et interdit `data`")
        return self


def success(
    data: dict[str, Any],
    *,
    source: str | None = None,
    derniere_verification: dt.date | None = None,
    confiance: Literal["haute", "moyenne", "faible"] | None = None,
    avertissements: list[Warning_] | None = None,
) -> Envelope:
    return Envelope(
        ok=True,
        data=data,
        source=source,
        derniere_verification=derniere_verification,
        confiance=confiance,
        avertissements=avertissements or [],
    )


def failure(
    code: ErrorCode,
    fr: str,
    en: str,
    *,
    details: dict[str, Any] | None = None,
    suggestions: list[str] | None = None,
) -> Envelope:
    return Envelope(
        ok=False,
        error=ErrorInfo(
            code=code,
            message=LocalizedName(fr=fr, en=en),
            details=details or {},
            suggestions=suggestions or [],
        ),
    )
