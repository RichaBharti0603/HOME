import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./setup.css";
import { apiCreateMonitor } from "../lib/api";

const MONITOR_TYPES = [
  { value: "uptime",    label: "Uptime Monitoring" },
  { value: "portfolio", label: "Portfolio Tracking" },
  { value: "ai",        label: "AI Insights (Coming Soon)" },
];

const FREQUENCIES = [
  { value: "5min",  label: "Every 5 minutes" },
  { value: "10min", label: "Every 10 minutes" },
  { value: "30min", label: "Every 30 minutes" },
  { value: "1hour", label: "Every 1 hour" },
];

export default function Setup() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [url, setUrl]                 = useState("");
  const [monitorType, setMonitorType] = useState("uptime");
  const [frequency, setFrequency]     = useState("5min");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!projectName.trim()) { setError("Project name is required."); return; }
    if (!url.trim())         { setError("URL is required."); return; }
    if (!url.startsWith("http")) { setError("URL must start with http:// or https://"); return; }

    setLoading(true);
    try {
      const data = await apiCreateMonitor({
        project_name: projectName,
        url,
        frequency,
        monitor_type: monitorType,
      });
      navigate("/dashboard", { state: { monitorId: data.id } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="setup-page">
      <div className="setup-card">
        <div className="setup-card-header">
          <h1 className="setup-card-title">Set up a monitor</h1>
          <p className="setup-card-sub">
            Tell HOME what to watch. We'll handle the rest.
          </p>
        </div>

        <form className="setup-form" onSubmit={handleSubmit} id="setup-form">
          {error && <div className="setup-error">{error}</div>}

          <div className="setup-field">
            <label className="input-label" htmlFor="project-name">Project name</label>
            <input
              id="project-name"
              className="input-field"
              placeholder="My API / Portfolio / Startup"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
            />
          </div>

          <div className="setup-field">
            <label className="input-label" htmlFor="monitor-url">Website URL</label>
            <input
              id="monitor-url"
              className="input-field"
              placeholder="https://example.com"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>

          <div className="setup-row">
            <div className="setup-field">
              <label className="input-label" htmlFor="monitor-type">Monitor type</label>
              <select
                id="monitor-type"
                className="input-field"
                value={monitorType}
                onChange={e => setMonitorType(e.target.value)}
              >
                {MONITOR_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="setup-field">
              <label className="input-label" htmlFor="frequency">Check frequency</label>
              <select
                id="frequency"
                className="input-field"
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
              >
                {FREQUENCIES.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="setup-submit">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={loading}
              id="setup-submit"
            >
              {loading ? <span className="spinner" /> : "Start Monitoring →"}
            </button>
          </div>
        </form>

        <div className="setup-footer">
          Already have monitors?{" "}
          <button onClick={() => navigate("/dashboard")} id="go-dashboard">
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}