from __future__ import annotations
from typing import Protocol, Tuple, Dict, Any
from decimal import Decimal

class LLMClient(Protocol):
    provider: str
    model: str

    def generate_text(self, final_prompt: str) -> Tuple[str, Dict[str, Any]]:
        """
        Returns (text, meta). meta je proizvoljan dict (npr. usage, raw_response).
        """
        ...

    def compute_cost_usd(
        self,
        prompt_tokens: int | None,
        output_tokens: int | None,
        prompt_token_usd_per_million: Decimal,
        completion_token_usd_per_million: Decimal,
    ) -> Decimal:
        """
        Računa cenu: tokens * ($/M) / 1_000_000, vraća Decimal.
        Implementacija definiše i zaokruživanje.
        """
        ...
