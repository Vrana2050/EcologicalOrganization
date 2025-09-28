from __future__ import annotations

from fastapi import FastAPI, Depends
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes import routers as v1_routers
from app.core.container import Container
from app.core.dependencies import get_current_user
from app.util.class_object import singleton

from app.core.vector_client import (
    is_ready as weav_is_ready,
    close as weav_close,
    get_client as get_vector_client,
)
from app.core.vector_schema import ensure_minimal_collections


@singleton
class AppCreator:
    def __init__(self) -> None:
        self.app = FastAPI(
            title="writing-assistant-api",
            openapi_url="/api/openapi.json",
            version="0.0.1",
            dependencies=[Depends(get_current_user)],
        )

        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:4200", "http://localhost:9000"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        self.container = Container()
        self.db = self.container.db()

        @self.app.get("/writing-assistant/health")
        def root():
            return "service is working"

        def _on_startup_vector():
            if not weav_is_ready():
                raise RuntimeError(
                    "Weaviate nije spreman (proveri docker-compose, port mapiranje 8081:8080 i mrežu)."
                )
            ensure_minimal_collections()

        def _on_shutdown_vector():
            weav_close()

        self.app.add_event_handler("startup", _on_startup_vector)
        self.app.add_event_handler("shutdown", _on_shutdown_vector)

        @self.app.get("/writing-assistant/vector/health")
        def vector_health():
            return {"weaviate_ready": weav_is_ready()}

        @self.app.get("/writing-assistant/vector/collections")
        def vector_collections():
            client = get_vector_client()
            return {"collections": list(client.collections.list_all())}

        self.app.include_router(v1_routers, prefix="/writing-assistant")

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
            security_schemes["XUserId"] = {"type": "apiKey", "name": "x-user-id", "in": "header"}
            security_schemes["XUserRole"] = {"type": "apiKey", "name": "x-user-role", "in": "header"}
            security_schemes["XUserEmail"] = {"type": "apiKey", "name": "x-email", "in": "header"}

            openapi_schema["security"] = [{"XUserId": [], "XUserRole": [], "XUserEmail": []}]
            self.app.openapi_schema = openapi_schema
            return self.app.openapi_schema

        self.app.openapi = custom_openapi


app_creator = AppCreator()
app = app_creator.app
db = app_creator.db
container = app_creator.container
