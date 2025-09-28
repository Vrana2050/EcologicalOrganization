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
from app.repository.prompt_repository import PromptRepository
from app.repository.document_type_repository import DocumentTypeRepository
from app.repository.prompt_version_repository import PromptVersionRepository
from app.repository.template_repository import TemplateRepository
from app.repository.section_draft_repository import SectionDraftRepository
from app.repository.model_pricing_repository import ModelPricingRepository
from app.repository.output_feedback_repository import OutputFeedbackRepository
from app.repository.analytics_repository import AnalyticsRepository
from app.repository.storage_object_repository import StorageObjectRepository
from app.repository.repo_folder_repository import RepoFolderRepository

from app.services.chat_session_service import ChatSessionService
from app.services.session_section_service import SessionSectionService
from app.services.section_instruction_service import SectionInstructionService
from app.services.section_iteration_service import SectionIterationService
from app.services.llm_service import LLMService
from app.services.prompt_service import PromptService
from app.services.prompt_version_service import PromptVersionService
from app.services.template_service import TemplateService
from app.services.document_type_service import DocumentTypeService
from app.services.model_pricing_service import ModelPricingService
from app.services.output_feedback_service import OutputFeedbackService
from app.services.analytics_service import AnalyticsService
from app.services.storage_object_service import StorageObjectService
from app.services.repo_folder_service import RepoFolderService

from app.services.llm_client.openai_client import OpenAIClient
from app.services.llm_client.mock_client import MockLLMClient
from app.services.report.report_service import DocTypeReportService
from app.services.report.doc_type_report_renderer import DocTypeReportHtmlRenderer
from app.services.report.xhtml2pdf_engine import Xhtml2PdfEngine

from app.repository.vector_repository import VectorRepository
from app.services.vector_service import VectorService

from app.services.rag.embedding_service import EmbeddingService
from app.services.rag.chunking_service import ChunkingService
from app.services.rag.summarization_service import SummarizationService
from app.services.rag.vector_ingestion_service import VectorIngestionService


