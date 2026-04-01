import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";
import { apiRegister } from "../lib/api";

const LEFT_CARDS = [
  { icon: "◎", title: "Real-time Checks",    sub: "Monitor every 30 seconds" },
  { icon: "⬡", title: "AI Failure Analysis", sub: "Root cause in seconds" },
  { icon: "◈", title: "Global Nodes",        sub: "12 regions worldwide" },
  { icon: "⊡", title: "SDK Access",          sub: "Rust, Go, TypeScript" },
  { icon: "⊘", title: "Audit Logs",          sub: "Nanosecond precision" },
  { icon: "◧", title: "Cold Storage",        sub: "7-year retention" },
];

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!email || !password) { setError("All fields are required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await apiRegister(email, password);
      setSuccess("Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1400);
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
          <strong>"If your monitoring goes down,</strong> you don't just lose visibility —
          you lose the ability to respond. HOME changes that."
        </p>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <button className="auth-back" onClick={() => navigate("/")}>
          ← Back to home
        </button>

        <div className="auth-form-header">
          <h1 className="auth-form-title">Create an account</h1>
          <p className="auth-form-sub">Start monitoring your infrastructure for free.</p>
        </div>

        <form className="auth-form" onSubmit={handleRegister} id="register-form">
          {error   && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <div className="auth-field">
            <label className="input-label" htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label className="input-label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="input-field"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="auth-submit">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", justifyContent: "center" }}
              disabled={loading}
              id="register-submit"
            >
              {loading ? <span className="spinner" /> : "Create account"}
            </button>
          </div>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} id="go-login">Sign in</button>
        </p>
      </div>
    </div>
  );
}