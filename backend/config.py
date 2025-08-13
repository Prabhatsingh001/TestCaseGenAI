from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    client_id: str
    client_secret: str

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings() #type: ignore