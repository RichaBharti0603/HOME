# 🏠 H.O.M.E Monitoring System

**Hyper-Optimized Monitoring Engine** — A production-ready, cloud-native monitoring platform with local AI-powered analysis.

## 🧱 Deployment Architecture

- **Cloud (Render)**:
  - **Backend**: FastAPI with PostgreSQL & Redis.
  - **Worker**: Celery Monitoring Engine.
  - **Frontend**: React (Vite) Static Site.
- **Local**:
  - **AI Assistant**: Ollama (Llama3) exposed via Ngrok & Local Bridge.

## 🚀 Cloud Deployment Steps

1. **GitHub Sync**: Push this repository to your GitHub account.
2. **Render Setup**:
   - Go to [Render Dashboard](https://dashboard.render.com).
   - Click **New +** -> **Blueprint**.
   - Connect your repository.
   - Render will automatically detect `render.yaml` and provision all services.

## 🤖 Local AI Configuration

To connect the cloud monitoring system to your local AI:

1. **Pull Ollama**: `ollama run llama3`.
2. **Run AI Bridge**: Navigate to `home-local-agent/` and run `uvicorn local_ai_bridge:app --port 9000`.
3. **Tunnel with Ngrok**: `ngrok http 9000`.
4. **Link Cloud**: Copy your Ngrok URL and set `AI_SERVICE_URL` in the Render `home-backend` settings.

## 🧪 Validation

- [x] **Live Dashboard**: Connect to your deployed frontend.
- [x] **Real-time Monitoring**: observe logs update via WebSockets.
- [x] **AI Root Cause Analysis**: Query the AI assistant to analyze service failures.