from __future__ import annotations
import weaviate
from app.core.config import SETTINGS  

_client: weaviate.WeaviateClient | None = None

def get_client() -> weaviate.WeaviateClient:
    global _client
    if _client is None:
        _client = weaviate.connect_to_custom(
            http_host=SETTINGS.weaviate.http_host,
            http_port=SETTINGS.weaviate.http_port,
            http_secure=SETTINGS.weaviate.http_secure,
            grpc_host=SETTINGS.weaviate.grpc_host,
            grpc_port=SETTINGS.weaviate.grpc_port,
            grpc_secure=SETTINGS.weaviate.grpc_secure,
        )
    return _client

def is_ready() -> bool:
    return get_client().is_ready()

def close() -> None:
    global _client
    if _client:
        _client.close()
        _client = None
