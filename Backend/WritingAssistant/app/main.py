from fastapi import FastAPI, Depends
from fastapi.openapi.utils import get_openapi
from app.api.v1.routes import routers as v1_routers
from app.core.container import Container
from app.util.class_object import singleton
from app.core.dependencies import get_current_user
from fastapi.middleware.cors import CORSMiddleware

@singleton
class AppCreator:
    def __init__(self):

        self.app = FastAPI(
            title="writing-assistant-api",
            openapi_url="/api/openapi.json",
            version="0.0.1",
            dependencies=[Depends(get_current_user)],  
        )

        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:4200"],  
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        self.container = Container()
        self.db = self.container.db()

        @self.app.get("/")
        def root():
            return "service is working"

        self.app.include_router(v1_routers, prefix="/api/v1")

        def custom_openapi():
            if self.app.openapi_schema:
                return self.app.openapi_schema

            openapi_schema = get_openapi(
                title=self.app.title,
                version=self.app.version,
                routes=self.app.routes,
                description=getattr(self.app, "description", None),
            )
            components = openapi_schema.setdefault("components", {})
            security_schemes = components.setdefault("securitySchemes", {})
            security_schemes["XUserId"] = {
                "type": "apiKey",
                "name": "x-user-id",
                "in": "header",
            }
            security_schemes["XUserRole"] = {
                "type": "apiKey",
                "name": "x-user-role",
                "in": "header",
            }

            openapi_schema["security"] = [{"XUserId": [], "XUserRole": []}]
            self.app.openapi_schema = openapi_schema
            return self.app.openapi_schema

        self.app.openapi = custom_openapi

app_creator = AppCreator()
app = app_creator.app
db = app_creator.db
container = app_creator.container
