# AI Interview Preparation Platform - Architecture & Implementation Guide

## 1. System Overview
The AI Interview Preparation Platform is a full-stack, AI-powered web application designed to help users prepare for technical interviews. The system uses a Retrieval-Augmented Generation (RAG) architecture to answer questions strictly based on a database of real, historical interview experiences. 

### Technology Stack
- **Frontend**: React, Vite, Tailwind CSS (v3)
- **Backend API**: FastAPI (Python), Uvicorn
- **Relational Database**: PostgreSQL (for structured data like user profiles/metrics)
- **Vector Database**: Qdrant (for semantic search of interview documents)
- **AI/LLM Provider**: NVIDIA NIM Endpoints (DeepSeek-V4-Pro)
- **Embeddings**: NVIDIA EmbedQA E5-V5 (1024 dimensions)
- **Deployment**: Docker & Docker Compose

---

## 2. The Artificial Intelligence (AI) Stack

### 2.1 NVIDIA NIM Integration
The application was originally scaffolded with placeholder AI APIs (`FakeEmbeddings` and mock endpoints) due to quota issues. To make the system fully functional, we ripped out the placeholders and integrated **NVIDIA NIM Endpoints**, which provide enterprise-grade access to cutting-edge open-source models.

We specifically chose:
1. **Model**: `deepseek-ai/deepseek-v4-pro` (For high-reasoning conversational generation).
2. **Embeddings**: `nvidia/nv-embedqa-e5-v5` (For converting PDF text into high-dimensional mathematical vectors).

### 2.2 Fixing the Langchain NVIDIA Integration
When we first connected the AI, we encountered a `404 Not Found` error. This occurred because we were using Langchain's generic `ChatOpenAI` client. NVIDIA's API has strict routing requirements for its DeepSeek models. We resolved this by installing `langchain-nvidia-ai-endpoints` and explicitly swapping the classes to `ChatNVIDIA`.

*Implementation File:* `backend/app/ai/agents/interview_agent.py`
```python
from langchain_nvidia_ai_endpoints import ChatNVIDIA
llm = ChatNVIDIA(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=settings.NVIDIA_API_KEY,
    model="deepseek-ai/deepseek-v4-pro",
    max_tokens=2048
)
```

---

## 3. The Vector Database & Ingestion Pipeline (RAG)

To allow the AI to read your 31 PDF interview files, we built a Retrieval-Augmented Generation (RAG) pipeline.

### 3.1 The Qdrant Vector Store
We used Qdrant running in a Docker container to store the mathematical representations of the text. 

**The Dimension Mismatch Bug**: During implementation, Qdrant threw a `400 Bad Request`. The existing collection was initialized for 768 dimensions (from an older model), but the new NVIDIA E5-V5 model generates vectors with exactly **1024 dimensions**. We fixed this by recreating the collection as `interview_experiences_nvidia_v2` with the correct dimension size.

### 3.2 Data Ingestion (`scripts/ingest_data.py`)
We ran a dedicated ingestion script that:
1. Loops through all `.txt`/`.pdf` files in the `sample_data` folder.
2. Uses Langchain's `RecursiveCharacterTextSplitter` to break the massive documents into 1000-character chunks (with a 200-character overlap to preserve context).
3. Calls the NVIDIA Embeddings API to convert each chunk into a 1024-dimension vector.
4. Stores the vectors in Qdrant.

---

## 4. Prompt Engineering (Chain-of-Thought)

To maximize the accuracy of the DeepSeek model and prevent hallucinations, we injected a strict **Chain-of-Thought (CoT)** framework into its system prompt. 

*Implementation File:* `backend/app/ai/agents/interview_agent.py`
Before generating an answer, the AI is explicitly instructed to open a `<thinking>` block where it must:
1. Analyze the user's constraints.
2. Scan the retrieved context for direct matches.
3. Formulate a structured plan.
Only after completing this internal thought process is it allowed to output the final answer. This forces the model to logically ground its response in the provided PDF data.

---

## 5. Frontend & API Communication

### 5.1 React & Vite Configuration
The frontend is built with React and Vite. During setup, we encountered a breaking error regarding unknown Tailwind classes (e.g., `bg-dark-900`). 
This happened because the project was accidentally configured to use the brand new **Tailwind CSS v4** compiler (`@tailwindcss/postcss`), which completely ignores the old `tailwind.config.js` file where custom colors are stored. 
We fixed this by downgrading the PostCSS configuration to use the standard **Tailwind v3** compiler.

### 5.2 The CORS Security Block
When we finally wired the frontend `Chat.tsx` file to hit the real backend API (instead of using the hardcoded mock responses), the browser blocked the request with a `Method Not Allowed` preflight error.

We resolved this by updating the FastAPI CORS middleware in `main.py` to explicitly accept requests from `*` (all origins), allowing the React UI running on port 5173 to seamlessly talk to FastAPI on port 8000.

### 5.3 JSON Payload Mapping
Finally, the backend returned a JSON response structured as `{"answer": "..."}`, but the frontend was checking for `data.response`. We aligned these keys in `Chat.tsx` to complete the full integration loop.

---

## Conclusion
The system is now a robust, end-to-end AI platform. By leveraging Docker for orchestration, FastAPI for performance, Qdrant for semantic retrieval, and NVIDIA's DeepSeek for generation, it successfully transforms raw PDF interview experiences into an interactive, highly-intelligent mentoring tool.
