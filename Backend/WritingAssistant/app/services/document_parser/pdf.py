from __future__ import annotations
import re
from statistics import median
from typing import List

import fitz 

from .protocol import DocumentParser, ParsedDocument, DocSection

_HEADING_HINTS = r"(sadržaj|uvod|sažetak|metodologija|ciljevi|rezultati|diskusija|zaključak|prilog|bibliografija)"
_HEADING_RX = re.compile(rf"^(\d+(\.\d+)*)\s+|^{_HEADING_HINTS}\b", re.I)

def _clean_line(s: str) -> str:
    s = s.replace("\xa0", " ").strip()
    s = re.sub(r"-\n", "", s)      
    s = re.sub(r"[ \t]+", " ", s)
    return s

class PdfDocumentParser(DocumentParser):
    def can_handle(self, filename: str, mime: str) -> bool:
        ext = (filename.rsplit(".", 1)[-1] or "").lower()
        return ext == "pdf" or ("pdf" in (mime or "").lower())

    def parse(self, content: bytes, filename: str) -> ParsedDocument:
        doc = fitz.open(stream=content, filetype="pdf")
        sections: List[DocSection] = []
        cur_name = "Opšte"
        buf: List[str] = []
        body_sizes: List[float] = []

        def flush():
            nonlocal buf, cur_name
            txt = "\n".join(buf).strip()
            if txt:
                sections.append(DocSection(cur_name, txt))
            buf = []

        for page in doc:
            data = page.get_text("dict")
            for block in data.get("blocks", []):
                for line in block.get("lines", []):
                    spans = line.get("spans", [])
                    if not spans:
                        continue
                    text = _clean_line("".join(s.get("text", "") for s in spans))
                    if not text:
                        continue
                    size = max(float(s.get("size", 0.0)) for s in spans)

                    if 6.0 < size < 22.0 and len(text) > 30:
                        body_sizes.append(size)
                    baseline = median(body_sizes) if body_sizes else 10.0

                    looks_heading = (
                        size >= baseline * 1.25
                        or (text.isupper() and 3 <= len(text) <= 80)
                        or bool(_HEADING_RX.match(text))
                    )

                    if looks_heading:
                        flush()
                        cur_name = text[:120]
                    else:
                        buf.append(text)

        flush()

        if not sections:
            plain = "\n".join(p.get_text("text").strip() for p in doc).strip()
            if plain:
                sections.append(DocSection("Opšte", plain))
            else:
                sections.append(DocSection("Opšte", ""))

        meta = {
            "pages": len(doc),
            "title": doc.metadata.get("title") if doc.metadata else None,
        }
        doc.close()
        return ParsedDocument(sections=sections, meta=meta)
