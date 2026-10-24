from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from wezas_api.config import settings
from wezas_api.metrics import MetricsMiddleware, metrics_collector
from wezas_api.rate_limit import RateLimitMiddleware
from wezas_api.routes import router

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="API REST hébergée et services pour builders africains (Volet 2)",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(MetricsMiddleware)
app.add_middleware(RateLimitMiddleware)

app.include_router(router)


@app.get("/health", tags=["Système"])
async def health_check():
    return {
        "status": "ok",
        "service": settings.app_name,
        "env": settings.app_env,
        "online_enabled": settings.wezas_online,
    }


@app.get("/metrics", tags=["Système"])
async def get_metrics():
    """Retourne les métriques système et compteurs d'usage agrégés (anonymes)."""
    return {
        "ok": True,
        "metrics": metrics_collector.get_summary(),
    }


@app.get("/scalar", include_in_schema=False)
async def scalar_html():
    """Documentation interactive moderne via Scalar."""
    html_content = """
    <!doctype html>
    <html>
      <head>
        <title>Wezas Africa API - Documentation Scalar</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { margin: 0; }
        </style>
      </head>
      <body>
        <script
          id="api-reference"
          data-url="/openapi.json"
          data-configuration='{"theme": "purple"}'
          src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
    </html>
    """
    return HTMLResponse(content=html_content)


def main():
    import uvicorn
    uvicorn.run("wezas_api.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
