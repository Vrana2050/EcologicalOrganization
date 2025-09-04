# app/core/database.py
from contextlib import contextmanager
from typing import Any, Generator

from sqlalchemy import create_engine, orm
from sqlalchemy.orm import Session

from app.model import Base  # Base iz sqlacodegen (samo da zna o modelima)

DATABASE_URL = "oracle+oracledb://writing_assistant:Assistant123@oracle-db:1521/?service_name=XEPDB1"


class Database:
    def __init__(self, db_url: str = DATABASE_URL) -> None:
        self._engine = create_engine(db_url, echo=True)
        self._session_factory = orm.scoped_session(
            orm.sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=self._engine,
            )
        )

    @contextmanager
    def session(self) -> Generator[Session, Any, None]:
        """Context manager za otvaranje/zatvaranje sesije"""
        session: Session = self._session_factory()
        try:
            yield session
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()


# Singleton instanca baze
db = Database()


# Dependency za FastAPI
def get_db() -> Generator[Session, Any, None]:
    with db.session() as session:
        yield session
