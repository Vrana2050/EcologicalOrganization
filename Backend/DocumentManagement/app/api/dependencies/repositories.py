from sqlalchemy.orm import Session
from fastapi import Depends
from app.infra.database import get_db



def get_repository(repository):
    def _get_repository(session: Session = Depends(get_db)):
        return repository(session)

    return _get_repository
