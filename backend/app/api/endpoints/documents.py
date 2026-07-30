from fastapi import APIRouter, UploadFile, File, Depends, Form
from app.ai.document_processor import document_processor
from app.ai.vector_store import vector_store_manager

# from app.api.deps import get_current_user
# from app.models.user import User

router = APIRouter()

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    company: str = Form(None),
    role: str = Form(None),
    # current_user: User = Depends(get_current_user)
):
    """
    Endpoint for end-users to upload their own interview experiences.
    """
    content = await file.read()
    
    # Construct metadata ensuring this is marked as private to the user
    metadata = {
        "source": file.filename,
        "visibility": "private",  # Private by default
        "user_id": 42, # Hardcoded for now, normally use current_user.id
        "company": company,
        "role": role
    }

    try:
        # Process and chunk the document
        chunks = document_processor.process_document(content, file.filename, metadata)
        
        # Embed and store in Qdrant
        vector_store_manager.add_documents(chunks)
        
        # In a full app, you would also save a record to the PostgreSQL `documents` table here.
        
        return {"message": f"Successfully processed and stored {len(chunks)} chunks.", "filename": file.filename}
    
    except Exception as e:
        return {"error": str(e)}
