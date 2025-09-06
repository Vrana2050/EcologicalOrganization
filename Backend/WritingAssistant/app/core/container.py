from dependency_injector import containers, providers

from app.core.database import Database

from app.repository.chat_session_repository import ChatSessionRepository
from app.repository.session_section_repository import SessionSectionRepository
from app.repository.section_instruction_repository import SectionInstructionRepository
from app.repository.section_iteration_repository import SectionIterationRepository 
from app.repository.prompt_active_history_repository import PromptActiveHistoryRepository
from app.repository.global_instruction_repository import GlobalInstructionRepository
from app.repository.prompt_execution_repository import PromptExecutionRepository
from app.repository.model_output_repository import ModelOutputRepository

from app.services.chat_session_service import ChatSessionService
from app.services.session_section_service import SessionSectionService
from app.services.section_instruction_service import SectionInstructionService
from app.services.section_iteration_service import SectionIterationService 
from app.services.llm_service import LLMService


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
    prompt_active_history_repository = providers.Factory(PromptActiveHistoryRepository, session_factory=db.provided.session)
    global_instruction_repository = providers.Factory(GlobalInstructionRepository, session_factory=db.provided.session)
    prompt_execution_repository = providers.Factory(PromptExecutionRepository, session_factory=db.provided.session)
    model_output_repository = providers.Factory(ModelOutputRepository, session_factory=db.provided.session)


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
        prompt_active_history_repository=prompt_active_history_repository,
        gi_repo=global_instruction_repository,
        si_repo=section_instruction_repository,
        exec_repo=prompt_execution_repository,
        out_repo=model_output_repository,
        llm_service=providers.Singleton(LLMService),
    )
