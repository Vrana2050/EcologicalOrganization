from fastapi import FastAPI

app = FastAPI()

# health check ruta
@app.get("/")
def root():
    return {"msg": "🚀"}
