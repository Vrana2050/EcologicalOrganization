from fastapi import FastAPI
from models import Base, UserRoles, Users
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from routers.auth import router as auth_router

app = FastAPI()

origins = [
    "http://localhost:9000",  # Gateway
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def on_startup():
    from database import SessionLocal
    db = SessionLocal()
    if not db.query(Users).first():
        db.add(Users(id=1000,email="admin@admin.com", first_name="Pera", last_name="Peric", password="$2b$12$y6XDBqhb5q7QJMZmMwaYoO4rntUuCF2RAjrsn26xeO6in3rPNT5De",since="2025-09-07 00:43:55.13873", is_active=True))
        db.commit()
    if not db.query(UserRoles).first():
        db.add(UserRoles(user_id=1000, role="ADMIN", subsystem="WA"))

@app.get('/healthy')
def health_check():
    return {'status': 'Healthy!'}

app.include_router(auth_router)
