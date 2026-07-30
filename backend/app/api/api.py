from fastapi import APIRouter
from app.api.endpoints import chat, admin, documents

api_router = APIRouter()
api_router.include_router(chat.router, prefix="/ai", tags=["ai"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
