from langchain_core.prompts import ChatPromptTemplate
from langchain_nvidia_ai_endpoints import ChatNVIDIA
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain
from app.ai.retriever import interview_retriever
from app.core.config import settings
import concurrent.futures

FALLBACK_MODELS = [
    "meta/llama-3.1-8b-instruct",
    "google/gemma-2b",
    "deepseek-ai/deepseek-v4-flash",
    "meta/llama-3.1-70b-instruct"
]

# Define normal mentor prompt
system_prompt = (
    "You are an expert AI Interview Mentor. Your goal is to help users prepare for technical interviews.\n"
    "You will be provided with context from real previous interview experiences.\n\n"
    "Follow this Chain-of-Thought process before answering:\n"
    "1. <thinking>\n"
    "   - Analyze the user's specific question and constraints.\n"
    "   - Scan the retrieved context for direct matches to the user's query.\n"
    "   - Identify any missing information that needs to be supplemented by your general knowledge.\n"
    "   - Formulate a structured, encouraging, and highly relevant response plan.\n"
    "   </thinking>\n\n"
    "2. Answer the user's question directly after your thinking block.\n"
    "Prioritize the actual interview experiences provided, but supplement intelligently if needed.\n"
    "Keep your answers structured, encouraging, and highly relevant.\n\n"
    "CONTEXT:\n{context}"
)
prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}"),
])

# Define interactive mock interviewer prompt
mock_interviewer_prompt = (
    "You are an expert technical interviewer conducting a mock interview with a candidate.\n"
    "You will be provided with context from real previous interview experiences to help you formulate realistic questions.\n\n"
    "RULES FOR CONDUCTING THE INTERVIEW:\n"
    "1. DO NOT give the candidate the answers! Your job is ONLY to ask questions, wait for their answer, and then provide brief feedback before asking the next question.\n"
    "2. Ask ONLY ONE question at a time.\n"
    "3. Be professional, engaging, and conversational.\n"
    "4. When the candidate answers, briefly acknowledge their answer, give a tiny bit of constructive feedback if necessary, and then seamlessly move on to the next related question.\n\n"
    "Follow this Chain-of-Thought process before responding:\n"
    "1. <thinking>\n"
    "   - Analyze the candidate's last message.\n"
    "   - Evaluate their answer.\n"
    "   - Decide on the next logical follow-up question based on the provided context or general technical knowledge.\n"
    "   </thinking>\n\n"
    "2. Reply to the candidate directly after your thinking block.\n\n"
    "CONTEXT:\n{context}"
)
mock_prompt = ChatPromptTemplate.from_messages([
    ("system", mock_interviewer_prompt),
    ("human", "{input}"),
])

class InterviewAgent:
    def __init__(self):
        pass
        
    def get_chat_response(self, user_input: str, filters: dict = None, is_mock_interview: bool = False) -> str:
        # Create retriever with optional metadata filters (like company, role)
        retriever = interview_retriever.get_retriever(filters=filters)
        
        # Select appropriate prompt
        selected_prompt = mock_prompt if is_mock_interview else prompt
        
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
                
                # Create chains
                question_answer_chain = create_stuff_documents_chain(current_llm, selected_prompt)
                rag_chain = create_retrieval_chain(retriever, question_answer_chain)
                
                def _generate():
                    response = rag_chain.invoke({"input": user_input})
                    return response["answer"]

                executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
                future = executor.submit(_generate)
                
                # Enforce a hard 120-second timeout on the generation
                return future.result(timeout=120)
                
            except concurrent.futures.TimeoutError:
                last_error = "I apologize, but the NVIDIA AI server is currently experiencing high load or timing out. Please try your question again in a moment!"
                print(f"Model {model_name} timed out, trying next...")
                continue
            except Exception as e:
                last_error = f"An internal error occurred: {str(e)}"
                print(f"Model {model_name} failed with error {e}, trying next...")
                continue
                
        # If all models fail, return the last error
        return last_error or "All fallback models failed to generate a response."

interview_agent = InterviewAgent()
