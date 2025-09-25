from __future__ import annotations
from typing import Any, Dict, List, Optional
from datetime import datetime

from app.services.analytics_service import AnalyticsService
from app.services.report.pdf_protocols import DocTypeReportParams, DocTypeTableColumns, HTMLRenderer, PDFEngine
from app.services.report.doc_type_report_renderer import DocTypeReportHtmlRenderer
from app.services.report.xhtml2pdf_engine import Xhtml2PdfEngine



class DocTypeReportService:
    def __init__(
        self,
        analytics_service: AnalyticsService,
        renderer: HTMLRenderer | None = None,
        pdf_engine: PDFEngine | None = None,
    ):
        self.svc = analytics_service
        self.renderer = renderer or DocTypeReportHtmlRenderer()
        self.pdf_engine = pdf_engine or Xhtml2PdfEngine()

    def build_pdf(self, p: DocTypeReportParams) -> bytes:
        rows = self.svc.get_doc_type_report(
            p.from_ts, p.to_ts, p.document_type_id, p.include_total
        ) or []

        items, total = self._split_total(rows)
        items_sorted = self._sort_items(items, p.sort_key, p.sort_dir)
        rows_final = [*items_sorted, *([total] if total else [])]

        html = self.renderer.render(rows_final, p)
        return self.pdf_engine.html_to_pdf(html)

    def _split_total(self, rows: List[Dict[str, Any]]):
        total = None
        items = []
        for r in rows:
            if r.get("document_type_id") is None:
                total = r
            else:
                items.append(r)
        return items, total

    def _sort_items(self, rows: List[Dict[str, Any]], key: str, dir_: str) -> List[Dict[str, Any]]:
        valid_keys = {k for k, _ in DocTypeTableColumns}
        if key not in valid_keys:
            key = "document_type_name"
        reverse = dir_.lower() == "desc"

        def _val(x):
            v = x.get(key)
            return (1, "") if v is None else (0, v) if isinstance(v, str) else (0, float(v))
        return sorted(rows, key=_val, reverse=reverse)


def safe_filename(prefix: str, dt: datetime) -> str:
    return f"{prefix}-{dt.strftime('%d-%m-%Y-%H-%M')}.pdf"


def build_doc_type_report_pdf_bytes(
    analytics_service: AnalyticsService,
    from_ts: datetime,
    to_ts: datetime,
    document_type_id: Optional[int],
    include_total: bool,
    sort_key: str = "document_type_name",
    sort_dir: str = "asc",
    tz: Optional[str] = None,
    locale: str = "sr-RS",
) -> bytes:
    params = DocTypeReportParams(
        from_ts=from_ts,
        to_ts=to_ts,
        document_type_id=document_type_id,
        include_total=include_total,
        sort_key=sort_key,
        sort_dir=sort_dir,
        tz=tz,
        locale=locale,
    )
    return DocTypeReportService(analytics_service).build_pdf(params)


def fastapi_pdf_response(pdf_bytes: bytes):
    from fastapi.responses import Response
    filename = safe_filename("izvestaj", datetime.now())
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
