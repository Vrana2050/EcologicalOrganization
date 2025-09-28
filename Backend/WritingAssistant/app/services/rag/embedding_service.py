from __future__ import annotations
from typing import List, Any, Dict
import numpy as np
from huggingface_hub import InferenceClient
from app.core.config import SETTINGS



class EmbeddingService:
    provider: str
    model: str

    def __init__(self):
        if not SETTINGS.hf.api_key:
            raise RuntimeError("HF_TOKEN nije setovan u okruženju.")
        self._client = InferenceClient(
            provider=SETTINGS.hf.provider,
            api_key=SETTINGS.hf.api_key,
        )
        self.provider = "huggingface"
        self.model = SETTINGS.hf.model

    def _normalize_output(self, resp: Any) -> List[float]:
        if isinstance(resp, dict):
            for k in ("embeddings", "embedding", "data"):
                if k in resp:
                    resp = resp[k]
                    break

        if isinstance(resp, np.ndarray):
            arr = resp
        else:
            try:
                arr = np.array(resp, dtype=np.float32)
            except Exception:
                return [float(x) for x in resp]

        if arr.ndim == 2:
            arr = arr[0]
        return arr.astype(np.float32).tolist()

    def embed_query(self, text: str) -> List[float]:
        resp = self._client.feature_extraction(
            f"query: {text}",
            model=self.model,
        )
        return self._normalize_output(resp)

    def embed_passage(self, text: str) -> List[float]:
        resp = self._client.feature_extraction(
            f"passage: {text}",
            model=self.model,
        )
        return self._normalize_output(resp)
