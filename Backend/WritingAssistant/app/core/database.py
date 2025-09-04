# core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "oracle+oracledb://writing_assisant:Assistant123@oracle-db:1521/?service_name=XEPDB1"

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Dependency za FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
