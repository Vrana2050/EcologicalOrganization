from fastapi import FastAPI
from models import Base
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from routers.auth import router as auth_router

app = FastAPI()

origins = [
    "http://localhost:4200",  # Gateway
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


@app.get('/healthy')
def health_check():
    return {'status': 'Healthy!'}

app.include_router(auth_router)