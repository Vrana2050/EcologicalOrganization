from contextlib import asynccontextmanager
from idlelib import search

from fastapi import FastAPI, APIRouter
from elasticsearch import AsyncElasticsearch
from fastapi.middleware.cors import CORSMiddleware
from dependencies import SearchResults, AdvancedElasticSearchRequest, DirectorySearchResult, DocumentSearchResult, \
    MetadataElasticDTO, extract_metadata_value
from generate_pdf_query import build_elastic_query_documents_pdf, build_elastic_query_directories_pdf
from query import build_elastic_query_directories, build_elastic_query_documents
from routers import directories, documents, maintanance


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.es = AsyncElasticsearch(hosts=["http://localhost:9200"])
    print("✅ Elasticsearch client started.")
    yield
    await app.state.es.close()
    print("🛑 Elasticsearch client closed.")

app = FastAPI(lifespan=lifespan)

origins = ["http://localhost:8000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(directories.router,  prefix="/api")
app.include_router(documents.router,  prefix="/api")
app.include_router(maintanance.router, prefix="/api")

router = APIRouter()

# --- Endpoint ---

@app.get("/health_check")
async def health_check():
    return {"message": "App is up and running"}


@router.post("/search", response_model=SearchResults)
async def search_documents(request: AdvancedElasticSearchRequest):
    es: AsyncElasticsearch = app.state.es


    directories_query = build_elastic_query_directories(request)
    documents_query = build_elastic_query_documents(request)


    dir_res = await es.search(index="directories", body=directories_query, size=10000)
    doc_res = await es.search(index="documents", body=documents_query, size=10000)


    directories = [
        DirectorySearchResult(
            directory_id=hit["_source"]["directory_id"],
            name=(
                hit["highlight"]["name"][0]
                if hit.get("highlight") and "name" in hit["highlight"]
                else hit["_source"]["name"]  # Fallback na ceo name
            ),
            created_at=hit["_source"]["created_at"],
            last_modified=hit["_source"]["last_modified"],
            creator_id=hit["_source"]["creator_id"],
            score=hit.get("_score", 0.0),
            tags=hit["_source"].get("tags", []),
            metadata=[
                MetadataElasticDTO(
                    metadata_id=meta.get("id"),
                    value=extract_metadata_value(meta)
                )
                for meta in hit["_source"].get("metadata", [])
            ]
        )
        for hit in dir_res["hits"]["hits"]
    ]

    documents = [
        DocumentSearchResult(
            document_id=hit["_source"]["document_id"],
            name=(
                hit["highlight"]["name"][0]
                if hit.get("highlight") and "name" in hit["highlight"]
                else hit["_source"]["name"]  # Fallback na ceo name
            ),
            created_at=hit["_source"]["created_at"],
            last_modified=hit["_source"]["last_modified"],
            creator_id=hit["_source"]["creator_id"],
            score=hit.get("_score", 0.0),
            tags=hit["_source"].get("tags", []),
            metadata=[
                MetadataElasticDTO(
                    metadata_id=meta.get("id"),
                    value=extract_metadata_value(meta)
                )
                for meta in hit["_source"].get("metadata", [])
            ],
            summary=(
                "... ".join(
                    reversed(hit["highlight"]["summary"])  # 👈 Obrni redosled fragmentata
                )
                if hit.get("highlight") and "summary" in hit["highlight"]
                else (
                    (hit["_source"].get("summary") or "")[:200] + "..."
                    if len(hit["_source"].get("summary") or "") > 200
                    else (hit["_source"].get("summary") or "")
                )
            )
        )
        for hit in doc_res["hits"]["hits"]
    ]


    combined_results = [(d.score, "directory", d) for d in directories] + \
                       [(d.score, "document", d) for d in documents]
    combined_results.sort(key=lambda x: x[0], reverse=True)


    start = (request.page - 1) * request.page_size
    end = start + request.page_size
    page_results = combined_results[start:end]


    page_directories = [item[2] for item in page_results if item[1] == "directory"]
    page_documents = [item[2] for item in page_results if item[1] == "document"]


    total_count = len(directories) + len(documents)
    total_pages = (total_count + request.page_size - 1) // request.page_size


    return SearchResults(
        directories=page_directories,
        documents=page_documents,
        total_count=total_count,
        page=request.page,
        page_size=request.page_size,
        total_pages=total_pages
    )



@router.post("/generate-pdf", response_model=SearchResults)
async def generate_pdf(request: AdvancedElasticSearchRequest):
    print("Generating PDF")
    es: AsyncElasticsearch = app.state.es


    directories_query = build_elastic_query_directories_pdf(request)
    documents_query = build_elastic_query_documents_pdf(request)


    dir_res = await es.search(index="directories", body=directories_query, size=10000)
    doc_res = await es.search(index="documents", body=documents_query, size=10000)


    directories = [
        DirectorySearchResult(
            directory_id=hit["_source"]["directory_id"],
            name=(
                hit["highlight"]["name"][0]
                if hit.get("highlight") and "name" in hit["highlight"]
                else hit["_source"]["name"]  # Fallback na ceo name
            ),
            created_at=hit["_source"]["created_at"],
            last_modified=hit["_source"]["last_modified"],
            creator_id=hit["_source"]["creator_id"],
            score=hit.get("_score", 0.0),
            tags=hit["_source"].get("tags", []),
            metadata=[
                MetadataElasticDTO(
                    metadata_id=meta.get("id"),
                    value=extract_metadata_value(meta)
                )
                for meta in hit["_source"].get("metadata", [])
            ]
        )
        for hit in dir_res["hits"]["hits"]
    ]

    documents = [
        DocumentSearchResult(
            document_id=hit["_source"]["document_id"],
            name=(
                hit["highlight"]["name"][0]
                if hit.get("highlight") and "name" in hit["highlight"]
                else hit["_source"]["name"]  # Fallback na ceo name
            ),
            created_at=hit["_source"]["created_at"],
            last_modified=hit["_source"]["last_modified"],
            creator_id=hit["_source"]["creator_id"],
            score=hit.get("_score", 0.0),
            tags=hit["_source"].get("tags", []),
            metadata=[
                MetadataElasticDTO(
                    metadata_id=meta.get("id"),
                    value=extract_metadata_value(meta)
                )
                for meta in hit["_source"].get("metadata", [])
            ],
            summary=(
                    hit.get("highlight", {}).get("summary", [None])[0]
                    or hit["_source"].get("summary", "")
            )
        )
        for hit in doc_res["hits"]["hits"]
    ]


    combined_results = [(d.score, "directory", d) for d in directories] + \
                       [(d.score, "document", d) for d in documents]
    combined_results.sort(key=lambda x: x[0], reverse=True)


    start = (request.page - 1) * request.page_size
    end = start + request.page_size
    page_results = combined_results[start:end]


    page_directories = [item[2] for item in page_results if item[1] == "directory"]
    page_documents = [item[2] for item in page_results if item[1] == "document"]


    total_count = len(directories) + len(documents)
    total_pages = (total_count + request.page_size - 1) // request.page_size


    return SearchResults(
        directories=page_directories,
        documents=page_documents,
        total_count=total_count,
        page=request.page,
        page_size=request.page_size,
        total_pages=total_pages
    )





app.include_router(router, prefix="/api")