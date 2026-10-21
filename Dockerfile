# Dockerfile pour Wezas Africa Toolkit (serveur MCP)
FROM python:3.12-slim

WORKDIR /app

# Installation de uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copie des définitions de projet
COPY pyproject.toml uv.lock ./
COPY packages/core ./packages/core
COPY packages/mcp-server ./packages/mcp-server
COPY data ./data

# Synchronisation des dépendances et installation
RUN uv sync --all-packages --no-dev

ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONUNBUFFERED=1

# Exécution par défaut en transport stdio
ENTRYPOINT ["wezas-africa-toolkit"]
