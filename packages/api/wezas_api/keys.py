"""Gestion et persistance des clés API pour le Volet 2 (WAT-054).

Spécifications de sécurité (spec-volet-2.md) :
- Format des clés : `wz_live_<32_caracteres_aleatoires>` ou `wz_test_<32_caracteres_aleatoires>`
- Hachage sécurisé : HMAC SHA-256 avec sel d'environnement (`settings.api_secret_salt`)
- Gestion des portées (`scopes`) : `read:tools`, `contrib:write`, `admin`
- Révocation et persistance (support stockage SQLite/fichier ou mémoire pour autonomie)
"""

from __future__ import annotations

import datetime as dt
import hashlib
import hmac
import secrets
import sqlite3
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field

from wezas_api.config import settings

ScopeType = Literal["read:tools", "contrib:write", "admin"]


class ApiKeyRecord(BaseModel):
    """Représentation d'une clé API stockée de manière sécurisée (hachée)."""

    key_id: str = Field(..., description="Identifiant public de la clé (ex: wz_key_...)")
    key_hash: str = Field(..., description="Hash HMAC-SHA256 de la clé secrète")
    name: str = Field(..., description="Nom d'usage (ex: Application Prod)")
    environment: Literal["live", "test"] = "live"
    scopes: list[ScopeType] = Field(default_factory=lambda: ["read:tools"])
    is_active: bool = True
    created_at: str = Field(default_factory=lambda: dt.datetime.utcnow().isoformat())
    revoked_at: str | None = None


class ApiKeyRepository:
    """Dépôt SQLite persistant pour les clés API."""

    def __init__(self, db_path: Path | str | None = None):
        if db_path is None:
            # Stockage local par défaut dans le dossier de configuration
            base_dir = Path.home() / ".wezas"
            base_dir.mkdir(parents=True, exist_ok=True)
            self.db_path = str(base_dir / "api_keys.sqlite3")
        else:
            self.db_path = str(db_path)

        self._init_db()

    def _init_db(self) -> None:
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS api_keys (
                    key_id TEXT PRIMARY KEY,
                    key_hash TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    environment TEXT NOT NULL,
                    scopes TEXT NOT NULL,
                    is_active INTEGER NOT NULL,
                    created_at TEXT NOT NULL,
                    revoked_at TEXT
                )
                """
            )
            conn.commit()

    @staticmethod
    def hash_key(secret_key: str) -> str:
        """Hash une clé secrète avec HMAC-SHA256."""
        return hmac.new(
            settings.api_secret_salt.encode(),
            secret_key.encode(),
            hashlib.sha256,
        ).hexdigest()

    def create_key(
        self,
        name: str,
        environment: Literal["live", "test"] = "live",
        scopes: list[ScopeType] | None = None,
    ) -> tuple[str, ApiKeyRecord]:
        """
        Génère une nouvelle clé API et stocke son hash.
        Retourne : (cle_secrete_en_clair, record_hache)
        La clé en clair n'est affichée qu'une seule fois à la création.
        """
        scopes = scopes or ["read:tools"]
        rand_suffix = secrets.token_hex(16)  # 32 caractères hex
        secret_key = f"wz_{environment}_{rand_suffix}"
        key_id = f"wz_key_{secrets.token_hex(8)}"
        hashed = self.hash_key(secret_key)
        now_iso = dt.datetime.now(dt.timezone.utc).isoformat()

        record = ApiKeyRecord(
            key_id=key_id,
            key_hash=hashed,
            name=name,
            environment=environment,
            scopes=scopes,
            is_active=True,
            created_at=now_iso,
        )

        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                """
                INSERT INTO api_keys (
                    key_id, key_hash, name, environment, scopes, is_active, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    record.key_id,
                    record.key_hash,
                    record.name,
                    record.environment,
                    ",".join(record.scopes),
                    1 if record.is_active else 0,
                    record.created_at,
                ),
            )
            conn.commit()

        return secret_key, record

    def get_by_secret_key(self, secret_key: str) -> ApiKeyRecord | None:
        """Recherche et valide une clé secrète par son hash."""
        hashed = self.hash_key(secret_key)
        with sqlite3.connect(self.db_path) as conn:
            cur = conn.cursor()
            cur.execute(
                """
                SELECT
                    key_id, key_hash, name, environment, scopes, is_active, created_at, revoked_at
                FROM api_keys
                WHERE key_hash = ? AND is_active = 1
                """,
                (hashed,),
            )
            row = cur.fetchone()
            if not row:
                return None

            return ApiKeyRecord(
                key_id=row[0],
                key_hash=row[1],
                name=row[2],
                environment=row[3],
                scopes=row[4].split(",") if row[4] else [],
                is_active=bool(row[5]),
                created_at=row[6],
                revoked_at=row[7],
            )

    def revoke_key(self, key_id: str) -> bool:
        """Révoque une clé API."""
        now_iso = dt.datetime.now(dt.timezone.utc).isoformat()
        with sqlite3.connect(self.db_path) as conn:
            cur = conn.cursor()
            cur.execute(
                """
                UPDATE api_keys
                SET is_active = 0, revoked_at = ?
                WHERE key_id = ?
                """,
                (now_iso, key_id),
            )
            conn.commit()
            return cur.rowcount > 0


# Instance globale du repository
api_key_repo = ApiKeyRepository()
