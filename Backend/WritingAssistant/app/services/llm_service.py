from datetime import datetime
from typing import Optional
from decimal import Decimal


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
    def __init__(self):
        pass

    def generate(self, final_prompt: str) -> LLMResult:
        fake_output = f"[mock-output] {final_prompt[:200]}..."  
        return LLMResult(
            generated_text=fake_output,
            status="ok",
            error_code=None,
            error_message=None,
            prompt_tokens=len(final_prompt.split()),  
            output_tokens=len(fake_output.split()),   
            cost_usd=Decimal("0.001"),                
            duration_ms=50,                           
        )
