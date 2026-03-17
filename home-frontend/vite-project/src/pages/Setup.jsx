import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css"; // reuse same styling

export default function Setup() {

  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [url, setUrl] = useState("");
  const [frequency, setFrequency] = useState("5min");
  const [monitorType, setMonitorType] = useState("uptime");

  const handleSubmit = () => {

    if (!projectName || !url) {
      alert("Please fill all required fields");
      return;
    }

    // 👉 For now just log (backend next step)
    console.log({
      projectName,
      url,
      frequency,
      monitorType
    });

    // ✅ move to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="container">

      {/* LEFT IMAGE GRID */}
      <div className="image-grid">
        <img src="/images/img13.jpg" className="grid-img" />
        <img src="/images/img14.jpg" className="grid-img" />
        <img src="/images/img15.jpg" className="grid-img" />
        
      </div>

      {/* RIGHT FORM */}
      <div className="form-card">

        <h2 className="title">Set Up Monitoring</h2>
        <p className="subtitle">
          Tell us what you want HOME to track for you
        </p>

        {/* Project Name */}
        <input
          placeholder="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />

        {/* URL */}
        <input
          placeholder="Website URL (https://...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        {/* Monitoring Type */}
        <select
          value={monitorType}
          onChange={(e) => setMonitorType(e.target.value)}
        >
          <option value="uptime">Uptime Monitoring</option>
          <option value="portfolio">Portfolio Tracking</option>
          <option value="ai">AI Insights (Coming Soon)</option>
        </select>

        {/* Frequency */}
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="5min">Every 5 minutes</option>
          <option value="10min">Every 10 minutes</option>
          <option value="1hour">Every 1 hour</option>
        </select>

        <button onClick={handleSubmit}>
          Start Monitoring
        </button>

      </div>
    </div>
  );
}