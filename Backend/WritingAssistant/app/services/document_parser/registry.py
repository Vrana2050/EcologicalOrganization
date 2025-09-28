from __future__ import annotations
from typing import List, Optional
from .protocol import DocumentParser
from .pdf import PdfDocumentParser

_PARSERS: List[DocumentParser] = [
    PdfDocumentParser(),
]

def pick_document_parser(filename: str, mime: Optional[str] = None) -> DocumentParser:
    m = (mime or "").lower()
    for p in _PARSERS:
        if p.can_handle(filename, m):
            return p
    raise ValueError(f"Nepodržan tip fajla: {filename} ({mime})")
