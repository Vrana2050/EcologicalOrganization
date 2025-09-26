from __future__ import annotations
from typing import Any, Dict, List
from datetime import datetime
from zoneinfo import ZoneInfo

from .pdf_protocols import HTMLRenderer, DocTypeReportParams, DocTypeTableColumns


class DocTypeReportHtmlRenderer(HTMLRenderer):
    CSS = """
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

    def render(self, rows: List[Dict[str, Any]], p: DocTypeReportParams) -> str:
        gen_at_dt = datetime.now(tz=ZoneInfo(p.tz)) if p.tz else datetime.now()
        gen_at = gen_at_dt.strftime("%d/%m/%Y %H:%M")
        period = f"{p.from_ts.strftime('%d/%m/%Y')} – {p.to_ts.strftime('%d/%m/%Y')}"

        filters = []
        if p.document_type_id is not None:
            filters.append(f"Tip dokumenta ID: {p.document_type_id}")

        ths = "".join(f'<th class="col-{k}">{label}</th>' for k, label in DocTypeTableColumns)

        trs = []
        for r in rows:
            tds = "".join(
                f'<td class="col-{k}">{self._format_cell(k, r.get(k))}</td>'
                for k, _ in DocTypeTableColumns
            )
            cls = ' class="total"' if r.get("document_type_id") is None else ""
            trs.append(f"<tr{cls}>{tds}</tr>")
        body = "\n".join(trs)

        return f"""
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8"/>
            <title>Doc Type izveštaj</title>
            <style>{self.CSS}</style>
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

    def _fmt_int(self, v: Any) -> str:
        if v is None:
            return "—"
        try:
            return f"{int(v):,}".replace(",", " ")
        except:
            return str(v)

    def _fmt_float(self, v: Any, ndigits=(1, 2)) -> str:
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
