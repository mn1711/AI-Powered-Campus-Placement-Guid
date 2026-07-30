from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
from app.models.document import DocumentStatus, DocumentVisibility

class DocumentBase(BaseModel):
    filename: str
    visibility: DocumentVisibility = DocumentVisibility.PRIVATE
    metadata_json: Optional[Dict[str, Any]] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: int
    user_id: int
    status: DocumentStatus
    created_at: datetime

    class Config:
        from_attributes = True
