from dependency_injector import containers, providers

from app.core.database import Database

from app.repository.chat_session_repository import ChatSessionRepository
from app.repository.session_section_repository import SessionSectionRepository
from app.repository.section_instruction_repository import SectionInstructionRepository
from app.repository.section_iteration_repository import SectionIterationRepository 

from app.services.chat_session_service import ChatSessionService
from app.services.session_section_service import SessionSectionService
from app.services.section_instruction_service import SectionInstructionService
from app.services.section_iteration_service import SectionIterationService 


class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        modules=[
            "app.api.v1.endpoints.chat_session",
            "app.api.v1.endpoints.session_section",   
        ]
    )

    db = providers.Singleton(Database)

    chat_session_repository = providers.Factory(ChatSessionRepository, session_factory=db.provided.session)
    session_section_repository = providers.Factory(SessionSectionRepository, session_factory=db.provided.session)
    section_instruction_repository = providers.Factory(SectionInstructionRepository, session_factory=db.provided.session)
    section_iteration_repository = providers.Factory(SectionIterationRepository, session_factory=db.provided.session)


    chat_session_service = providers.Factory(ChatSessionService, repository=chat_session_repository)
    session_section_service = providers.Factory(
        SessionSectionService,
        repository=session_section_repository,
        chat_session_repository=chat_session_repository,  
    )
    section_instruction_service = providers.Factory(
        SectionInstructionService,
        repository=section_instruction_repository,
        session_section_repository=session_section_repository,
    )


    section_iteration_service = providers.Factory(                                            
        SectionIterationService,
        repository=section_iteration_repository,
        session_section_repository=session_section_repository,
        chat_session_repository=chat_session_repository,
    )