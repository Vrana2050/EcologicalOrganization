from fastapi import FastAPI
from app.api.router import router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.include_router(router=router, prefix="/api")

origins = [
    "http://localhost:4200",  # Angular dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Dozvoljeni frontend domeni
    allow_credentials=True,           # Ako koristiš cookies, sessions, itd.
    allow_methods=["*"],              # Dozvoli sve HTTP metode (GET, POST, itd.)
    allow_headers=["*"],              # Dozvoli sve headere (npr. Authorization)
)
@app.get("/health_check")
async def health_check():
    return {"message": "App is up and running"}