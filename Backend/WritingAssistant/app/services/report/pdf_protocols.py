from __future__ import annotations
from typing import Protocol, Any, Dict, List
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Tuple


@dataclass
class DocTypeReportParams:
    from_ts: datetime
    to_ts: datetime
    document_type_id: Optional[int]
    include_total: bool
    sort_key: str = "document_type_name"
    sort_dir: str = "asc"
    tz: Optional[str] = None
    locale: str = "sr-RS"


DocTypeTableColumns: Tuple[Tuple[str, str], ...] = (
    ("document_type_name", "Tip dokumenta"),
    ("num_executions", "Broj Izvršavanja"),
    ("avg_duration_ms", "Prosecno trajanje (ms)"),
    ("avg_input_tokens", "Avg input tok."),
    ("avg_output_tokens", "Avg output tok."),
    ("total_cost_usd", "Ukupan trošak ($)"),
    ("avg_cost_usd", "Trošak/izv. ($)"),
    ("error_rate", "Greške (%)"),
    ("rating_count", "# Ocena"),
    ("rating_avg", "Avg ocena"),
    ("rating_median", "Medijan"),
)


class PDFEngine(Protocol):
    def html_to_pdf(self, html: str) -> bytes:
        ...


class HTMLRenderer(Protocol):
    def render(self, rows: List[Dict[str, Any]], p: DocTypeReportParams) -> str:
        ...
