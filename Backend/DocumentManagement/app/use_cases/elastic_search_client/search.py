import requests
from app.api.dtos.search import AdvancedElasticSearchRequest, ElasticSearchResults, DirectoryElasticSearchResult, \
    DocumentElasticSearchResult

ELASTIC_SEARCH_URL = "http://localhost:8082/api"


def search(request: AdvancedElasticSearchRequest) -> ElasticSearchResults:
    print(request.model_dump_json())
    response = requests.post(
        f"{ELASTIC_SEARCH_URL}/search",
        data=request.model_dump_json(),
        headers={"Content-Type": "application/json"}
    )
    if response.status_code != 200:
        raise Exception(f"Elasticsearch service error: {response.status_code} - {response.text}")

    response_data = response.json()
    directories = [
        DirectoryElasticSearchResult(**d) for d in response_data.get("directories", [])
    ]
    documents = [
        DocumentElasticSearchResult(**d) for d in response_data.get("documents", [])
    ]


    return ElasticSearchResults(
        directories=directories,
        documents=documents,
        total_count=response_data.get("total_count", 0),
        page=response_data.get("page", 1),
        page_size=response_data.get("page_size", 20),
        total_pages=response_data.get("total_pages")
    )


def search_pdf_results(request: AdvancedElasticSearchRequest) -> ElasticSearchResults:
    print(request.model_dump_json())
    response = requests.post(
        f"{ELASTIC_SEARCH_URL}/generate-pdf",
        data=request.model_dump_json(),
        headers={"Content-Type": "application/json"}
    )
    if response.status_code != 200:
        raise Exception(f"Elasticsearch service error: {response.status_code} - {response.text}")

    response_data = response.json()
    directories = [
        DirectoryElasticSearchResult(**d) for d in response_data.get("directories", [])
    ]
    documents = [
        DocumentElasticSearchResult(**d) for d in response_data.get("documents", [])
    ]


    return ElasticSearchResults(
        directories=directories,
        documents=documents,
        total_count=response_data.get("total_count", 0),
        page=response_data.get("page", 1),
        page_size=response_data.get("page_size", 20),
        total_pages=response_data.get("total_pages")
    )
