from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.sql import func
import enum

from app.core.database import Base

class DocumentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class DocumentVisibility(str, enum.Enum):
    PRIVATE = "private"
    PUBLIC = "public"
    PENDING_APPROVAL = "pending_approval"

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.PENDING, nullable=False)
    visibility = Column(Enum(DocumentVisibility), default=DocumentVisibility.PRIVATE, nullable=False)
    metadata_json = Column(JSON, nullable=True) # stores company, role, year, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
