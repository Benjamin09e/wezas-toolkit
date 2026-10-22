# Dockerfile multi-stage pour le service API hébergé Wezas Africa Toolkit
FROM python:3.12-slim AS builder

WORKDIR /app

RUN pip install --no-cache-dir hatchling

# Copie des packages du workspace nécessaires
COPY packages/core ./packages/core
COPY packages/api ./packages/api

# Build wheels
RUN pip install --no-cache-dir ./packages/core ./packages/api

# --- Image finale légère d'exécution ---
FROM python:3.12-slim AS runner

WORKDIR /app

# Création d'un utilisateur sans privilèges
RUN useradd -m -u 1000 wezas && chown -R wezas:wezas /app

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

USER wezas

ENV PYTHONUNBUFFERED=1 \
    WEZAS_ONLINE=1 \
    PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "wezas_api.main:app", "--host", "0.0.0.0", "--port", "8000"]
