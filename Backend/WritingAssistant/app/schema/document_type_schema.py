from pydantic import BaseModel

class CreateDocumentType(BaseModel):
    name: str