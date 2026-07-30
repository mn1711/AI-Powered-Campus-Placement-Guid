from langchain_core.prompts import ChatPromptTemplate
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from app.core.config import settings
import concurrent.futures

FALLBACK_MODELS = [
    "meta/llama-3.1-8b-instruct",
    "google/gemma-2b",
    "deepseek-ai/deepseek-v4-flash",
    "meta/llama-3.1-70b-instruct"
]

study_plan_prompt = ChatPromptTemplate.from_messages([
    ("system", (
        "You are an expert AI Career Coach. Generate a comprehensive day-by-day study plan "
        "for a user preparing for a specific role at a specific company.\n"
        "Keep the entire plan under 800 words to ensure it fits within the API limits. "
        "Use markdown formatting with headers and bullet points.\n"
        "Include actionable daily goals, key technical topics to cover, and mock interview practice."
    )),
    ("human", "Company: {company}\nRole: {role}\nInterview Date/Days Left: {days}\nCurrent Level: {level}")
])

class StudyPlanAgent:
    def __init__(self):
        pass

    def generate_plan(self, company: str, role: str, days: str, level: str) -> str:
        last_error = None
        for model_name in FALLBACK_MODELS:
            try:
                # Initialize LLM for the current fallback model
                current_llm = ChatNVIDIA(
                    base_url="https://integrate.api.nvidia.com/v1",
                    api_key=settings.NVIDIA_API_KEY,
                    model=model_name,
                    max_tokens=2048,
                    timeout=120
                )
                
                chain = study_plan_prompt | current_llm

                def _generate():
                    response = chain.invoke({
                        "company": company,
                        "role": role,
                        "days": days,
                        "level": level
                    })
                    return response.content

                executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
                future = executor.submit(_generate)
                
                # Enforce a hard 120-second timeout on the generation
                return future.result(timeout=120)
                
            except concurrent.futures.TimeoutError:
                last_error = "## Server Timeout\nThe NVIDIA NIM server is currently experiencing high load or timing out. Please try again later, or contact support if the issue persists."
                print(f"Model {model_name} timed out, trying next...")
                continue
            except Exception as e:
                last_error = f"## Error\nAn error occurred while generating your study plan: {str(e)}"
                print(f"Model {model_name} failed with error {e}, trying next...")
                continue
                
        # If all models fail, return the last error
        return last_error or "## Error\nAll fallback models failed to generate a plan."

study_plan_agent = StudyPlanAgent()
