from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    allow_origins: frozenset[str] = frozenset("*")

settings = Settings()
