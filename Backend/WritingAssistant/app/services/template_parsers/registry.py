from typing import List
from .protocol import TemplateParser
from .markdown import MarkdownParser

_PARSERS: List[TemplateParser] = [
    MarkdownParser(),

]

def pick_parser(filename: str, mime: str) -> TemplateParser:
    for p in _PARSERS:
        if p.can_handle(filename, mime):
            return p
    raise ValueError(f"Nepodržan tip fajla: {filename} ({mime})")
