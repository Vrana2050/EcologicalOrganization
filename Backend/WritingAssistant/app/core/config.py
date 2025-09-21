from __future__ import annotations
import os
from dataclasses import dataclass

@dataclass(frozen=True)
class OpenAISettings:
    api_key: str
    base_url: str
    model: str

@dataclass(frozen=True)
class AppSettings:
    openai: OpenAISettings

def load_settings() -> AppSettings:
    return AppSettings(
        openai=OpenAISettings(
            api_key=os.getenv("OPENAI_API_KEY", ""),
            base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
            model=os.getenv("OPENAI_MODEL", "gpt-4o-2024-08-06"),
        )
    )

SETTINGS = load_settings()
