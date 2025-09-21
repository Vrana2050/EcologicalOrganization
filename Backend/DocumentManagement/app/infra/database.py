from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "oracle+cx_oracle://luka:lukaoracle@localhost:1521/?service_name=XEPDB1"

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

