from __future__ import annotations
from dataclasses import dataclass
from typing import List, Optional, Dict, Tuple
from datetime import datetime
from zoneinfo import ZoneInfo
from io import BytesIO
from html import escape
import os

from app.core.exceptions import NotFoundError, AuthError
from app.services.session_section_service import SessionSectionService
from app.services.chat_session_service import ChatSessionService
from app.repository.section_iteration_repository import SectionIterationRepository

from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from xhtml2pdf import pisa

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FONT_PATH = os.path.join(BASE_DIR, "assets", "fonts", "DejaVuSans.ttf")

pdfmetrics.registerFont(TTFont("DejaVuSans", FONT_PATH))


TRANSLIT_MAP = str.maketrans({
    "č": "c", "ć": "c", "š": "s", "ž": "z", "đ": "dj",
    "Č": "C", "Ć": "C", "Š": "S", "Ž": "Z", "Đ": "Dj",
})
def _osisaj(s: Optional[str]) -> str:
    if not s:
        return ""
    return s.translate(TRANSLIT_MAP)


@dataclass
class DocumentReportSelection:
    section_id: int
    seq_no: Optional[int] = None


def _nl2br(text: str) -> str:
    if text is None:
        return ""
    return "<br/>".join(escape(text).splitlines())


class DocumentReportPDF:
    TZ = "Europe/Belgrade"
    PAGE_SIZE = "A4"
    ORIENTATION = "portrait"
    INCLUDE_EMPTY_SECTIONS = False

    def __init__(
        self,
        session_service: ChatSessionService,
        section_service: SessionSectionService,
        section_iteration_repo: SectionIterationRepository,
    ):
        self.sess_svc = session_service
        self.sec_svc = section_service
        self.iter_repo = section_iteration_repo

    def generate(
        self,
        session_id: int,
        user_id: int,
        title_override: Optional[str],
        selections: List[DocumentReportSelection],
    ) -> bytes:
        sess = self.sess_svc.chat_session_repository.read_by_id(session_id)
        if not sess or getattr(sess, "deleted", 0) == 1:
            raise NotFoundError(detail="Session not found")
        if sess.created_by != user_id:
            raise AuthError(detail="Forbidden")

        ov = self.sec_svc.list_with_latest_for_session(session_id, user_id)
        title = (title_override or ov.title or "Dokument").strip()
        ordered_sections = sorted(ov.sections or [], key=lambda s: (s.position or 0, s.id))

        selected_seq_map: Dict[int, int] = {
            int(s.section_id): int(s.seq_no) for s in (selections or []) if s.seq_no is not None
        }

        sections_payload: List[Tuple[str, str]] = []
        for s in ordered_sections:
            sec_title = (s.name or "Sekcija").strip()
            chosen_text = ""
            sel_seq = selected_seq_map.get(int(s.id))

            if sel_seq is not None:
                it = self.iter_repo.by_section_and_seq(
                    section_id=int(s.id),
                    seq_no=int(sel_seq),
                )
                if it:
                    chosen_text = (
                        (it.section_draft.content if it.section_draft else None)
                        or (it.model_output.generated_text if it.model_output else None)
                        or ""
                    )
            else:
                it = s.latest_iteration
                chosen_text = (
                    (it.section_draft.content if (it and it.section_draft) else None)
                    or (it.model_output.generated_text if (it and it.model_output) else None)
                    or ""
                )

            chosen_text = (chosen_text or "").strip()
            if chosen_text or self.INCLUDE_EMPTY_SECTIONS:
                sections_payload.append((sec_title, chosen_text))

        html = self._render_html(title=title, sections=sections_payload)
        return self._html_to_pdf(html)

    def _render_html(self, title: str, sections: List[Tuple[str, str]]) -> str:
        gen_at = datetime.now(tz=ZoneInfo(self.TZ)).strftime("%d.%m.%Y %H:%M")
        page_css = f"@page {{ size: {self.PAGE_SIZE} {self.ORIENTATION}; margin: 18mm 16mm; }}"

        title_osisan = _osisaj(title)

        sec_html = "\n".join(
            f"""
            <section class="doc-section">
              <h2 class="doc-section-title">{escape(_osisaj(name))}</h2>
              <div class="doc-text">{_nl2br(_osisaj(text)) or "—"}</div>
            </section>
            """
            for name, text in sections
        )

        css = f"""
        {page_css}
        body {{ font-family: "DejaVuSans", sans-serif; color: #111; }}
        h1 {{ font-size: 20px; margin: 0 0 10px 0; }}
        .meta {{ font-size: 11px; color: #666; margin: 0 0 18px 0; }}
        .doc-section {{ page-break-inside: avoid; margin-bottom: 16px; }}
        .doc-section-title {{ font-size: 16px; margin: 0 0 6px 0; }}
        .doc-text {{ font-size: 12px; line-height: 1.45; white-space: normal; }}
        .footer {{ font-size: 10px; color: #666; margin-top: 20px; }}
        """

        return f"""
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8"/>
            <title>{escape(title_osisan)}</title>
            <style>{css}</style>
          </head>
          <body>
            <h1>{escape(title_osisan)}</h1>
            <div class="meta">Generisano: {gen_at}</div>
            {sec_html}
            <div class="footer">© EcoLink 2025</div>
          </body>
        </html>
        """

    def _html_to_pdf(self, html: str) -> bytes:
        if pisa is None:
            raise RuntimeError("xhtml2pdf nije dostupan. Instalirati: pip install xhtml2pdf")
        buf = BytesIO()
        result = pisa.CreatePDF(src=html, dest=buf, encoding="utf-8")
        if result.err:
            raise RuntimeError("Greška pri generisanju PDF-a (xhtml2pdf).")
        return buf.getvalue()


def build_document_report_pdf_bytes(
    session_id: int,
    user_id: int,
    section_service: SessionSectionService,
    session_service: ChatSessionService,
    section_iteration_repo: SectionIterationRepository,
    title_override: Optional[str],
    selections: List[DocumentReportSelection],
) -> bytes:
    return DocumentReportPDF(
        session_service=session_service,
        section_service=section_service,
        section_iteration_repo=section_iteration_repo,
    ).generate(
        session_id=session_id,
        user_id=user_id,
        title_override=title_override,
        selections=selections,
    )
