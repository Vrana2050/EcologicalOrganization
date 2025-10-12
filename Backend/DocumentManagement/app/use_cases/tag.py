from typing import Optional, List

from app.core.exceptions import http_409
from app.domain.tags import Tag, TagAssignment
from app.infra.repo.tags import TagRepository


class TagService:

    def __init__(self, tag_repo: TagRepository):
        self.tag_repo = tag_repo


    def get_tag_by_id(self, tag_id: int) -> Optional[Tag]:
        return self.tag_repo.get_by_id(tag_id)

    def get_tag_by_name(self, tag_name: str) -> Optional[Tag]:
        return self.tag_repo.get_by_name(tag_name)

    def get_all_tags(self) -> List[Tag] | None:
        return self.tag_repo.get_all()

    def create_tag(self, tag: Tag) -> Tag:
        if self.get_tag_by_name(tag.name):
            raise http_409(f"Tag '{tag.name}' already exists")
        return self.tag_repo.save(tag)

    def update_tag(self, tag: Tag) -> Optional[Tag]:
        existing_tag = self.get_tag_by_name(tag.name)
        if existing_tag and tag.id != existing_tag.id:
            raise http_409(f"Tag '{tag.name}' already exists")
        return self.tag_repo.update(tag)

    def delete_tag(self, tag_id: int) -> bool:
        return self.tag_repo.delete(tag_id)

    def assign_tag_to_document(self, tag_id: int, document_id: int) -> TagAssignment:
        return self.tag_repo.assign_tag_to_document(tag_id, document_id)

    def assign_tag_to_directory(self, tag_id: int, directory_id: int) -> TagAssignment:
        return self.tag_repo.assign_tag_to_directory(tag_id, directory_id)

    def remove_tag_from_document(self, tag_id, document_id) -> bool:
        return self.tag_repo.remove_tag_from_document(tag_id, document_id)

    def remove_all_tags_from_document(self, document_id):
        return self.tag_repo.remove_all_tags_from_document(document_id)

    def remove_all_tags_from_directory(self, directory_id):
        return self.tag_repo.remove_all_tags_from_directory(directory_id)
