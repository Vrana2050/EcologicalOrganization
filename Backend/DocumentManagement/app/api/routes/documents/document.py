from fastapi import APIRouter, status, Depends, Form, File, UploadFile
from app.api.dependencies.headers import get_user_headers
from app.api.dtos.documents import DocumentCreateDTO
from app.use_cases.document import DocumentService
from app.api.dependencies.services import get_document_service

router = APIRouter(tags=["Document"])

@router.post('/', status_code=status.HTTP_201_CREATED)
async def upload(parent_directory_id: int = Form(...),
                 uploaded_file: UploadFile = File(...),
                 user=Depends(get_user_headers),
                 service: DocumentService = Depends(get_document_service)):

    service.save(DocumentCreateDTO(parent_directory_id=parent_directory_id, uploaded_file=uploaded_file), user.id)
