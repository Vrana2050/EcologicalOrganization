from datetime import datetime, timezone

from app.repository.chat_session_repository import ChatSessionRepository
from app.repository.template_repository import TemplateRepository
from app.repository.document_type_repository import DocumentTypeRepository
from app.repository.prompt_version_repository import PromptVersionRepository
from app.repository.session_section_repository import SessionSectionRepository

from app.services.base_service import BaseService
from app.core.exceptions import AuthError, NotFoundError

from app.schema.chat_session_schema import (
    CreateChatSession,
    PatchChatSessionTitle,
    CreateTestChatSession,
    ChatSessionQuery,
    PatchChatSessionDocumentType,
    ChatSessionPageOut,
    ChatSessionOut,
)
from app.schema.pagination_schema import PaginationMeta
from app.schema.session_section_schema import CreateSessionSection

from app.model import PromptVersion
from app.model.template import Template


class ChatSessionService(BaseService):
    def __init__(
        self,
        repository: ChatSessionRepository,
        template_repository: TemplateRepository,
        document_type_repository: DocumentTypeRepository,
        prompt_version_repository: PromptVersionRepository,
        session_section_repository: SessionSectionRepository,
    ):
        self.chat_session_repository = repository
        self.template_repository = template_repository
        self.document_type_repository = document_type_repository
        self.prompt_version_repository = prompt_version_repository
        self.session_section_repository = session_section_repository
        super().__init__(repository)

    def add(self, schema: CreateChatSession):
        now = datetime.now(timezone.utc)

        tmpl = self.template_repository.read_by_id(
            schema.template_id,
            eagers=[Template.template_section],
        )
        schema.document_type_id = tmpl.document_type_id
        schema.title = schema.title or f"Konverzacija {now.strftime('%Y-%m-%d %H:%M:%S')}"
        schema.deleted = 0
        schema.created_at = now
        schema.updated_at = now

        created = self.chat_session_repository.create(schema)

        if getattr(tmpl, "template_section", None):
            for ts in sorted(tmpl.template_section, key=lambda x: (x.position or 0, x.id)):
                payload = CreateSessionSection(
                    session_id=created.id,
                    template_section_id=ts.id,
                    name=ts.name,
                    position=ts.position or 0,
                    deleted=0,
                )
                self.session_section_repository.create(payload)

        return ChatSessionOut.model_validate(created)

    def add_test(self, schema: CreateTestChatSession, user_id: int):
        now = datetime.now(timezone.utc)

        tmpl = self.template_repository.find_by_name("prazan")

        pv = self.prompt_version_repository.read_by_id(
            schema.test_prompt_version_id, eagers=[PromptVersion.prompt]
        )
        if getattr(pv, "deleted", 0) == 1:
            raise NotFoundError(detail="Prompt version not found")

        document_type_id = int(pv.prompt.document_type_id)

        title = (
            schema.title
            or f"Test - {getattr(pv, 'name', 'verzija')} - {now.strftime('%Y-%m-%d')}"
        ).strip()

        payload = CreateTestChatSession(
            template_id=int(tmpl.id),
            document_type_id=document_type_id,
            title=title,
            created_by=user_id,
            deleted=0,
            created_at=now,
            updated_at=now,
            is_test_session=1,
            test_prompt_version_id=int(pv.id),
        )

        created = self.chat_session_repository.create(payload)
        return ChatSessionOut.model_validate(created)

    def update_title(self, chat_session_id: int, title: str, user_id: int):
        sess = self.chat_session_repository.read_by_id(chat_session_id)
        if sess.created_by != user_id:
            raise AuthError(detail="You can rename only your conversations!")
        
        patch = PatchChatSessionTitle(title=title, updated_at=datetime.now(timezone.utc))
        updated = self.chat_session_repository.update(chat_session_id, patch)
        return ChatSessionOut.model_validate(updated)

    def remove_by_id(self, chat_session_id: int, user_id: int):
        session = self.chat_session_repository.read_by_id(chat_session_id)
        if session.created_by != user_id:
            raise AuthError(detail="Forbidden")

        deleted_obj = self.chat_session_repository.delete_by_id(chat_session_id)
        return ChatSessionOut.model_validate(deleted_obj)

    def list(
        self, page: int = 1, per_page: int = 20, user_id: int = None
    ) -> ChatSessionPageOut:
        query = ChatSessionQuery(
            created_by=user_id,
            page=page,
            per_page=per_page,
            deleted=0,
            ordering="-updated_at",
        )
        result = self.chat_session_repository.read_by_options(query)

        items = [ChatSessionOut.model_validate(s) for s in result["founds"]]

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
        
        if session.is_test_session == 1:
            raise AuthError(detail="Forbidden")

        dt = self.document_type_repository.read_by_id(document_type_id)
        if not dt:
            raise NotFoundError(detail="Document type not found")

        patch = PatchChatSessionDocumentType(
            document_type_id=document_type_id,
            updated_at=datetime.now(timezone.utc),
        )

        updated = self.chat_session_repository.update(chat_session_id, patch)
        return ChatSessionOut.model_validate(updated)