class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        modules=[
            "app.api.v1.endpoints.chat_session",
            "app.api.v1.endpoints.session_section",
            "app.api.v1.endpoints.prompt",
            "app.api.v1.endpoints.prompt_version",
            "app.api.v1.endpoints.template",
            "app.api.v1.endpoints.document_type",
            "app.api.v1.endpoints.output_feedback",
            "app.api.v1.endpoints.analytics",
            "app.api.v1.endpoints.report",
            "app.api.v1.endpoints.storage_object",
            "app.api.v1.endpoints.repo_folder",
        ]
    )

    db = providers.Singleton(Database)
    
    vector_repository = providers.Singleton(VectorRepository)
    vector_service = providers.Factory(VectorService, repository=vector_repository)



    chat_session_repository = providers.Factory(ChatSessionRepository, session_factory=db.provided.session)
    session_section_repository = providers.Factory(SessionSectionRepository, session_factory=db.provided.session)
    section_instruction_repository = providers.Factory(SectionInstructionRepository, session_factory=db.provided.session)
    section_iteration_repository = providers.Factory(SectionIterationRepository, session_factory=db.provided.session)
    prompt_active_history_repository = providers.Factory(PromptActiveHistoryRepository, session_factory=db.provided.session)
    global_instruction_repository = providers.Factory(GlobalInstructionRepository, session_factory=db.provided.session)
    prompt_execution_repository = providers.Factory(PromptExecutionRepository, session_factory=db.provided.session)
    model_output_repository = providers.Factory(ModelOutputRepository, session_factory=db.provided.session)
    prompt_repository = providers.Factory(PromptRepository, session_factory=db.provided.session)
    document_type_repository = providers.Factory(DocumentTypeRepository, session_factory=db.provided.session)
    prompt_version_repository = providers.Factory(PromptVersionRepository, session_factory=db.provided.session)
    template_repository = providers.Factory(TemplateRepository, session_factory=db.provided.session)
    section_draft_repository = providers.Factory(SectionDraftRepository, session_factory=db.provided.session)
    storage_object_repository = providers.Factory(StorageObjectRepository, session_factory=db.provided.session)
    model_pricing_repository = providers.Factory(ModelPricingRepository, session_factory=db.provided.session)
    output_feedback_repository = providers.Factory(OutputFeedbackRepository, session_factory=db.provided.session)
    analytics_repository = providers.Factory(AnalyticsRepository, session_factory=db.provided.session)
    repo_folder_repository = providers.Factory(RepoFolderRepository, session_factory=db.provided.session)

    chat_session_service = providers.Factory(
        ChatSessionService,
        repository=chat_session_repository,
        template_repository=template_repository,
        document_type_repository=document_type_repository,
        prompt_version_repository=prompt_version_repository,
        session_section_repository=session_section_repository,  
    )

    session_section_service = providers.Factory(
        SessionSectionService,
        repository=session_section_repository,
        chat_session_repository=chat_session_repository,
        global_instruction_repository=global_instruction_repository,
    )

    section_instruction_service = providers.Factory(
        SectionInstructionService,
        repository=section_instruction_repository,
        session_section_repository=session_section_repository,
    )

    document_type_service = providers.Factory(
        DocumentTypeService,
        repository=document_type_repository,
    )

    ai_client = providers.Singleton(OpenAIClient)   
    # ai_client = providers.Singleton(MockLLMClient) 

    llm_service = providers.Singleton(LLMService, backend=ai_client)

    model_pricing_service = providers.Factory(
        ModelPricingService,
        repository=model_pricing_repository,
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
        llm_service=llm_service,   
        doc_type_service=document_type_service,
        pv_repo=prompt_version_repository,
        draft_repo=section_draft_repository,
        pricing_service=model_pricing_service,
    )

    prompt_service = providers.Factory(
        PromptService,
        repository=prompt_repository,
        doc_type_service=document_type_service,
        pah_repository=prompt_active_history_repository,
    )

    prompt_version_service = providers.Factory(
        PromptVersionService,
        repository=prompt_version_repository,
        prompt_repo=prompt_repository,
        pah_repo=prompt_active_history_repository,
    )

    template_service = providers.Factory(
        TemplateService,
        repository=template_repository,
        file_repository=storage_object_repository,
        session_factory=db.provided.session,
    )

    output_feedback_service = providers.Factory(
        OutputFeedbackService,
        repository=output_feedback_repository,
        model_output_repo=model_output_repository,
        prompt_exec_repo=prompt_execution_repository,
        chat_session_repo=chat_session_repository,
    )

    analytics_service = providers.Factory(
        AnalyticsService,
        analytics_repo=analytics_repository,
        prompt_version_repository=prompt_version_repository,
        prompt_active_history_repository=prompt_active_history_repository,
    )

    report_renderer = providers.Singleton(DocTypeReportHtmlRenderer)
    report_pdf_engine = providers.Singleton(Xhtml2PdfEngine)

    report_service = providers.Factory(
        DocTypeReportService,
        analytics_service=analytics_service,
        renderer=report_renderer,
        pdf_engine=report_pdf_engine,
    )


    embedding_service = providers.Singleton(EmbeddingService)
    chunking_service = providers.Singleton(
        ChunkingService,
        max_model_tokens=512,
        target_tokens=360,
        overlap_tokens=64,
    )
    
    summarization_service = providers.Factory(SummarizationService, llm=llm_service)


    vector_ingestion_service = providers.Factory(
        VectorIngestionService,
        vector_service=vector_service,
        summarizer=summarization_service,
        chunker=chunking_service,
        embed=embedding_service,
    )


    storage_object_service = providers.Factory(
        StorageObjectService,
        repository=storage_object_repository,
        session_factory=db.provided.session,
        ingestion_service=vector_ingestion_service,
        vector_service=vector_service,   
    )
    repo_folder_service = providers.Factory(
        RepoFolderService,
        repository=repo_folder_repository,
        session_factory=db.provided.session,
    )
    
