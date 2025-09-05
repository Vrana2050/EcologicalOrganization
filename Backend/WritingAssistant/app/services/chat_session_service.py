from datetime import datetime, timezone
from app.repository.chat_session_repository import ChatSessionRepository
from app.schema.chat_session_schema import CreateChatSession, PatchChatSessionTitle
from app.services.base_service import BaseService
from app.core.exceptions import AuthError, NotFoundError


class ChatSessionService(BaseService):
    def __init__(self, repository: ChatSessionRepository):
        self.chat_session_repository = repository
        super().__init__(repository)

    def add(self, schema: CreateChatSession):
        now = datetime.now(timezone.utc)

        schema.title = f"Chat {now.strftime('%Y-%m-%d %H:%M:%S')}"
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
            raise AuthError(detail="Forbidden.")


        deleted_obj = self.chat_session_repository.delete_by_id(chat_session_id)
        return deleted_obj