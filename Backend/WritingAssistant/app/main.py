from fastapi import FastAPI
from app.api.v1.routes import routers as v1_routers
from app.core.container import Container
from app.util.class_object import singleton

@singleton
class AppCreator:
    def __init__(self):

        self.app = FastAPI(
            title="writing-assistant-api",
            openapi_url="/api/openapi.json",
            version="0.0.1",
        )
        self.container = Container()
        self.db = self.container.db()
        @self.app.get("/")
        def root():
            return "service is working"

        self.app.include_router(v1_routers, prefix="/api/v1")

app_creator = AppCreator()
app = app_creator.app
db = app_creator.db
container = app_creator.container
