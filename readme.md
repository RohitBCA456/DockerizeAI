# DockerizeAI 🐳🤖  
**AI-powered DevOps assistant that automatically generates Dockerfiles & Docker Compose for your projects.**  

DockerizeAI analyzes your codebase, detects services, ports, dependencies, and environment configs, then creates **production-ready containerization files** — saving you from manual DevOps hassle.  

---

## ✨ Features  

- 🔍 **Smart Repo Scanner** – Detects project language, entry points, ports, dependencies, and `.env` configs.  
- 🤖 **AI-Powered Dockerfile Generator** – Uses Gemini LLM to generate optimized Dockerfiles per service.  
- 🐳 **Auto Docker Compose** – Combines multiple services (backend, databases, caches, etc.) into a single `docker-compose.yml`.  
- 📚 **RAG Documentation Agent** – Ask deployment-related questions (Heroku, Vercel, Netlify, Docker) and get context-aware answers.  
- ⚡ **REST API Interface** – Interact easily via API endpoints.  

---

## 🏗️ System Architecture  

1. **API Server (Express.js)** → Handles requests and orchestration.  
2. **Repo Scanner** → Builds metadata about your project.  
3. **AI Agent (Gemini)** → Generates Dockerfiles & Compose configs.  
4. **Vector Store (RAG)** → Stores documentation for intelligent Q&A.  

---

## 🚀 Quick Start  

### 1️⃣ Clone & Install  
```bash
git clone https://github.com/RohitBCA456/dockerize-ai.git
cd dockerize-ai
npm install
```

### 2️⃣ Setup Environment  
Create a `.env` file in the root directory:  
```bash
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
```

### 3️⃣ Run the Server  
```bash
npm start
```

Server will start at:  
```
http://localhost:5000
```

---

## 📡 API Endpoints  

### 🔹 Generate Docker Configs  
```http
POST /generate
```
**Body (JSON):**
```json
{
  "repoUrl": "https://github.com/example/project"
}
```
**Response:**
```json
{
  "dockerfile": "...",
  "dockerCompose": "..."
}
```

### 🔹 Ask Documentation Agent  
```http
POST /ask
```
**Body (JSON):**
```json
{
  "question": "How do I deploy to Vercel?"
}
```

---

## 🛠️ Tech Stack  

- **Backend:** Node.js (Express.js)  
- **AI Model:** Gemini (LLM)  
- **Database / Vector Store:** For storing docs & embeddings  
- **Containerization:** Docker & Docker Compose  

---

## 🤝 Contributing  

1. Fork the repo 🍴  
2. Create a new branch 🌱  
3. Commit your changes 💡  
4. Open a Pull Request 🚀  

---

