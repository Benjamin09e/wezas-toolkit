"""Modèles de données du SDK Wezas Python."""

from __future__ import annotations

from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class LocalizedMessage(BaseModel):
    fr: str = ""
    en: str = ""


class WarningInfo(BaseModel):
    code: str
    message: LocalizedMessage


class ErrorInfo(BaseModel):
    code: str
    message: LocalizedMessage
    details: dict[str, Any] = Field(default_factory=dict)
    suggestions: list[str] = Field(default_factory=list)


class WezasResponse(BaseModel, Generic[T]):
    """Enveloppe standard de réponse de l'API Wezas."""

    ok: bool
    data: T | None = None
    error: ErrorInfo | None = None
    source: str | None = None
    derniere_verification: str | None = None
    confiance: str | None = None
    avertissements: list[WarningInfo] = Field(default_factory=list)
