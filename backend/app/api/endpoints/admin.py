from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ApprovalRequest(BaseModel):
    document_id: int
    approve: bool

@router.get("/pending-documents")
def get_pending_documents():
    # In reality, fetch Document where visibility == PENDING_APPROVAL
    return [
        {"id": 1, "filename": "google_sde_interview.pdf", "user_id": 42},
        {"id": 2, "filename": "amazon_system_design.docx", "user_id": 43},
    ]

@router.post("/approve")
def approve_document(request: ApprovalRequest):
    # In reality, update DB and re-embed chunk metadata as PUBLIC
    status = "approved" if request.approve else "rejected"
    return {"message": f"Document {request.document_id} has been {status}."}
