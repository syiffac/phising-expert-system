from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "PhishGuard Expert System"
    app_env: str = "development"
    api_prefix: str = "/api"
    database_url: str

    class Config:
        env_file = ".env"


settings = Settings()