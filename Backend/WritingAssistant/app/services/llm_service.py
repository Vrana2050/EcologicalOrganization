from __future__ import annotations
from typing import Optional
from decimal import Decimal
from app.services.llm_client.client import LLMClient

class LLMResult:
    def __init__(
        self,
        generated_text: str,
        status: str = "ok",
        error_code: Optional[str] = None,
        error_message: Optional[str] = None,
        prompt_tokens: Optional[int] = None,
        output_tokens: Optional[int] = None,
        cost_usd: Optional[Decimal] = None,
        duration_ms: Optional[int] = None,
    ):
        self.generated_text = generated_text
        self.status = status
        self.error_code = error_code
        self.error_message = error_message
        self.prompt_tokens = prompt_tokens
        self.output_tokens = output_tokens
        self.cost_usd = cost_usd
        self.duration_ms = duration_ms or 0

class LLMService:
    def __init__(self, backend: LLMClient):
        self._backend = backend

    @property
    def provider(self) -> str:
        return getattr(self._backend, "provider", "unknown")

    @property
    def model(self) -> str:
        return getattr(self._backend, "model", "unknown")

    def generate(self, final_prompt: str) -> LLMResult:
        try:
            text, meta = self._backend.generate_text(final_prompt)
            usage = meta.get("usage") or {}
            return LLMResult(
                generated_text=text,
                status="ok",
                prompt_tokens=usage.get("input_tokens"),
                output_tokens=usage.get("output_tokens"),
                cost_usd=None,
                duration_ms=None,
            )
        except Exception as e:
            return LLMResult(
                generated_text="",
                status="failed",
                error_code="AI_CLIENT_ERROR",
                error_message=str(e),
            )

    def compute_cost_usd(
        self,
        prompt_tokens: int | None,
        output_tokens: int | None,
        prompt_token_usd_per_million: Decimal,
        completion_token_usd_per_million: Decimal,
    ) -> Decimal:
        return self._backend.compute_cost_usd(
            prompt_tokens,
            output_tokens,
            prompt_token_usd_per_million,
            completion_token_usd_per_million,
        )
