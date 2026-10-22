from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from wezas_api.config import settings
from wezas_api.routes import router

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="API REST hébergée du Wezas Africa Toolkit (Volet 2)",
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

app.include_router(router)


@app.get("/health", tags=["Système"])
async def health_check():
    return {
        "status": "ok",
        "service": settings.app_name,
        "env": settings.app_env,
        "online_enabled": settings.wezas_online,
    }


def main():
    import uvicorn
    uvicorn.run("wezas_api.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
