from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os

class Settings(BaseSettings):
    SUPABASE_URL: str = "https://pqfbcvxisrmtmhmuxbjk.supabase.co"
    SUPABASE_KEY: str = "YOUR_SUPABASE_ANON_KEY"
    GOOGLE_SHEET_ID: str = "1mmO9-_fohp4jr1w2QLQ1bRARGsdAYALDt-wFpWiGqwo"
    GOOGLE_SERVICE_ACCOUNT_FILE: str = os.path.join(os.path.dirname(__file__), "credentials.json")
    
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(__file__), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
