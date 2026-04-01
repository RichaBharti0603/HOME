import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";
import { apiLogin } from "../lib/api";

const LEFT_CARDS = [
  { icon: "◎", title: "99.98% Uptime",       sub: "Average across all monitors" },
  { icon: "⬡", title: "42ms Latency",         sub: "Global edge network" },
  { icon: "◈", title: "12 Regions",           sub: "Always near your users" },
  { icon: "⊡", title: "Zero Config",          sub: "Deploy in under 2 minutes" },
  { icon: "⊘", title: "Instant Alerts",       sub: "PagerDuty, Slack, Webhooks" },
  { icon: "◧", title: "SOC 2 Ready",          sub: "Compliance out of the box" },
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email and password are required."); return; }
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      localStorage.setItem("token", data.access_token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* LEFT */}
      <div className="auth-left">
        <span className="auth-left-logo">HOME</span>

        <div className="auth-left-grid">
          {LEFT_CARDS.map(c => (
            <div className="auth-grid-card" key={c.title}>
              <span className="agc-icon">{c.icon}</span>
              <span className="agc-title">{c.title}</span>
              <span className="agc-sub">{c.sub}</span>
            </div>
          ))}
        </div>

        <p className="auth-left-quote">
          <strong>"Visibility is not optional."</strong> Enterprise infrastructure
          deserves sovereign, zero-compromise monitoring — that's HOME.
        </p>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <button className="auth-back" onClick={() => navigate("/")}>
          ← Back to home
        </button>

        <div className="auth-form-header">
          <h1 className="auth-form-title">Welcome back</h1>
          <p className="auth-form-sub">Sign in to your H.O.M.E workspace.</p>
        </div>

        <form className="auth-form" onSubmit={handleLogin} id="login-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label className="input-label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="input-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="input-field"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div className="auth-submit">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={loading}
              id="login-submit"
            >
              {loading ? <span className="spinner" /> : "Sign in"}
            </button>
          </div>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button onClick={() => navigate("/register")} id="go-register">Create one</button>
        </p>
      </div>
    </div>
  );
}