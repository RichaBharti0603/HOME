<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>HOME – Private Monitoring & AI Platform</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #222; max-width: 1100px; margin: auto; padding: 40px;">
  <h1 align="center">🏠 HOME</h1>
  <h2 align="center">Private Monitoring & AI Assistant for Startup Reliability and Compliance</h2>

  <hr/>

  <h2>📌 Overview</h2>
  <p>
    <b>HOME</b> is a privacy-first platform that combines
    <b>real-time website monitoring</b> with a <b>private AI assistant</b>,
    designed specifically for <b>SaaS and FinTech startups</b>.
  </p>
  <p>
    A website is not just a website — it is <b>payments, trust, and credibility</b>.
    HOME ensures startups never lose control over uptime, data, or compliance.
  </p>

  <hr/>

  | Feature in HOME            | Microsoft Service          |
| -------------------------- | -------------------------- |
| Private AI Assistant       | **Azure OpenAI**           |
| Compliance / PII Detection | **Azure AI Language**      |
| Intelligent Monitoring     | **Azure Anomaly Detector** |  

  <h2>❗ Problem Statement</h2>
  <ul>
    <li>Silent website downtime with no alerts</li>
    <li>Expired SSL certificates and security blind spots</li>
    <li>Over-reliance on public AI tools that expose sensitive data</li>
    <li>Compliance risks (GDPR, DPDP, HIPAA)</li>
    <li>High cost of DevOps and Security teams</li>
  </ul>

  <p>
    <b>Average cost of downtime:</b> $5,600 per minute
  </p>

  <hr/>

  <h2>💡 Solution: HOME</h2>

  <table border="1" cellpadding="10" cellspacing="0" width="100%">
    <tr>
      <th align="left">Feature</th>
      <th align="left">Description</th>
    </tr>
    <tr>
      <td><b>Website Monitoring</b></td>
      <td>Tracks uptime, SSL validity, performance, and security</td>
    </tr>
    <tr>
      <td><b>Instant Alerts</b></td>
      <td>Email, Slack, and SMS alerts during failures</td>
    </tr>
    <tr>
      <td><b>Private AI Assistant</b></td>
      <td>AI for coding, debugging, and documentation without data leakage</td>
    </tr>
    <tr>
      <td><b>Health Report Card</b></td>
      <td>Unified dashboard for website health and risk analysis</td>
    </tr>
    <tr>
      <td><b>Compliance-Ready</b></td>
      <td>Designed for GDPR, DPDP, and HIPAA-aligned workflows</td>
    </tr>
  </table>

  <hr/>

   <h2>  ✅ FINAL HOME ARCHITECTURE (AUTHORITATIVE)

HOME is a dual-plane system:

Local Private AI Plane (User-Owned)

Cloud Monitoring Plane (HOME-Owned)

These two planes cooperate but never leak sensitive data.

1️⃣ What exactly happens when a user uses HOME
User chooses features:

✅ Website Monitoring (Cloud)

✅ Private AI Assistant (Local)

✅ Both (Most users)

2️⃣ Website Monitoring — HOW IT WORKS (Cloud)
Purpose

Monitor uptime, latency, status, SLA — centrally.

Where it runs

✅ HOME Cloud Backend (Railway)

Flow
User → HOME Frontend → HOME Cloud API → Monitoring Workers → Database

Data collected

Website URL

Status (UP/DOWN)

Response time

Timestamp

Data NOT collected

❌ Website content
❌ User documents
❌ AI prompts

✔ This is safe and scalable

3️⃣ Private AI Assistant — HOW IT WORKS (Local)
Purpose

Let users query:

Their website knowledge

Uploaded documents

Monitoring data (read-only summary)

Where it runs

✅ User’s machine

Flow
User → HOME Frontend → Local HOME Agent → Ollama → Local Vector DB

Guarantees

No data leaves machine

No API calls to HOME servers

No OpenAI / cloud inference

✔ True privacy

4️⃣ CRITICAL LINK: How AI can “know” monitoring data

This is important.

Monitoring data lives in cloud.
AI runs locally.

