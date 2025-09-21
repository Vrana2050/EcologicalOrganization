# app/services/llm_client/openai_client.py
from __future__ import annotations
from typing import Any, Dict, Tuple, List
from decimal import Decimal, ROUND_HALF_UP
from openai import OpenAI
from app.core.config import SETTINGS

class OpenAIClient:
    provider: str
    model: str

    def __init__(self):
        if not SETTINGS.openai.api_key:
            raise RuntimeError("OPENAI_API_KEY nije setovan.")
        self._client = OpenAI(
            api_key=SETTINGS.openai.api_key,
            base_url=SETTINGS.openai.base_url,
        )
        self.provider = "openai"
        self.model = SETTINGS.openai.model

    def _extract_text(self, resp: Any) -> str:
        texts: List[str] = []
        output_items = getattr(resp, "output", None) or []
        for item in output_items:
            contents = getattr(item, "content", None) or []
            for c in contents:
                if getattr(c, "type", None) == "output_text":
                    t = getattr(c, "text", "") or ""
                    if t:
                        texts.append(t)
        if not texts:
            maybe_text = getattr(resp, "output_text", None)
            if maybe_text:
                texts.append(str(maybe_text))
        return "\n".join(texts).strip()

    def _usage_to_dict(self, usage_obj: Any) -> Dict[str, Any]:
        """Pretvori ResponseUsage (ili None/dict) u običan dict."""
        if not usage_obj:
            return {}
        if isinstance(usage_obj, dict):
            return {
                "input_tokens": usage_obj.get("input_tokens"),
                "output_tokens": usage_obj.get("output_tokens"),
                "total_tokens": usage_obj.get("total_tokens"),
                "input_tokens_details": usage_obj.get("input_tokens_details"),
                "output_tokens_details": usage_obj.get("output_tokens_details"),
            }
        # objekat – čitaj preko getattr
        return {
            "input_tokens": getattr(usage_obj, "input_tokens", None),
            "output_tokens": getattr(usage_obj, "output_tokens", None),
            "total_tokens": getattr(usage_obj, "total_tokens", None),
            "input_tokens_details": getattr(usage_obj, "input_tokens_details", None),
            "output_tokens_details": getattr(usage_obj, "output_tokens_details", None),
        }

    def generate_text(self, final_prompt: str) -> Tuple[str, Dict[str, Any]]:
        resp = self._client.responses.create(
            model=self.model,
            input=final_prompt,
        )
        out_text = self._extract_text(resp)
        usage_dict = self._usage_to_dict(getattr(resp, "usage", None))
        meta: Dict[str, Any] = {
            "usage": usage_dict,
            "raw_response": resp,
            "model": getattr(resp, "model", None),
            "status": getattr(resp, "status", None),
            "id": getattr(resp, "id", None),
        }
        return out_text, meta

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
