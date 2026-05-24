from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "PhishGuard Expert System"
    app_env: str = "development"
    api_prefix: str = "/api"

    class Config:
        env_file = ".env"


settings = Settings()   