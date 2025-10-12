from http.client import HTTPException

from cx_Oracle import SessionPool
from fastapi import APIRouter, status, Depends, Form, File, UploadFile
from sqlalchemy.orm.session import Session

from app.api.dependencies.headers import get_user_headers
from app.api.dtos.documents import DocumentCreateDTO, DocumentUpdateDTO
from app.core.exceptions import http_404, http_401
from app.infra.database import get_db
from app.infra.mappers.document_open import DocumentOpenDTO
from app.use_cases.document import DocumentService
from app.api.dependencies.services import get_document_service
from fastapi.responses import FileResponse
import os

router = APIRouter(tags=["Document"])


@router.get('/{document_id}', status_code=status.HTTP_200_OK, response_model=DocumentOpenDTO)
async def get_document(document_id: int,
                        user=Depends(get_user_headers),
                        service: DocumentService = Depends(get_document_service)):
    return service.open_document(document_id, user.id)


@router.post('/', status_code=status.HTTP_201_CREATED)
async def upload(parent_directory_id: int = Form(...),
                 uploaded_file: UploadFile = File(...),
                 user=Depends(get_user_headers),
                 service: DocumentService = Depends(get_document_service)):

    service.save(DocumentCreateDTO(parent_directory_id=parent_directory_id, uploaded_file=uploaded_file), user.id)


@router.get("/file/{file_path:path}")
async def get_file(file_path: str):

    if not os.path.exists(file_path):
        raise http_404('File not found')

    return FileResponse(file_path)

@router.post('/new-version', status_code=status.HTTP_201_CREATED)
async def upload_version(document_id: int = Form(...),
                 uploaded_file: UploadFile = File(...),
                 user=Depends(get_user_headers),
                 service: DocumentService = Depends(get_document_service)):

    service.upload_new_version(document_id, uploaded_file, user.id)

@router.put("/restore-version", status_code=status.HTTP_200_OK)
async def restore_version(document_id: int = Form(...),
                  version: int = Form(...),
                  user = Depends(get_user_headers),
                  service: DocumentService = Depends(get_document_service)):

    service.restore_version(document_id, version, user.id)


@router.put("/", status_code=status.HTTP_200_OK)
async def update(document: DocumentUpdateDTO,
                  user = Depends(get_user_headers),
                  db: Session = Depends(get_db),
                  service: DocumentService = Depends(get_document_service)):
    try:
        service.update_document(document, user.id)
        db.commit()
    except Exception as e:
        db.rollback()
        raise e



@router.put("/add-summary", status_code=status.HTTP_200_OK)
async def add_summary(document_id: int = Form(...),
                  summary: str = Form(...),
                  user = Depends(get_user_headers),
                  service: DocumentService = Depends(get_document_service)):

    service.add_summary(document_id, summary, user.id)


@router.delete('/{document_id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(document_id: int,
                        user=Depends(get_user_headers),
                        service: DocumentService = Depends(get_document_service)):
    return service.delete_document(document_id, user.id)


@router.get('/generate-report/{year_month}', status_code=status.HTTP_200_OK)
async def generate_report(year_month: str,
                          user=Depends(get_user_headers),
                          service: DocumentService = Depends(get_document_service)):

    if user.role != "MANAGER":
        raise http_401("Only managers can update metadata")

    return {"document_id": service.generate_report(year_month, user.id, user.email)}


@router.get("/summarize/{document_id}")
async def summarize_file(document_id: int,
                         user=Depends(get_user_headers),
                         service: DocumentService = Depends(get_document_service)):
    try:
        summary =  service.generate_summary(document_id, user.id)
        return {"summary": summary}
    except Exception as e:
        raise http_404(str(e))