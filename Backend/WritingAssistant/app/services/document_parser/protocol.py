from __future__ import annotations
from dataclasses import dataclass
from typing import List, Optional, Protocol, Dict

@dataclass
class DocSection:
    name: str
    text: str

@dataclass
class ParsedDocument:
    sections: List[DocSection]
    meta: Optional[Dict] = None  

class DocumentParser(Protocol):
    def can_handle(self, filename: str, mime: str) -> bool: ...
    def parse(self, content: bytes, filename: str) -> ParsedDocument: ...
