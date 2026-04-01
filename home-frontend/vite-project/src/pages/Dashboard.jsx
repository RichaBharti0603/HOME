import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import { apiGetMonitors, apiDeleteMonitor } from "../lib/api";

function statusClass(s) {
  if (s === "UP")   return "up";
  if (s === "DOWN") return "down";
  return "unknown";
}

function StatCard({ label, value, valueClass = "", sub }) {
  return (
    <div className="stat-card">
      <span className="stat-card-label">{label}</span>
      <span className={`stat-card-value ${valueClass}`}>{value}</span>
      {sub && <span className="stat-card-sub">{sub}</span>}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [monitors, setMonitors]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [deleting, setDeleting]   = useState(null); // id being deleted
  const [toast, setToast]         = useState(null); // { msg, type }
  const [userEmail, setUserEmail] = useState("");

  // ── Auth guard ──────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserEmail(payload.sub || "");
    } catch { /* ignore */ }
  }, []);

  // ── Fetch monitors ──────────────────────────────────
  const fetchMonitors = useCallback(async () => {
    try {
      const data = await apiGetMonitors();
      setMonitors(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast("Failed to fetch monitors: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 15000);
    return () => clearInterval(interval);
  }, [fetchMonitors]);

  // ── Delete ──────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove monitor "${name}"?`)) return;
    setDeleting(id);
    try {
      await apiDeleteMonitor(id);
      setMonitors(prev => prev.filter(m => m.id !== id));
      showToast(`"${name}" removed`, "success");
    } catch (err) {
      showToast("Delete failed: " + err.message, "error");
    } finally {
      setDeleting(null);
    }
  };

  // ── Toast helper ────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Derived stats ────────────────────────────────────
  const total   = monitors.length;
  const upCount = monitors.filter(m => m.status === "UP").length;
  const downCount = monitors.filter(m => m.status === "DOWN").length;
  const uptime  = total > 0 ? ((upCount / total) * 100).toFixed(1) : "—";

  // ── Logout ───────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-page">

      {/* ── TOPBAR ──────────────────────── */}
      <header className="dashboard-topbar">
        <div className="topbar-left">
          <span className="topbar-logo">HOME</span>
          <div className="topbar-status">
            <span className="dot dot-up dot-pulse" />
            <span className="topbar-status-text">Engine running</span>
          </div>
        </div>

        <div className="topbar-right">
          {userEmail && <span className="topbar-email">{userEmail}</span>}
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate("/setup")}
            id="topbar-add-monitor"
          >
            + Add monitor
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
            id="topbar-logout"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ─────────────────── */}
      <main className="dashboard-main">

        {/* Page header */}
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Monitoring Dashboard</h1>
            <p className="dash-sub">
              Live overview of all your monitored endpoints — auto-refreshes every 15s.
            </p>
          </div>
          <div className="dash-actions">
            <button
              className="btn btn-ghost btn-sm"
              onClick={fetchMonitors}
              id="dash-refresh"
            >
              ↺ Refresh
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate("/setup")}
              id="dash-new-monitor"
            >
              New Monitor
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="stats-row">
          <StatCard label="Total Monitors" value={total} sub="Configured endpoints" />
          <StatCard label="Online"  value={upCount}   valueClass="green"  sub="Currently up" />
          <StatCard label="Offline" value={downCount}  valueClass={downCount > 0 ? "amber" : ""} sub="Needs attention" />
          <StatCard label="Uptime"  value={total > 0 ? `${uptime}%` : "—"} valueClass="violet" sub="Across all monitors" />
        </div>

        {/* Monitors table */}
        <div className="monitors-card">
          <div className="monitors-card-header">
            <span className="monitors-card-title">Active Monitors</span>
            <span className="monitors-count">{total} endpoint{total !== 1 ? "s" : ""}</span>
          </div>

          {loading ? (
            <table className="monitor-table">
              <tbody>
                <tr className="loading-row">
                  <td colSpan={5}>
                    <div className="loading-inner">
                      <span className="spinner" style={{ borderTopColor: "var(--accent)" }} />
                      Loading monitors…
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : monitors.length === 0 ? (
            <div className="empty-monitors">
              <span className="empty-monitors-icon">◎</span>
              <p className="empty-monitors-title">No monitors yet</p>
              <p className="empty-monitors-sub">Add your first endpoint to start tracking uptime.</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate("/setup")}
                id="empty-add-monitor"
                style={{ marginTop: 8 }}
              >
                + Add monitor
              </button>
            </div>
          ) : (
            <table className="monitor-table" id="monitors-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Frequency</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {monitors.map(m => (
                  <tr key={m.id} id={`monitor-row-${m.id}`}>
                    <td>{m.project_name}</td>
                    <td>
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="monitor-url"
                        title={m.url}
                      >
                        {m.url}
                      </a>
                    </td>
                    <td>
                      <span className={`badge badge-${statusClass(m.status)}`}>
                        <span className={`dot dot-${statusClass(m.status)}${m.status === "UP" ? " dot-pulse" : ""}`} />
                        {m.status ?? "UNKNOWN"}
                      </span>
                    </td>
                    <td>
                      <span className="monitor-freq">{m.frequency}</span>
                    </td>
                    <td>
                      <div className="monitor-actions">
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(m.id, m.project_name)}
                          disabled={deleting === m.id}
                          id={`delete-monitor-${m.id}`}
                        >
                          {deleting === m.id ? <span className="spinner" /> : "Remove"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ── TOAST ─────────────────────────── */}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert">
          {toast.msg}
        </div>
      )}
    </div>
  );
}