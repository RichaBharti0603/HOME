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
    <tr>
      <td><b>AI Prompt Privacy Guard</b></td>
      <td>Automatic sanitization of sensitive data (emails, phone numbers, API keys) before LLM processing</td>
    </tr>
    <tr>
      <td><b>Consent Validation</b></td>
      <td>Mandatory consent checks with timestamp and purpose tracking for AI usage</td>
    </tr>
    <tr>
      <td><b>Audit Logging</b></td>
      <td>Hash-chained, tamper-evident audit logs with append-only integrity</td>
    </tr>
    <tr>
      <td><b>Incident Classification</b></td>
      <td>Automated severity classification (Low/Medium/High/Critical) for compliance reporting</td>
    </tr>
    <tr>
      <td><b>Data Retention</b></td>
      <td>Policy-driven data retention with automatic secure deletion</td>
    </tr>
  </table>

  <hr/>

  <h2>🧠 System Architecture</h2>

  <ul>
    <li><b>Frontend:</b> React (Vercel deployment)</li>
    <li><b>Backend:</b> FastAPI (Python)</li>
    <li><b>AI Engine:</b> Private / Local LLM with streaming responses</li>
    <li><b>Monitoring Engine:</b> Modular health checks</li>
    <li><b>Data Privacy:</b> No public AI APIs</li>
    <li><b>Security Layer:</b> Privacy sanitization, consent validation, audit logging</li>
    <li><b>Compliance Module:</b> Policy management, data retention, incident classification</li>
  </ul>

  <h3>🛡️ Security Architecture Flow</h3>
  <p><b>AI Request Processing:</b></p>
  <pre style="background:#f4f4f4; padding:15px;">
Frontend → Consent Check → Privacy Sanitizer → Local LLM → Audit Log → Response
  </pre>

  <p><b>Monitoring Incident Handling:</b></p>
  <pre style="background:#f4f4f4; padding:15px;">
