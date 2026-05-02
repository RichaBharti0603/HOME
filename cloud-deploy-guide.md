# H.O.M.E Cloud Deployment Guide

This guide covers deploying the **H.O.M.E. (Hyper-Optimized Monitoring Engine)** SaaS application to production platforms like Render, Railway, DigitalOcean, or AWS.

## Architecture Overview
The cloud architecture consists of:
1. **Frontend**: Vite + React single-page application.
2. **Backend**: FastAPI providing REST endpoints and WebSockets.
3. **Database**: PostgreSQL (Neon, Supabase, or self-hosted).
4. **Cache & Message Broker**: Redis (Upstash or self-hosted).
5. **Background Workers**: Celery + Celery Beat for scheduling checks.

## Environment Variables

### Backend (`home-cloud-backend/.env`)
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname
# Redis
REDIS_URL=redis://default:password@host:port

# Security
SECRET_KEY=your_secure_random_string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Optional API Keys for notifications (e.g., Slack, SendGrid)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

### Frontend (`home-frontend/vite-project/.env`)
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com/ws
```

## Recommended Platform: Render / Railway

### 1. Database & Redis setup
- Provision a PostgreSQL database (e.g., Neon or Railway Postgres).
- Provision a Redis instance (e.g., Upstash or Railway Redis).
- Note down the connection strings (`DATABASE_URL`, `REDIS_URL`).

### 2. Backend Deployment
Using the provided `render.yaml` or deploying via Railway:
- Set up a Web Service pointing to `./home-cloud-backend`.
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Set up a Worker Service pointing to `./home-cloud-backend`.
- **Start Command:** `celery -A app.celery_worker.celery worker --loglevel=info`
- Set up a Scheduler Service pointing to `./home-cloud-backend`.
- **Start Command:** `celery -A app.celery_worker.celery beat --loglevel=info`
- Ensure the env vars above are injected into all three services.

### 3. Frontend Deployment
- Deploy a Static Site or Vercel project pointing to `./home-frontend/vite-project`.
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- Set `VITE_API_URL` and `VITE_WS_URL` to point to the deployed Backend Web Service URL.

## Domain & SSL Configuration
- **Custom Domains**: Add your custom domain to both Frontend and Backend services in your hosting provider's dashboard.
- **SSL/TLS**: Render, Railway, and Vercel automatically provision Let's Encrypt certificates for your custom domains.
- **CORS**: Ensure the backend's `CORS_ORIGINS` setting or middleware includes your frontend's production domain so requests are not blocked.

## Post-Deployment Verification Checklist
- [ ] **Backend Health**: Navigate to `https://api.yourdomain.com/health` (should return `{ "status": "ok" }`).
- [ ] **Database Connection**: Can the backend register a new user?
- [ ] **Redis Connection**: Do background checks trigger and get queued correctly?
- [ ] **Celery Workers**: Are workers processing jobs? (Check worker logs for "Received task").
- [ ] **WebSockets**: Do real-time updates push to the frontend dashboard?
- [ ] **Frontend Login**: Can you log in successfully via the production URL?

## Monitoring & Logs
- We recommend Datadog or Sentry for production application tracking.
- Ensure that logs for the FastAPI web server, Celery worker, and Celery scheduler are grouped to simplify debugging.
