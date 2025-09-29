from __future__ import annotations
from typing import get_type_hints, get_origin, get_args, Union
from datetime import datetime
import types 

from weaviate.classes.config import Property, DataType, Configure, VectorDistances
from app.core.vector_client import get_client
from app.model.vector_models import DOCUMENT_COLL, CHUNK_COLL, DocumentVector, ChunkVector

def _vector_cfg():
    return Configure.Vectors.self_provided(
        vector_index_config=Configure.VectorIndex.hnsw(
            distance_metric=VectorDistances.COSINE,
            ef_construction=128,
            max_connections=64,
        )
    )

def _unwrap_optional(ann):
    origin = get_origin(ann)
    if origin in (Union, types.UnionType):
        args = [a for a in get_args(ann) if a is not type(None)]
        if len(args) == 1:
            return args[0]
    return ann

def _pytype_to_weaviate_dtype(ann) -> DataType:
    ann = _unwrap_optional(ann)
    origin = get_origin(ann)
    args = get_args(ann)

    if origin in (list, tuple): 
        inner = args[0] if args else str
        inner = _unwrap_optional(inner)
        if inner is str:
            return DataType.TEXT_ARRAY
        if inner is int:
            return DataType.INT_ARRAY
        if inner is float:
            return DataType.NUMBER_ARRAY
        return DataType.TEXT_ARRAY

    if ann is str:
        return DataType.TEXT
    if ann is int:
        return DataType.INT
    if ann is float:
        return DataType.NUMBER
    if ann is datetime:
        return DataType.DATE
    return DataType.TEXT 

def _model_properties(model_cls) -> list[Property]:
    props: list[Property] = []
    anns = get_type_hints(model_cls, include_extras=True)
    for name, ann in anns.items():
        if name == "id": 
            continue
        dtype = _pytype_to_weaviate_dtype(ann)
        props.append(Property(name=name, data_type=dtype))
    return props

def _ensure_collection(name: str, props_model) -> None:
    client = get_client()
    existing = set(client.collections.list_all())

    if name not in existing:
        client.collections.create(
            name=name,
            properties=_model_properties(props_model),
            vector_config=_vector_cfg(),
        )
    else:
        coll = client.collections.get(name)
        current = {p.name: p for p in coll.config.get().properties}
        for p in _model_properties(props_model):
            if p.name not in current:
                coll.config.add_property(p)

def ensure_minimal_collections() -> None:
    _ensure_collection(DOCUMENT_COLL, DocumentVector)
    _ensure_collection(CHUNK_COLL, ChunkVector)
