from __future__ import annotations
from typing import List, Any
import numpy as np
from huggingface_hub import InferenceClient
from app.core.config import SETTINGS

class EmbeddingService:
    provider: str
    model: str
    DEBUG = True  # isključi kad završiš

    def __init__(self):
        if not SETTINGS.hf.api_key:
            raise RuntimeError("HF_TOKEN nije setovan u okruženju.")
        # Minimalna i pouzdana inicijalizacija
        self._client = InferenceClient(token=SETTINGS.hf.api_key)
        self.provider = "huggingface"
        self.model = SETTINGS.hf.model  # npr. "intfloat/multilingual-e5-large"

    def _dbg_head(self, arr_like: Any, n: int = 5) -> list:
        try:
            if isinstance(arr_like, np.ndarray):
                flat = arr_like.flatten()
                return flat[:n].astype(float).tolist()
            if isinstance(arr_like, (list, tuple)):
                x = arr_like[0] if arr_like and isinstance(arr_like[0], (list, tuple, np.ndarray)) else arr_like
                return list(x[:n]) if isinstance(x, (list, tuple, np.ndarray)) else [x]
            if isinstance(arr_like, dict):
                return list(arr_like.keys())[:n]
            return [arr_like]
        except Exception as e:
            return [f"<dbg-failed: {e}>"]

    def _normalize_output(self, resp: Any) -> List[float]:
        if self.DEBUG:
            print("EMB.raw.type =", type(resp).__name__, "head=", self._dbg_head(resp))

        # HF može vratiti dict sa raznim ključevima
        if isinstance(resp, dict):
            for k in ("embeddings", "embedding", "data"):
                if k in resp:
                    resp = resp[k]
                    if self.DEBUG:
                        print(f"EMB.dict picked key='{k}' head=", self._dbg_head(resp))
                    break

        # Pretvori u np.array
        if isinstance(resp, np.ndarray):
            arr = resp
        else:
            try:
                arr = np.array(resp, dtype=np.float32)
            except Exception as e:
                if self.DEBUG:
                    print("EMB.to_numpy failed:", repr(e), "fallback head=", self._dbg_head(resp))
                try:
                    return [float(x) for x in resp]
                except Exception:
                    return []

        if self.DEBUG:
            print("EMB.numpy.shape =", arr.shape, "dtype=", arr.dtype, "head=", self._dbg_head(arr))

        # Skini batch dim ako je [[...]]
        if arr.ndim == 2 and arr.shape[0] == 1:
            arr = arr[0]

        out = arr.astype(np.float32).tolist()
        if self.DEBUG:
            print("EMB.final.len =", len(out), "head=", out[:5])
        return out

    def embed_query(self, text: str) -> List[float]:
        if self.DEBUG:
            print("embed_query() text_len=", len(text))
        # POZICIONI ARGUMENT, bez 'inputs=' !
        resp = self._client.feature_extraction(f"query: {text}", model=self.model)
        return self._normalize_output(resp)

    def embed_passage(self, text: str) -> List[float]:
        if self.DEBUG:
            print("embed_passage() text_len=", len(text))
        # POZICIONI ARGUMENT, bez 'inputs=' !
        resp = self._client.feature_extraction(f"passage: {text}", model=self.model)
        return self._normalize_output(resp)
