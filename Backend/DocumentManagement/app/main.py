from fastapi import FastAPI
from app.api.router import router
app = FastAPI()

app.include_router(router=router, prefix="/api")
@app.get("/health_check")
async def health_check():
    return {"message": "App is up and running"}