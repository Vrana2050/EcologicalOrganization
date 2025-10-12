from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

#SQLALCHEMY_DATABASE_URL = 'sqlite:///./todosapp.db'

import os

db_url = os.getenv("DATABASE_URL")  
SQLALCHEMY_DATABASE_URL = db_url if db_url else "postgresql+psycopg2://postgres:postgres@localhost:5432/UserManagement"
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

Base.metadata.create_all(bind=engine)



