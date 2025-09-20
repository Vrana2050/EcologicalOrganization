import re
from .protocol import TemplateParser, ParsedTemplate

class MarkdownParser:
    _rx = re.compile(r"^\s{0,3}(#{1,2})\s+(.+?)\s*$", re.MULTILINE)

    def can_handle(self, filename: str, mime: str) -> bool:
        ext = (filename.rsplit(".", 1)[-1] or "").lower()
        return ext == "md" or mime in {"text/markdown"}

    def parse(self, content: bytes, filename: str) -> ParsedTemplate:
        text = content.decode("utf-8", errors="replace")
        titles = [m.group(2).strip() for m in self._rx.finditer(text)]
        if not titles:
            titles = [filename.rsplit(".", 1)[0] or "Sekcija"]
        return ParsedTemplate(sections=titles)
