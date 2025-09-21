from app.domain.tags import Tag, TagAssignment
from app.infra.tables import Tags, TagAssignments


def tag_domain_to_db(tag: Tag) -> Tags:
    return Tags(
        id=tag.id,
        name=tag.name,
        description=tag.description
    )

def tag_db_to_domain(db_tag: Tags) -> Tag:
    return Tag(
        id=db_tag.id,
        name=db_tag.name,
        description=db_tag.description
    )

def tag_assignment_domain_to_db(assignment: TagAssignment) -> TagAssignments:
    return TagAssignments(
        id=assignment.id,
        tag_id=assignment.tag_id,
        document_id=assignment.document_id,
        directory_id=assignment.directory_id
    )

def tag_assignment_db_to_domain(db_assignment: TagAssignments) -> TagAssignment:
    return TagAssignment(
        id=db_assignment.id,
        tag_id=db_assignment.tag_id,
        document_id=db_assignment.document_id,
        directory_id=db_assignment.directory_id
    )