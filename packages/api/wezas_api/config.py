from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Wezas Africa API"
    app_env: str = "production"
    debug: bool = False
    mongodb_uri: str = "mongodb://localhost:27017/wezas"
    api_secret_salt: str = "wezas_dev_salt_change_in_production"
    wezas_online: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_prefix="WEZAS_")


settings = Settings()
