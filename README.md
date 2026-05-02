# 🏠 H.O.M.E: Hyper-Optimized Monitoring Engine

![H.O.M.E Dashboard](https://raw.githubusercontent.com/home-ai/home/main/docs/dashboard.png)

**H.O.M.E** is a production-ready, cloud-native SaaS monitoring platform that integrates an **Offline-First Local AI Assistant**. 

It transforms standard infrastructure monitoring into an intelligent, dual-ecosystem product:
1. **Cloud SaaS**: A robust backend monitoring engine with Celery background workers, Redis, and PostgreSQL for real-time uptime checks.
2. **Local Control Center**: A secure, private inference engine (powered by Ollama and Llama3) that runs exclusively on your local hardware to analyze logs, inspect files, and provide context without sending sensitive data to the cloud.

---

## 🏗️ The Architecture

- **Cloud Platform**:
  - **Frontend**: React (Vite) with an Apple-like premium UI.
  - **Backend**: FastAPI providing REST & WebSockets.
  - **Database**: PostgreSQL for persistent configuration and incident storage.
  - **Workers**: Celery and Redis to handle concurrent URL polling and scheduler dispatch.
  
- **Local Private AI Agent**:
  - **Engine**: Ollama running locally.
  - **Bridge**: A FastAPI agent running on port 9000 that exposes a private UI and secure endpoints for the Cloud SaaS to send inference jobs.

---

## 🚀 Quick Start: Cloud Deployment

H.O.M.E is designed to be instantly deployable to platforms like Render, Railway, or DigitalOcean.

1. Configure your environment variables for `DATABASE_URL` and `REDIS_URL`.
2. Provision the Backend API (`uvicorn app.main:app`).
3. Provision the Celery Worker (`celery -A app.celery_worker.celery worker`).
4. Provision the Celery Beat Scheduler (`celery -A app.celery_worker.celery beat`).
5. Deploy the Static Frontend.

For a full step-by-step, view the [Cloud Deployment Guide](./cloud-deploy-guide.md).

---

## 🤖 Installing Your Private AI Assistant

To unlock the full power of H.O.M.E, install the Local AI Assistant. Your telemetry and file data never leaves your computer.

### Windows (PowerShell)
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; .\install-local.ps1
```

### macOS / Linux
```bash
chmod +x install-local.sh
./install-local.sh
```

**What this does:**
1. Verifies Docker is installed.
2. Downloads `docker-compose.local.yml`.
3. Boots the H.O.M.E Agent and Ollama engine.
4. Pulls the required AI model automatically.

Open your **Local Control Center** at: [http://localhost:9000](http://localhost:9000)

---

## 🔒 Security & Privacy

We believe diagnostic AI should not compromise security. The Local Agent runs completely isolated on your hardware. When the Cloud SaaS detects a system failure, you can click "Analyze Locally" – the cloud sends the incident payload to your *local* machine's port 9000, and your local GPU/CPU processes it. No proprietary logs are uploaded to any external LLM provider.

---
*Built for reliability, speed, and absolute privacy.*