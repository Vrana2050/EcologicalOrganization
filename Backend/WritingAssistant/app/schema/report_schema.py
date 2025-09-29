from pydantic import BaseModel
from typing import Optional, List

class DocTypeReportRow(BaseModel):
    document_type_id: Optional[int] = None  
    document_type_name: str

    num_executions: int
    total_cost_usd: float
    avg_cost_usd: Optional[float] = None
    avg_duration_ms: Optional[float] = None
    avg_input_tokens: Optional[float] = None
    avg_output_tokens: Optional[float] = None
    failed_execs: int
    error_rate: Optional[float] = None

    rating_count: int
    rating_avg: Optional[float] = None
    rating_median: Optional[float] = None
    rating_c1: int
    rating_c2: int
    rating_c3: int
    rating_c4: int
    rating_c5: int



class SectionSelectionIn(BaseModel):
    section_id: int
    seq_no: Optional[int] = None  

class DocumentReportIn(BaseModel):
    title: Optional[str] = None
    selections: List[SectionSelectionIn]