So we do this:

🔁 SAFE SYNC MODEL

Only aggregated monitoring data is pulled

No prompts pushed out


5️⃣ Final system diagram (simplified)
┌─────────────────────────────┐
│         User Device         │
│                             │
│  HOME Local Agent           │
│  ├── Ollama                 │
│  ├── Vector DB              │
│  ├── Documents              │
│  ├── Monitoring Snapshot ◄──┼──── HOME Cloud
│  └── Local FastAPI          │
│                             │
└─────────────▲───────────────┘
              │
         Browser UI




9️⃣ How frontend decides where to send AI requests
On load:
try {
  fetch("http://localhost:8001/health")
  → Private Mode
} catch {
  → Cloud Mode (AI disabled or limited)
}

UX:

🔒 Private Mode (Local)

☁️ Cloud Mode (Monitoring only)

 THIS is our product promise 
<b>
“HOME monitors your website in the cloud,
but your AI assistant runs on your machine,
using your data, with zero external exposure.”
</b>



  <h2>🧠 System Architecture</h2>

  <ul>
    <li><b>Frontend:</b> React (Vercel deployment)</li>
    <li><b>Backend:</b> FastAPI (Python)</li>
    <li><b>AI Engine:</b> Private / Local LLM with streaming responses</li>
    <li><b>Monitoring Engine:</b> Modular health checks</li>
    <li><b>Data Privacy:</b> No public AI APIs</li>
  </ul>

  <hr/>

  <h2>📂 Project Structure</h2>

  <pre style="background:#f4f4f4; padding:15px;">
HOME-AI-Assistant/
│
├── backend/
│   ├── app.py
│   ├── api/
│   ├── models/
│   ├── rag/
│   ├── personalization/
│   └── vector_store/
│
├── home-platform/   (Frontend)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── README.html
└── .env.example
  </pre>

  <hr/>

  <h2>⚙️ How to Run Locally</h2>

  <h3>1️⃣ Backend Setup</h3>
  <pre style="background:#f4f4f4; padding:15px;">
# Navigate to project root
cd HOME-AI-Assistant

# (Optional) Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run backend
uvicorn backend.app:app --reload --host 127.0.0.1 --port 8000
  </pre>

  <p>
    Backend will be available at:
    <b>http://127.0.0.1:8000</b>
  </p>

  <h3>2️⃣ Frontend Setup</h3>
  <pre style="background:#f4f4f4; padding:15px;">
cd home-platform
npm install
npm run dev
  </pre>

  <p>
    Frontend will run at:
    <b>http://localhost:5173</b> (or similar)
  </p>

  <hr/>

  <h2>🔐 Privacy & Security</h2>
  <ul>
    <li>No prompts sent to public AI platforms</li>
    <li>No external data storage of user queries</li>
    <li>Designed with compliance-first mindset</li>
    <li>Supports enterprise-grade isolation</li>
  </ul>

  <hr/>

  <h2>🧪 Example Use Case</h2>
  <p>
    A FinTech startup experiences downtime at 1 a.m.
  </p>
  <ul>
    <li>HOME detects failure instantly</li>
    <li>Alert sent via Slack / Email</li>
    <li>Health dashboard shows root cause</li>
    <li>Private AI helps debug securely</li>
  </ul>

  <hr/>

  <h2>🚀 Roadmap</h2>
  <ul>
    <li>Cloud deployment of backend</li>
    <li>Advanced anomaly detection</li>
    <li>Role-based dashboards</li>
    <li>Enterprise integrations (Slack, Jira)</li>
    <li>Automated compliance reporting</li>
  </ul>

  <hr/>

  

  <hr/>

  <h2>🏆 Built For</h2>
  <p>
    <b>Microsoft Imagine Cup</b><br/>
    A project focused on reliability, responsible AI, and startup trust.
  </p>

  <hr/>

  <h2>📜 License</h2>
  <p>MIT License</p>

  <hr/>

  <p align="center">
    <b>HOME — Built for startups that cannot afford downtime, data leaks, or uncertainty.</b>
  </p>

</body>
</html>
