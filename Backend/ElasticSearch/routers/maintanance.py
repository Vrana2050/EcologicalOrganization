from fastapi import APIRouter, HTTPException
from elasticsearch import AsyncElasticsearch

from dependencies import MetadataType, FIELD_MAP

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])
es = AsyncElasticsearch("http://localhost:9200")

@router.delete("/delete-tag/{tag_id}")
async def delete_tag(tag_id: int):
    try:
        for index in ["documents", "directories"]:
            res = await es.search(
                index=index,
                body={
                    "query": {"term": {"tags": tag_id}}
                    # uklonio sam "_source": ["tags"] -> sad dobijamo barem sve _id-e
                },
                size=10000
            )

            for hit in res["hits"]["hits"]:
                doc_id = hit["_id"]
                full = await es.get(index=index, id=doc_id)
                source = full["_source"]

                tags = source.get("tags", [])
                if isinstance(tags, list):
                    source["tags"] = [t for t in tags if t != tag_id]
                else:
                    source["tags"] = [] if tags == tag_id else tags

                await es.index(index=index, id=doc_id, document=source)

        return {"message": f"Tag {tag_id} removed from all documents and directories."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/nullify-metadata")
async def nullify_metadata(metadata_id: int, metadata_type: MetadataType):
    field = FIELD_MAP[metadata_type]
    all_fields = list(FIELD_MAP.values())

    # ✅ Svim dokumentima i direktorijumima uklanja stare "value_" ključeve
    #    i postavlja samo novo polje na null
    script_source = """
        if (ctx._source.metadata != null) {
            for (m in ctx._source.metadata) {
                if (m.id == params.metadata_id) {
                    for (f in params.all_fields) {
                        if (f != params.new_field && m.containsKey(f)) {
                            m.remove(f);
                        }
                    }
                    m[params.new_field] = null;
                }
            }
        }
    """

    body = {
        "script": {
            "source": script_source,
            "lang": "painless",
            "params": {
                "metadata_id": metadata_id,
                "all_fields": all_fields,
                "new_field": field
            },
        },
        "query": {"match_all": {}}
    }

    # 🗂️ Ažuriraj dokumente
    await es.update_by_query(index="documents", body=body, refresh=True)

    # 📁 Ažuriraj direktorijume
    await es.update_by_query(index="directories", body=body, refresh=True)

    return {
        "status": "ok",
        "metadata_id": metadata_id,
        "new_field": field,
        "removed_fields": [f for f in all_fields if f != field]
    }



@router.delete("/delete-metadata/{metadata_id}")
async def delete_metadata(metadata_id: int):
    try:
        for index in ["documents", "directories"]:
            res = await es.search(
                index=index,
                body={"query": {"nested": {"path": "metadata", "query": {"term": {"metadata.id": metadata_id}}}}},
                size=10000
            )

            for hit in res["hits"]["hits"]:
                doc_id = hit["_id"]
                source = hit["_source"]

                source["metadata"] = [m for m in source.get("metadata", []) if m.get("id") != metadata_id]

                await es.index(index=index, id=doc_id, document=source)

        return {"message": f"Metadata with id {metadata_id} deleted from all documents and directories."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
3