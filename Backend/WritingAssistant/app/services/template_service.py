from app.services.base_service import BaseService
from app.repository.template_repository import TemplateRepository
from app.schema.template_schema import TemplateOut, TemplatePageOut, TemplateQuery
from app.schema.pagination_schema import PaginationMeta

from app.model.template import Template


class TemplateService(BaseService):
    def __init__(self, repository: TemplateRepository):
        super().__init__(repository)
        self.repo = repository

    def list(self, page: int = 1, per_page: int = 20) -> TemplatePageOut:
        query = TemplateQuery(page=page, per_page=per_page, deleted=0, ordering="-updated_at")
        result = self.repo.read_by_options(query, eagers=[Template.document_type])

        items = [
            TemplateOut(
                id=t.id,
                name=t.name,
                document_type_id=t.document_type_id,
                document_type_name=t.document_type.name if t.document_type else None,  
                updated_at=t.updated_at,
            )
            for t in result["founds"]
        ]

        return TemplatePageOut(
            items=items,
            meta=PaginationMeta(
                page=result["search_options"]["page"],
                per_page=result["search_options"]["per_page"],
                total_count=result["search_options"]["total_count"],
            ),
        )
