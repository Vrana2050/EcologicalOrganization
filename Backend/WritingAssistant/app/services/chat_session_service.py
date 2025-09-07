from datetime import datetime, timezone
from app.repository.chat_session_repository import ChatSessionRepository
from app.schema.chat_session_schema import CreateChatSession, PatchChatSessionTitle, ChatSessionQuery, ChatSessionPageOut, ChatSessionOut
from app.schema.pagination_schema import PaginationMeta
from app.services.base_service import BaseService
from app.core.exceptions import AuthError, NotFoundError


class ChatSessionService(BaseService):
    def __init__(self, repository: ChatSessionRepository):
        self.chat_session_repository = repository
        super().__init__(repository)

    def add(self, schema: CreateChatSession):
        now = datetime.now(timezone.utc)

        schema.title = f"Konverzacija {now.strftime('%Y-%m-%d %H:%M:%S')}"
        schema.deleted = 0
        
        schema.created_at = now
        schema.updated_at = now
        return self.chat_session_repository.create(schema)


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