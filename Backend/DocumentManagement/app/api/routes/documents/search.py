from fastapi import APIRouter, status, Depends
from app.api.dependencies.headers import get_user_headers
from app.api.dtos.search import AdvancedSearchRequest, SearchResults
from app.api.dependencies.services import get_document_service
from app.use_cases.document import DocumentService

router = APIRouter(tags=["Search"])


@router.post('', status_code=status.HTTP_200_OK, response_model=SearchResults)
async def search(search_request: AdvancedSearchRequest,
                 user=Depends(get_user_headers),
                 service: DocumentService = Depends(get_document_service)):

    return service.search(search_request, user.id)

@router.post('/generate-pdf', status_code=status.HTTP_200_OK)
async def search(search_request: AdvancedSearchRequest,
                 user=Depends(get_user_headers),
                 service: DocumentService = Depends(get_document_service)):

    return service.generate_pdf(search_request, user.id, user.email)
