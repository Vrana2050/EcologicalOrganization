import requests
from app.domain.metadata import MetadataType
from app.use_cases.elastic_search_client.search import ELASTIC_SEARCH_URL

ELASTIC_SEARCH_MAINTENANCE_URL = f"{ELASTIC_SEARCH_URL}/maintenance"



# 🏷️ DELETE TAG
def delete_tag(tag_id: int):
    response = requests.delete(f"{ELASTIC_SEARCH_MAINTENANCE_URL}/delete-tag/{tag_id}")
    if response.status_code != 200:
        raise Exception(f"Failed to delete tag {tag_id}: {response.text}")
    return response.json()


# 🧹 NULLIFY METADATA (postavlja vrednost na null)
def nullify_metadata(metadata_id: int, metadata_type: MetadataType):
    response = requests.post(
        f"{ELASTIC_SEARCH_MAINTENANCE_URL}/nullify-metadata",
        params={"metadata_id": metadata_id, "metadata_type": metadata_type.value}
    )
    if response.status_code != 200:
        raise Exception(f"Failed to nullify metadata {metadata_id}: {response.text}")
    return response.json()


# ❌ DELETE METADATA (potpuno uklanja metapodatak)
def delete_metadata(metadata_id: int):
    response = requests.delete(f"{ELASTIC_SEARCH_MAINTENANCE_URL}/delete-metadata/{metadata_id}")
    if response.status_code != 200:
        raise Exception(f"Failed to delete metadata {metadata_id}: {response.text}")
    return response.json()
