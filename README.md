# AI Interview Preparation Platform

Welcome to the AI Interview Preparation Platform! This application uses an AI agent powered by **DeepSeek-V4-Pro** and **NVIDIA NIM** to help you prepare for technical interviews by chatting with real, embedded interview experiences.

## Prerequisites
Before you start, make sure you have the following installed on your machine:
- **Docker** and **Docker Compose** (Ensure Docker Desktop is running)
- **Node.js** (v16+) and **npm**

---

## 🚀 Getting Started (Step-by-Step)

### Step 1: Start the Backend (Docker)
The backend consists of a FastAPI server, a Postgres database, and a Qdrant Vector database. Everything is pre-configured to run seamlessly via Docker.

1. Open a terminal in the root of the project (where `docker-compose.yml` is located).
2. Run the following command to build and start the containers in the background:
   ```bash
   docker-compose up -d --build
   ```
3. Wait a few moments for the containers to spin up. The backend API will be available at `http://localhost:8000`.

*Note: The API keys for Gemini and NVIDIA NIM are already securely configured in `backend/.env`!*

### Step 2: Ingest the Interview Data
Before the AI can answer questions, we need to convert the sample interview PDFs into mathematical vectors and store them in the Qdrant database.

1. Keep your terminal in the root directory.
2. Execute the ingestion script inside the running backend container:
   ```bash
   docker exec interview_prep_backend python scripts/ingest_data.py
   ```
3. You will see logs indicating that the files are being chunked and embedded via the NVIDIA API. Once finished, your AI has a memory of all the interview experiences!

### Step 3: Start the Frontend UI
Now let's spin up the React (Vite) interface so you can chat with the AI.

1. Open a **new** terminal window.
2. Navigate into the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Install the Node dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. 🌐 Open your web browser and navigate to the URL provided (usually **http://localhost:5173**).

---

## 🛠️ How to Use the App
- **Chat Interface:** Ask questions like *"What system design questions does Amazon ask?"* or *"Give me tips for Blackrock algorithms round."* The AI will retrieve relevant documents and formulate a highly-accurate response using Chain-of-Thought reasoning.
- **Study Plan:** Switch to the Study Plan tab, enter your target company, role, interview date, and current level to receive a personalized day-by-day roadmap!

Happy coding and good luck with your interviews!
