from __future__ import annotations
from app.services.llm_service import LLMService

_SUMMARY_PROMPT = """Sažmi sledeći dokument na srpskom u 150–250 reči.
- Uklopi ključne brojke, datume, nazive sekcija i ciljeve.
- Bez uvodnog small talka, samo čist sažetak.

DOKUMENT:
<<<
{doc_text}
>>>"""

class SummarizationService:
    def __init__(self, llm: LLMService):
        self.llm = llm

    def summarize(self, text: str) -> str:
        prompt = _SUMMARY_PROMPT.format(doc_text=text[:100_000])  
        res = self.llm.generate(prompt)
        if res.status != "ok":
            raise RuntimeError(res.error_message or "Summarization failed")
        return res.generated_text.strip()
