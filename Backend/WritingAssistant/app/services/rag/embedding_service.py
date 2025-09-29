from __future__ import annotations
from typing import List, Any
import numpy as np
from huggingface_hub import InferenceClient
from app.core.config import SETTINGS

class EmbeddingService:
    provider: str
    model: str

    def __init__(self):
        if not SETTINGS.hf.api_key:
            raise RuntimeError("HF_TOKEN nije setovan u okruženju.")
        self._client = InferenceClient(token=SETTINGS.hf.api_key)
        self.provider = "huggingface"
        self.model = SETTINGS.hf.model  

    def _to_list(self, resp: Any) -> List[float]:
        arr = resp if isinstance(resp, np.ndarray) else np.array(resp, dtype=np.float32)
        if arr.ndim == 2 and arr.shape[0] == 1:
            arr = arr[0]
        return arr.astype(np.float32).tolist()

    def embed_query(self, text: str) -> List[float]:
        resp = self._client.feature_extraction(f"query: {text}", model=self.model)
        return self._to_list(resp)

    def embed_passage(self, text: str) -> List[float]:
        resp = self._client.feature_extraction(f"passage: {text}", model=self.model)
        return self._to_list(resp)
