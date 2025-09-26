from __future__ import annotations
from io import BytesIO

try:
    from xhtml2pdf import pisa
except Exception:
    pisa = None

from .pdf_protocols import PDFEngine


class Xhtml2PdfEngine(PDFEngine):
    def html_to_pdf(self, html: str) -> bytes:
        if pisa is None:
            raise RuntimeError("xhtml2pdf nije dostupan. Instalirati: pip install xhtml2pdf")
        buf = BytesIO()
        result = pisa.CreatePDF(src=html, dest=buf, encoding="utf-8")
        if result.err:
            raise RuntimeError("Greška pri generisanju PDF-a (xhtml2pdf).")
        return buf.getvalue()
