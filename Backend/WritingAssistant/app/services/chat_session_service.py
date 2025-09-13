from datetime import datetime, timezone
from app.repository.chat_session_repository import ChatSessionRepository
from app.schema.chat_session_schema import CreateChatSession, PatchChatSessionTitle, ChatSessionQuery, PatchChatSessionDocumentType, ChatSessionPageOut, ChatSessionOut
from app.schema.pagination_schema import PaginationMeta
from app.services.base_service import BaseService
from app.core.exceptions import AuthError, NotFoundError
from app.repository.template_repository import TemplateRepository
from app.repository.document_type_repository import DocumentTypeRepository

class ChatSessionService(BaseService):
    def __init__(
        self,
        repository: ChatSessionRepository,
        template_repository: TemplateRepository,
        document_type_repository: DocumentTypeRepository,
    ):
        self.chat_session_repository = repository
        self.template_repository = template_repository
        self.document_type_repository = document_type_repository
        super().__init__(repository)

    def add(self, schema: CreateChatSession):
        now = datetime.now(timezone.utc)


        tmpl = self.template_repository.read_by_id(schema.template_id)
        schema.document_type_id = tmpl.document_type_id


        schema.title = schema.title or f"Konverzacija {now.strftime('%Y-%m-%d %H:%M:%S')}"
        schema.deleted = 0
        schema.created_at = now
        schema.updated_at = now

        created = self.chat_session_repository.create(schema)

        return ChatSessionOut(
            id=created.id,
            template_id=created.template_id,
            document_type_id=created.document_type_id,
            created_by=created.created_by,
            title=created.title,
            updated_at=created.updated_at,
        )


    def update_title(self, chat_session_id: int, title: str, user_id: int):
        sess = self.chat_session_repository.read_by_id(chat_session_id)
        if sess.created_by != user_id:
            raise AuthError(detail="You can rename only your conversations!")

        patch = PatchChatSessionTitle(title=title, updated_at=datetime.now(timezone.utc))
        return self.chat_session_repository.update(chat_session_id, patch)
    
    def remove_by_id(self, chat_session_id: int, user_id: int):

        session = self.chat_session_repository.read_by_id(chat_session_id)
        if session.created_by != user_id:
            raise AuthError(detail="Forbidden")


        deleted_obj = self.chat_session_repository.delete_by_id(chat_session_id)
        return deleted_obj
    
    def list(self, page: int = 1, per_page: int = 20, user_id: int = None) -> ChatSessionPageOut:
        query = ChatSessionQuery(
            created_by=user_id,
            page=page,
            per_page=per_page,
            deleted=0,
            ordering="-updated_at",
        )
        result = self.chat_session_repository.read_by_options(query)

        items = [
            ChatSessionOut(
                id=s.id,
                template_id=s.template_id,
                document_type_id = s.document_type_id,
                created_by=s.created_by,
                title=s.title,
                updated_at=s.updated_at,
            )
            for s in result["founds"]
        ]

        return ChatSessionPageOut(
            items=items,
            meta=PaginationMeta(
                page=result["search_options"]["page"],
                per_page=result["search_options"]["per_page"],
                total_count=result["search_options"]["total_count"],
            ),
        )
    
    def update_document_type(self, chat_session_id: int, document_type_id: int, user_id: int):
        session = self.chat_session_repository.read_by_id(chat_session_id)
        if session.created_by != user_id:
            raise AuthError(detail="Forbidden")

        dt = self.document_type_repository.read_by_id(document_type_id)
        if not dt:
            raise NotFoundError(detail="Document type not found")

        patch = PatchChatSessionDocumentType(
            document_type_id=document_type_id,
            updated_at=datetime.now(timezone.utc),
        )

        updated = self.chat_session_repository.update(chat_session_id, patch)

        return ChatSessionOut(
            id=updated.id,
            template_id=updated.template_id,
            document_type_id=updated.document_type_id,
            created_by=updated.created_by,
            title=updated.title,
            updated_at=updated.updated_at,
    )