from datetime import datetime, UTC

from sqlalchemy.orm.session import Session

from app.constants import SHARED_DIRECTORY_NAME
from app.infra.mappers.directory import domain_to_db, db_to_domain
from app.domain.directory import Directory, RetentionType, DirectoryType
from app.infra.tables import Directories

class DirectoryRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, id: int) -> Directory | None:
        dir = self.db.query(Directories).filter(Directories.id == id).first()
        return db_to_domain(dir) if dir else None

    def get_by_name_in_directory(self, name: str, parent_id: int) -> Directory | None:
        db_obj = self.db.query(Directories).filter(Directories.name == name).filter(Directories.parent_directory_id == parent_id).first()
        return db_to_domain(db_obj) if db_obj else None

    def save(self, directory: Directory) -> Directory:
        saved_directory = domain_to_db(directory)
        self.db.add(saved_directory)
        self.db.commit()
        self.db.refresh(saved_directory)
        return db_to_domain(saved_directory)

    def create_shared_for_employee(self, employee_id: int) -> Directory:
        shared_directory = domain_to_db(Directory(
            id=None,
            name=SHARED_DIRECTORY_NAME,
            created_at=datetime.now(UTC),
            creator_id=employee_id,
            last_modified=datetime.now(UTC),
            retention_type=RetentionType.INHERITED,
            directory_type=DirectoryType.SYSTEM,
            parent_directory_id=None,
            retention_id=None))

        self.db.add(shared_directory)
        self.db.commit()
        self.db.refresh(shared_directory)
        return db_to_domain(shared_directory)


    def get_shared_directory(self, employee_id: int) -> Directory | None:
        db_dir = self.db.query(Directories).filter(Directories.creator_id == employee_id,
                                                              Directories.name == SHARED_DIRECTORY_NAME,
                                                              Directories.directory_type == DirectoryType.SYSTEM).first()
        if db_dir:
            return db_to_domain(db_dir)
        return None