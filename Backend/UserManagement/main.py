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
        db.add(Users(id=1001,email="marko@manager.com", first_name="Marko", last_name="Markovic", password="$2b$12$y6XDBqhb5q7QJMZmMwaYoO4rntUuCF2RAjrsn26xeO6in3rPNT5De",since="2025-09-07 00:43:55.13873", is_active=True))
        db.add(Users(id=1002,email="luka@employee.com", first_name="Luka", last_name="Lukic", password="$2b$12$y6XDBqhb5q7QJMZmMwaYoO4rntUuCF2RAjrsn26xeO6in3rPNT5De",since="2025-09-07 00:43:55.13873", is_active=True))
        db.add(Users(id=1003,email="mitar@employee.com", first_name="Mitar", last_name="Miric", password="$2b$12$y6XDBqhb5q7QJMZmMwaYoO4rntUuCF2RAjrsn26xeO6in3rPNT5De",since="2025-09-07 00:43:55.13873", is_active=True))
        db.add(Users(id=1004,email="milica@employee.com", first_name="Milica", last_name="Milicevic", password="$2b$12$y6XDBqhb5q7QJMZmMwaYoO4rntUuCF2RAjrsn26xeO6in3rPNT5De",since="2025-09-07 00:43:55.13873", is_active=True))
        db.add(Users(id=1005,email="andrija@employee.com", first_name="Andrija", last_name="Petkovic", password="$2b$12$y6XDBqhb5q7QJMZmMwaYoO4rntUuCF2RAjrsn26xeO6in3rPNT5De",since="2025-09-07 00:43:55.13873", is_active=True))
        db.add(Users(id=1006,email="nikola@employee.com", first_name="Nikola", last_name="Markovic", password="$2b$12$y6XDBqhb5q7QJMZmMwaYoO4rntUuCF2RAjrsn26xeO6in3rPNT5De",since="2025-09-07 00:43:55.13873", is_active=True))
        db.add(Users(id=1007,email="marija@employee.com", first_name="Marija", last_name="Peric", password="$2b$12$y6XDBqhb5q7QJMZmMwaYoO4rntUuCF2RAjrsn26xeO6in3rPNT5De",since="2025-09-07 00:43:55.13873", is_active=True))
        db.add(Users(id=1008,email="anastasija@employee.com", first_name="Anastasija", last_name="Zivkokvic", password="$2b$12$y6XDBqhb5q7QJMZmMwaYoO4rntUuCF2RAjrsn26xeO6in3rPNT5De",since="2025-09-07 00:43:55.13873", is_active=True))
        db.add(Users(id=1009,email="tea@employee.com", first_name="Tea", last_name="Taric", password="$2b$12$y6XDBqhb5q7QJMZmMwaYoO4rntUuCF2RAjrsn26xeO6in3rPNT5De",since="2025-09-07 00:43:55.13873", is_active=True))
        db.add(Users(id=1010,email="nevena@manager.com", first_name="Nevena", last_name="Babic", password="$2b$12$y6XDBqhb5q7QJMZmMwaYoO4rntUuCF2RAjrsn26xeO6in3rPNT5De",since="2025-09-07 00:43:55.13873", is_active=True))

        db.commit()
    if not db.query(UserRoles).first():
        db.add(UserRoles(user_id=1000, role="ADMIN", subsystem="WA"))
        db.add(UserRoles(user_id=1001, role="MANAGER", subsystem="WA"))
        db.add(UserRoles(user_id=1002, role="EMPLOYEE", subsystem="WA"))
        db.add(UserRoles(user_id=1003, role="EMPLOYEE", subsystem="WA"))
        db.add(UserRoles(user_id=1004, role="EMPLOYEE", subsystem="WA"))
        db.add(UserRoles(user_id=1005, role="EMPLOYEE", subsystem="WA"))
        db.add(UserRoles(user_id=1006, role="EMPLOYEE", subsystem="WA"))
        db.add(UserRoles(user_id=1007, role="EMPLOYEE", subsystem="WA"))
        db.add(UserRoles(user_id=1008, role="EMPLOYEE", subsystem="WA"))
        db.add(UserRoles(user_id=1009, role="EMPLOYEE", subsystem="WA"))
        db.add(UserRoles(user_id=1010, role="MANAGER", subsystem="WA"))
        db.add(UserRoles(user_id=1001, role="MANAGER", subsystem="DM"))
        db.add(UserRoles(user_id=1002, role="EMPLOYEE", subsystem="DM"))
        db.add(UserRoles(user_id=1003, role="EMPLOYEE", subsystem="DM"))
        db.add(UserRoles(user_id=1004, role="EMPLOYEE", subsystem="DM"))
        db.add(UserRoles(user_id=1005, role="EMPLOYEE", subsystem="DM"))
        db.add(UserRoles(user_id=1006, role="EMPLOYEE", subsystem="DM"))
        db.add(UserRoles(user_id=1007, role="EMPLOYEE", subsystem="DM"))
        db.add(UserRoles(user_id=1008, role="EMPLOYEE", subsystem="DM"))
        db.add(UserRoles(user_id=1009, role="EMPLOYEE", subsystem="DM"))
        db.add(UserRoles(user_id=1010, role="MANAGER", subsystem="DM"))
        db.add(UserRoles(user_id=1001, role="MANAGER", subsystem="DP"))
        db.add(UserRoles(user_id=1002, role="EMPLOYEE", subsystem="DP"))
        db.add(UserRoles(user_id=1003, role="EMPLOYEE", subsystem="DP"))
        db.add(UserRoles(user_id=1004, role="EMPLOYEE", subsystem="DP"))
        db.add(UserRoles(user_id=1005, role="EMPLOYEE", subsystem="DP"))
        db.add(UserRoles(user_id=1006, role="EMPLOYEE", subsystem="DP"))
        db.add(UserRoles(user_id=1007, role="EMPLOYEE", subsystem="DP"))
        db.add(UserRoles(user_id=1008, role="EMPLOYEE", subsystem="DP"))
        db.add(UserRoles(user_id=1009, role="EMPLOYEE", subsystem="DP"))
        db.add(UserRoles(user_id=1010, role="MANAGER", subsystem="DP"))
        db.add(UserRoles(user_id=1001, role="MANAGER", subsystem="PM"))
        db.add(UserRoles(user_id=1002, role="EMPLOYEE", subsystem="PM"))
        db.add(UserRoles(user_id=1003, role="EMPLOYEE", subsystem="PM"))
        db.add(UserRoles(user_id=1004, role="EMPLOYEE", subsystem="PM"))
        db.add(UserRoles(user_id=1005, role="EMPLOYEE", subsystem="PM"))
        db.add(UserRoles(user_id=1006, role="EMPLOYEE", subsystem="PM"))
        db.add(UserRoles(user_id=1007, role="EMPLOYEE", subsystem="PM"))
        db.add(UserRoles(user_id=1008, role="EMPLOYEE", subsystem="PM"))
        db.add(UserRoles(user_id=1009, role="EMPLOYEE", subsystem="PM"))
        db.add(UserRoles(user_id=1010, role="MANAGER", subsystem="PM"))
        db.commit()


@app.get('/healthy')
def health_check():
    return {'status': 'Healthy!'}

app.include_router(auth_router)
