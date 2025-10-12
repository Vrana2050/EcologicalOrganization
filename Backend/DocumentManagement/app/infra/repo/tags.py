from typing import Optional
from sqlalchemy.orm import Session
from dataclasses import dataclass

from app.domain.tags import TagAssignment
from app.infra.mappers.tags import tag_db_to_domain, tag_domain_to_db, tag_assignment_domain_to_db, \
    tag_assignment_db_to_domain
from app.infra.tables import Tags, TagAssignments


@dataclass
class Tag:
    id: int
    name: str
    description: Optional[str] = None

class TagRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Tag] | None:
        db_tags = self.db.query(Tags).all()
        return [tag_db_to_domain(db_tag) for db_tag in db_tags] if db_tags else None

    def get_by_id(self, tag_id: int) -> Optional[Tag]:
        db_tag = self.db.query(Tags).filter(Tags.id == tag_id).first()
        return tag_db_to_domain(db_tag) if db_tag else None

    def get_by_name(self, tag_name: str) -> Optional[Tag]:
        db_tag = self.db.query(Tags).filter(Tags.name == tag_name).first()
        return tag_db_to_domain(db_tag) if db_tag else None

    def save(self, tag: Tag) -> Tag:
        db_tag = tag_domain_to_db(tag)
        self.db.add(db_tag)
        self.db.flush()
        self.db.refresh(db_tag)
        return tag_db_to_domain(db_tag)

    def update(self, tag: Tag) -> Optional[Tag]:
        db_tag = self.db.query(Tags).filter(Tags.id == tag.id).first()
        if not db_tag:
            return None

        db_tag.name = tag.name
        db_tag.description = tag.description

        self.db.commit()
        self.db.refresh(db_tag)
        return tag_db_to_domain(db_tag)

    def delete(self, tag_id: int) -> bool:
        db_tag = self.db.query(Tags).filter(Tags.id == tag_id).first()
        if not db_tag:
            return False

        self.db.delete(db_tag)
        self.db.commit()
        return True

    def assign_tag_to_document(self, tag_id: int, document_id: int) -> TagAssignment:
        assignment = TagAssignment(id=None, tag_id=tag_id, document_id=document_id)
        db_assignment = tag_assignment_domain_to_db(assignment)
        self.db.add(db_assignment)
        self.db.flush()
        self.db.refresh(db_assignment)
        return tag_assignment_db_to_domain(db_assignment)

    def assign_tag_to_directory(self, tag_id: int, directory_id: int) -> TagAssignment:
        assignment = TagAssignment(id=None, tag_id=tag_id, directory_id=directory_id)
        db_assignment = tag_assignment_domain_to_db(assignment)
        self.db.add(db_assignment)
        self.db.flush()
        self.db.refresh(db_assignment)
        return tag_assignment_db_to_domain(db_assignment)

    def remove_tag_from_document(self, tag_id, document_id):
        db_tag = self.db.query(TagAssignments).filter(TagAssignments.tag_id == tag_id,
                                                      TagAssignments.document_id == document_id).first()
        if not db_tag:
            return False

        self.db.delete(db_tag)
        self.db.commit()
        return True

    def remove_all_tags_from_document(self, document_id: int):
        (
            self.db.query(TagAssignments)
            .filter(TagAssignments.document_id == document_id)
            .delete(synchronize_session=False)
        )

    def remove_all_tags_from_directory(self, directory_id):
        (
            self.db.query(TagAssignments)
            .filter(TagAssignments.directory_id == directory_id)
            .delete(synchronize_session=False)
        )

