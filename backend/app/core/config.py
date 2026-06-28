from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    log_level: str = "info"

    gemini_api_key: str = ""

    github_token: str = ""
    github_webhook_secret: str = ""
    github_bot_username: str = "reviewllama-bot"

    email_enabled: bool = False
    notification_emails: str = ""
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""

    device: str = "cpu"


settings = Settings()
