from __future__ import annotations
from typing import Tuple, Dict, Any
from decimal import Decimal, ROUND_HALF_UP

class MockLLMClient:
    provider: str = "mock"
    model: str = "mock-1"

    def generate_text(self, final_prompt: str) -> Tuple[str, Dict[str, Any]]:
        txt = f"[mock-output] {final_prompt[:200]}..."
        meta: Dict[str, Any] = {
            "usage": {
                "input_tokens": len(final_prompt.split()),
                "output_tokens": len(txt.split()),
                "total_tokens": len(final_prompt.split()) + len(txt.split()),
            },
            "raw_response": None,
            "model": self.model,
            "status": "completed",
            "id": None,
        }
        return txt, meta

    def compute_cost_usd(
        self,
        prompt_tokens: int | None,
        output_tokens: int | None,
        prompt_token_usd_per_million: Decimal,
        completion_token_usd_per_million: Decimal,
    ) -> Decimal:
        pt = Decimal(prompt_tokens or 0)
        ct = Decimal(output_tokens or 0)
        cost = (pt * prompt_token_usd_per_million + ct * completion_token_usd_per_million) / Decimal(1_000_000)
        return cost.quantize(Decimal("0.000001"), rounding=ROUND_HALF_UP)
