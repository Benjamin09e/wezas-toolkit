# Wezas Africa Toolkit

Serveur MCP open source pour les builders africains. Il fonctionne hors ligne et sans clé API.

| Outil | Rôle |
|---|---|
| `valider_telephone` | Format international, opérateur probable, compatibilité Mobile Money |
| `convertir_devise` | Conversion XAF / XOF / EUR / USD |
| `info_pays` | Indicatif, devise, langues, jours fériés, fuseau horaire |

> Statut : en construction (v0.1 en développement).

## Documentation
- [Architecture](archi.md)
- [Décisions de cadrage](docs/decisions.md)
- [Tickets](tickets.md)

## Structure
- `packages/core` : logique métier pure
- `packages/mcp-server` : serveur FastMCP
- `packages/api` : API hébergée (volet 2)
- `apps/web` : portail Next.js
- `data` : données pays communautaires

## Développement
```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -e packages/core
```

## Licence
[MIT](LICENSE)
