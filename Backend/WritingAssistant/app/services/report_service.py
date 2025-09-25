from __future__ import annotations
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime
from zoneinfo import ZoneInfo
from io import BytesIO

from app.services.analytics_service import AnalyticsService

try:
    from xhtml2pdf import pisa
except Exception as e:
    pisa = None

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

class DocTypeReportPDF:
    TABLE_COLUMNS: Tuple[Tuple[str, str], ...] = (
        ("document_type_name", "Tip dokumenta"),
        ("num_executions", "Broj Izvršavanja"),
        ("avg_duration_ms", "Prosecno trajanje (ms)"),
        ("avg_input_tokens", "Prosecan broj  input tokena"),
        ("avg_output_tokens", "Prosecan broj output tokena"),
        ("total_cost_usd", "Ukupan trošak ($)"),
        ("avg_cost_usd", "Trošak po izvrsenju. ($)"),
        ("error_rate", "Greške (%)"),
        ("rating_count", "Broj Ocena"),
        ("rating_avg", "Prosecna ocena"),
        ("rating_median", "Medijan ocena"),
    )

    def __init__(self, analytics_service: AnalyticsService):
        self.svc = analytics_service

    def generate(self, p: DocTypeReportParams) -> bytes:
        rows = self.svc.get_doc_type_report(p.from_ts, p.to_ts, p.document_type_id, p.include_total) or []
        items, total = self._split_total(rows)
        items_sorted = self._sort_items(items, p.sort_key, p.sort_dir)
        rows_final = [*items_sorted, *([total] if total else [])]
        html = self._render_html(rows_final, p)
        pdf = self._html_to_pdf(html)
        return pdf

    def _split_total(self, rows: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], Optional[Dict[str, Any]]]:
        total = None
        items = []
        for r in rows:
            if r.get("document_type_id") is None:
                total = r
            else:
                items.append(r)
        return items, total

    def _sort_items(self, rows: List[Dict[str, Any]], key: str, dir_: str) -> List[Dict[str, Any]]:
        if key not in {k for k, _ in self.TABLE_COLUMNS}:
            key = "document_type_name"
        reverse = dir_.lower() == "desc"

        def _val(x):
            v = x.get(key)
            return (1, "") if v is None else (0, v) if isinstance(v, str) else (0, float(v))
        return sorted(rows, key=_val, reverse=reverse)

    def _fmt_int(self, v: Any) -> str:
        if v is None:
            return "—"
        try:
            return f"{int(v):,}".replace(",", " ")
        except:
            return str(v)

    def _fmt_float(self, v: Any, ndigits: Tuple[int, int] = (1, 2)) -> str:
        if v is None:
            return "—"
        lo, hi = ndigits
        return format(float(v), f".{hi}f").rstrip("0").rstrip(".") if lo == 0 else format(float(v), f".{hi}f")

    def _fmt_ms(self, v: Any) -> str:
        if v is None:
            return "—"
        try:
            return f"{int(round(float(v))):,}".replace(",", " ")
        except:
            return str(v)

    def _fmt_money(self, v: Any) -> str:
        if v is None:
            return "—"
        try:
            return f"${float(v):,.2f}".replace(",", " ")
        except:
            return str(v)

    def _fmt_percent(self, v: Any) -> str:
        if v is None:
            return "—"
        try:
            return f"{float(v) * 100:.1f}%"
        except:
            return str(v)

    def _format_cell(self, key: str, v: Any) -> str:
        if key == "document_type_name":
            return str(v) if v is not None else '<span class="chip">Svi</span>'
        if key in ("num_executions", "rating_count", "rating_median"):
            return self._fmt_int(v)
        if key in ("avg_duration_ms",):
            return self._fmt_ms(v)
        if key in ("avg_input_tokens", "avg_output_tokens"):
            return self._fmt_int(v) if v is not None else "—"
        if key in ("total_cost_usd",):
            return self._fmt_money(v)
        if key in ("avg_cost_usd",):
            return self._fmt_money(v) if v is not None else "—"
        if key in ("error_rate",):
            return self._fmt_percent(v) if v is not None else "—"
        if key in ("rating_avg",):
            return self._fmt_float(v, (1, 2)) if v is not None else "—"
        return str(v) if v is not None else "—"

    def _render_html(self, rows: List[Dict[str, Any]], p: DocTypeReportParams) -> str:
        gen_at_dt = datetime.now(tz=ZoneInfo(p.tz)) if p.tz else datetime.now()
        gen_at = gen_at_dt.strftime("%d/%m/%Y %H:%M")

        period = f"{p.from_ts.strftime('%d/%m/%Y')} – {p.to_ts.strftime('%d/%m/%Y')}"
        filters = []
        if p.document_type_id is not None:
            filters.append(f"Tip dokumenta ID: {p.document_type_id}")

        ths = "".join(
            f'<th class="col-{k}">{label}</th>'
            for k, label in self.TABLE_COLUMNS
        )
        trs = []
        for r in rows:
            tds = "".join(
                f'<td class="col-{k}">{self._format_cell(k, r.get(k))}</td>'
                for k, _ in self.TABLE_COLUMNS
            )
            cls = ' class="total"' if r.get("document_type_id") is None else ""
            trs.append(f"<tr{cls}>{tds}</tr>")
        body = "\n".join(trs)

        css = """
        @page { size: A4 landscape; margin: 20mm 16mm; }
        body { font-family: Helvetica, Arial, sans-serif; color: #111; }
        h1 { font-size: 18px; margin: 0 0 6px 0; }
        .meta { font-size: 11px; color: #555; margin-bottom: 16px; }
        .meta .period { font-weight: 600; }
        .meta .filters { margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { font-size: 12px; padding: 8px 10px; border-bottom: 1px solid #e6e6e9; text-align: left; white-space: nowrap; }
        thead th { font-weight: 700; color: #555; background: #fafafc; }
        tr.total td { font-weight: 700; background: #f5f6fb; }
        .chip { display: inline-block; padding: 2px 10px; border: 1px solid #dadbe3; border-radius: 999px; background: #d3d3d9; }
        .footer { font-size: 10px; color: #666; margin-top: 12px; }
        """

        html = f"""
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8"/>
            <title>Doc Type izveštaj</title>
            <style>{css}</style>
        </head>
        <body>
            <h1>Izveštaj po tipovima dokumenata</h1>
            <div class="meta">
            <div class="period">Period: {period}</div>
            <div class="filters">{' • '.join(filters)}</div>
            <div class="filters">Generisano: {gen_at}</div>
            </div>
            <table>
            <thead><tr>{ths}</tr></thead>
            <tbody>{body}</tbody>
            </table>
            <div class="footer">© EcoLink 2025</div>
        </body>
        </html>
        """
        return html

    def _html_to_pdf(self, html: str) -> bytes:
        if pisa is None:
            raise RuntimeError("xhtml2pdf nije dostupan. Instalirati: pip install xhtml2pdf")
        buf = BytesIO()
        result = pisa.CreatePDF(src=html, dest=buf, encoding='utf-8')
        if result.err:
            raise RuntimeError("Greška pri generisanju PDF-a (xhtml2pdf).")
        return buf.getvalue()

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
    return DocTypeReportPDF(analytics_service).generate(params)

def fastapi_pdf_response(pdf_bytes: bytes):
    from fastapi.responses import Response
    now = datetime.now().strftime("%d-%m-%Y-%H-%M")  
    filename = f"izvestaj-{now}.pdf"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)

