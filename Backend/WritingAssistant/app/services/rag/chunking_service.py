from __future__ import annotations
from typing import List, Iterable
import re


class ChunkingService:
    def __init__(
        self,
        max_model_tokens: int = 512,
        target_tokens: int = 360,
        overlap_tokens: int = 64,
        consider_prefix: str = "passage: ",
        section_prefix_template: str = "[{section}] ",
        reserve_tokens: int = 8,
        max_section_name_tokens: int = 30,
        avg_chars_per_token: int = 4, 
    ):
        self.max_model_tokens = max_model_tokens
        self.target_tokens = target_tokens
        self.overlap_tokens = overlap_tokens
        self.consider_prefix = consider_prefix
        self.section_prefix_template = section_prefix_template
        self.reserve_tokens = reserve_tokens
        self.max_section_name_tokens = max_section_name_tokens
        self.avg_cpt = avg_chars_per_token

    def _clean_whitespace(self, s: str) -> str:
        s = s.replace("\xa0", " ")
        s = re.sub(r"[ \t]+", " ", s)
        s = re.sub(r"[ \t]*\n[ \t]*", "\n", s)
        return s.strip()

    def _truncate_chars(self, text: str, max_tokens: int) -> str:
        max_chars = max_tokens * self.avg_cpt
        return text[:max_chars]

    def make_chunks(self, section_name: str, section_text: str) -> List[str]:
        section_name = self._clean_whitespace(section_name or "Sekcija")

        if len(section_name) > self.max_section_name_tokens * self.avg_cpt:
            section_name = self._truncate_chars(section_name, self.max_section_name_tokens)

        section_prefix = self.section_prefix_template.format(section=section_name)

        prefix_tokens = (len(self.consider_prefix) + len(section_prefix)) // self.avg_cpt
        hard_cap = max(16, self.max_model_tokens - prefix_tokens - self.reserve_tokens)
        hard_cap_chars = hard_cap * self.avg_cpt

        text = self._clean_whitespace(section_text or "")
        if not text:
            return []

        if len(text) <= hard_cap_chars:
            return [section_prefix + text]

        window_tokens = min(self.target_tokens, hard_cap)
        stride_tokens = max(1, window_tokens - self.overlap_tokens)
        window_chars = window_tokens * self.avg_cpt
        stride_chars = stride_tokens * self.avg_cpt

        chunks: List[str] = []
        i = 0
        n = len(text)
        while i < n:
            j = min(i + window_chars, n)
            piece = text[i:j]
            if len(piece) > hard_cap_chars:
                piece = piece[:hard_cap_chars]

            if piece.strip():
                chunks.append(section_prefix + piece.strip())

            if j >= n:
                break
            i += stride_chars

        return chunks

    def make_chunks_for_sections(self, sections: Iterable[tuple[str, str]]) -> List[tuple[str, str]]:
        out: List[tuple[str, str]] = []
        for sec_name, sec_text in sections:
            for ch in self.make_chunks(sec_name, sec_text):
                out.append((sec_name, ch))
        return out
