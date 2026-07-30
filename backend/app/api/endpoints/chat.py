from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional

from app.ai.agents.interview_agent import interview_agent
from app.ai.agents.study_plan_agent import study_plan_agent
# from app.api.deps import get_current_user # To secure endpoints

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    company_filter: Optional[str] = None
    role_filter: Optional[str] = None

class StudyPlanRequest(BaseModel):
    company: str
    role: str
    days: str
    level: str

@router.post("/chat")
def chat_with_mentor(request: ChatRequest):
    filters = {}
    if request.company_filter:
        filters["company"] = request.company_filter
    if request.role_filter:
        filters["role"] = request.role_filter
        
    query = request.query
    is_mock = False
    if query.startswith("[MOCK INTERVIEW MODE] "):
        is_mock = True
        query = query.replace("[MOCK INTERVIEW MODE] ", "", 1)
        
    answer = interview_agent.get_chat_response(query, filters if filters else None, is_mock_interview=is_mock)
    return {"answer": answer}

@router.post("/study-plan")
def generate_study_plan(request: StudyPlanRequest):
    plan = study_plan_agent.generate_plan(
        company=request.company,
        role=request.role,
        days=request.days,
        level=request.level
    )
    return {"plan": plan}