Monitor detects failure → Incident Severity Classification → Audit Log → 
Compliance Evaluation → UI update
  </pre>

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
│   ├── vector_store/
│   ├── compliance/          (NEW)
│   │   ├── policy.py
│   │   ├── consent.py
│   │   └── retention.py
│   ├── privacy/            (NEW)
│   │   ├── sanitizer.py
│   │   └── patterns.py
│   ├── audit/              (NEW)
│   │   ├── logger.py
│   │   └── hashchain.py
│   ├── security/
│   │   └── incidents.py    (NEW)
│   └── reports/            (NEW)
│       └── compliance_report.py
│
├── home-platform/   (Frontend)
│   ├── src/
│   ├── public/
│   └── package.json
│
├── chat.py
├── README.md
└── .env.example
  </pre>

  <hr/>

  <h2>🔧 Technical Requirements</h2>

  <h3>Compliance Module (TR-COM)</h3>
  <ul>
    <li><b>TR-COM-01:</b> Policy rules must be environment-driven</li>
    <li><b>TR-COM-02:</b> Data must be tagged with retention metadata</li>
    <li><b>TR-COM-03:</b> Policy violations must raise compliance events</li>
    <li><b>TR-COM-04:</b> Compliance logic must be backend-only (no frontend trust)</li>
  </ul>

  <h3>AI Prompt Privacy Guard (TR-AI)</h3>
  <ul>
    <li><b>TR-AI-01:</b> Prompt must pass sanitizer before LLM</li>
    <li><b>TR-AI-02:</b> Regex-based detection for emails, phone numbers, API keys</li>
    <li><b>TR-AI-03:</b> Raw prompt must never be logged</li>
    <li><b>TR-AI-04:</b> Sanitized prompt only used for inference</li>
  </ul>

  <h3>Consent Validation Layer (TR-CON)</h3>
  <ul>
    <li><b>TR-CON-01:</b> Consent required for AI usage</li>
    <li><b>TR-CON-02:</b> Consent stored with timestamp & purpose</li>
    <li><b>TR-CON-03:</b> Missing consent must block AI request</li>
    <li><b>TR-CON-04:</b> Consent check must occur before sanitizer</li>
  </ul>

  <h3>Audit Logging System (TR-LOG)</h3>
  <ul>
    <li><b>TR-LOG-01:</b> Each log entry must include timestamp, event type, severity, hash</li>
    <li><b>TR-LOG-02:</b> Hash must reference previous entry</li>
    <li><b>TR-LOG-03:</b> Logs must be append-only</li>
    <li><b>TR-LOG-04:</b> No PII in logs</li>
  </ul>

  <h3>Incident Severity Classification (TR-INC)</h3>
  <ul>
    <li><b>TR-INC-01:</b> Incidents categorized as Low/Medium/High/Critical</li>
    <li><b>TR-INC-02:</b> Severity based on service + data risk</li>
    <li><b>TR-INC-03:</b> Critical incidents flagged for compliance report</li>
    <li><b>TR-INC-04:</b> Classification must be deterministic (rule-based)</li>
  </ul>

  <h3>Compliance Report Generator (TR-REP)</h3>
  <ul>
    <li><b>TR-REP-01:</b> Generate JSON report</li>
    <li><b>TR-REP-02:</b> Include incident summary, AI privacy score, audit log integrity</li>
    <li><b>TR-REP-03:</b> No raw logs exposed</li>
    <li><b>TR-REP-04:</b> Exportable without admin UI</li>
  </ul>

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
  
  <h3>🛡️ Core Security Features</h3>
  <ul>
    <li><b>No Public AI APIs:</b> All prompts processed locally, never sent to external platforms</li>
    <li><b>No External Data Storage:</b> User queries remain within your infrastructure</li>
    <li><b>Privacy-First Design:</b> Compliance-first mindset built into architecture</li>
    <li><b>Enterprise-Grade Isolation:</b> Multi-tenant security with data segregation</li>
  </ul>

  <h3>🔒 AI Prompt Privacy Guard</h3>
  <ul>
    <li><b>Automatic Sanitization:</b> Sensitive data detection and removal before LLM processing</li>
    <li><b>Pattern Detection:</b> Regex-based detection for emails, phone numbers, API keys</li>
    <li><b>Zero Logging:</b> Raw prompts never logged; only sanitized versions used</li>
    <li><b>Pre-Inference Validation:</b> All prompts must pass sanitizer before reaching LLM</li>
  </ul>

  <h3>✅ Consent Management</h3>
  <ul>
    <li><b>Mandatory Consent:</b> AI usage requires explicit user consent</li>
    <li><b>Consent Tracking:</b> Timestamp and purpose stored for audit compliance</li>
    <li><b>Request Blocking:</b> Missing consent automatically blocks AI requests</li>
    <li><b>Pre-Sanitizer Check:</b> Consent validation occurs before privacy sanitization</li>
  </ul>

  <h3>📋 Compliance Module</h3>
  <ul>
    <li><b>Environment-Driven Policies:</b> Policy rules configurable via environment variables</li>
    <li><b>Data Retention Metadata:</b> All data tagged with retention policies</li>
    <li><b>Policy Violation Events:</b> Automatic compliance event generation on violations</li>
    <li><b>Backend-Only Logic:</b> All compliance checks server-side (no frontend trust)</li>
    <li><b>Secure Deletion:</b> Automated data lifecycle management with audit trails</li>
  </ul>

  <h3>📊 Audit Logging System</h3>
  <ul>
    <li><b>Hash-Chained Logs:</b> Tamper-evident logging with cryptographic integrity</li>
    <li><b>Structured Entries:</b> Each log includes timestamp, event type, severity, and hash</li>
    <li><b>Chain Integrity:</b> Each hash references previous entry for verification</li>
    <li><b>Append-Only:</b> Immutable log structure prevents modification</li>
    <li><b>PII-Free:</b> No personally identifiable information in audit logs</li>
  </ul>

  <h3>🚨 Incident Management</h3>
  <ul>
    <li><b>Severity Classification:</b> Automated categorization (Low/Medium/High/Critical)</li>
    <li><b>Risk-Based Assessment:</b> Severity determined by service impact and data risk</li>
    <li><b>Compliance Reporting:</b> Critical incidents flagged for compliance reports</li>
    <li><b>Deterministic Rules:</b> Rule-based classification ensures consistency</li>
  </ul>

  <h3>📈 Compliance Reporting</h3>
  <ul>
    <li><b>JSON Export:</b> Machine-readable compliance reports</li>
    <li><b>Comprehensive Metrics:</b> Incident summaries, AI privacy scores, audit log integrity</li>
    <li><b>Privacy-Preserving:</b> No raw logs exposed in reports</li>
    <li><b>Standalone Export:</b> Reports exportable without admin UI access</li>
  </ul>

  <h3>🌍 Compliance Standards</h3>
  <ul>
    <li><b>GDPR (EU):</b> Right to deletion, data minimization, consent management</li>
    <li><b>DPDP (India):</b> Data protection, retention policies, breach notification</li>
    <li><b>HIPAA (USA):</b> Healthcare data protection, audit trails, access controls</li>
    <li><b>SOC 2 Type II:</b> Security controls and compliance monitoring</li>
    <li><b>ISO 27001:</b> Information security management system alignment</li>
  </ul>

  <hr/>

  <h2>🧪 Example Use Case</h2>
  <p>
    A FinTech startup experiences downtime at 1 a.m.
  </p>
  <ul>
    <li>HOME detects failure instantly</li>
    <li>Incident automatically classified as <b>Critical</b> (payment service + financial data)</li>
    <li>Alert sent via Slack / Email with severity context</li>
    <li>Incident logged in tamper-evident audit chain</li>
    <li>Health dashboard shows root cause</li>
    <li>Private AI helps debug securely (prompt sanitized, consent validated)</li>
    <li>Compliance report updated with incident details</li>
  </ul>

  <h3>🔐 Security Flow Example</h3>
  <p>
    User requests AI assistance for debugging:
  </p>
  <ol>
    <li><b>Consent Check:</b> System verifies user consent for AI usage</li>
    <li><b>Privacy Sanitization:</b> Prompt scanned and sanitized (emails, API keys removed)</li>
    <li><b>LLM Processing:</b> Sanitized prompt sent to local LLM</li>
    <li><b>Audit Logging:</b> Event logged with hash chain integrity</li>
    <li><b>Response:</b> Secure response returned to user</li>
  </ol>

  <hr/>

  <h2>🚀 Roadmap</h2>
  
  <h3>✅ Completed Security Features</h3>
  <ul>
    <li>✅ AI Prompt Privacy Guard with sanitization</li>
    <li>✅ Consent validation layer</li>
    <li>✅ Hash-chained audit logging system</li>
    <li>✅ Incident severity classification</li>
    <li>✅ Compliance report generator</li>
    <li>✅ Data retention policy engine</li>
  </ul>

  <h3>🔮 Upcoming Features</h3>
  <ul>
    <li>Cloud deployment of backend</li>
    <li>Advanced anomaly detection</li>
    <li>Role-based access control (RBAC) dashboards</li>
    <li>Enterprise integrations (Slack, Jira, Confluence)</li>
    <li>Real-time compliance dashboard</li>
    <li>Automated GDPR/DPDP data subject request handling</li>
    <li>Security certifications (SOC 2 Type II, ISO 27001)</li>
  </ul>

  <hr/>

  <h2>👥 Team</h2>

  <table border="1" cellpadding="10" cellspacing="0" width="100%">
    <tr>
      <th>Name</th>
      <th>Role</th>
    </tr>
    <tr>
      <td><b>Richa Bharti</b></td>
      <td>Development & AI Architecture</td>
    </tr>
    <tr>
      <td><b>Kunal Rohilla</b></td>
      <td>Cloud & Infrastructure</td>
    </tr>
    <tr>
      <td><b>Risha Batra</b></td>
      <td>Security & Compliance</td>
    </tr>
  </table>

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
