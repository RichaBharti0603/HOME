import "./home.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  { icon: "◎", title: "ZK-Integrity Protocols",  desc: "Cryptographic proof for all incoming data streams, ensuring zero tampering at the source." },
  { icon: "⬡", title: "Edge AI Analysis",         desc: "Local failure detection models that identify anomalies before they reach the central cluster." },
  { icon: "◈", title: "Global Mesh Network",      desc: "Low-latency data synchronisation across distributed environments without centralised bottlenecks." },
  { icon: "⊡", title: "Programmable SDK",          desc: "Extend your monitoring capabilities with native support for Rust, Go, and TypeScript." },
  { icon: "⊘", title: "Retrospective Trace",       desc: "Replay network events with nanosecond precision to audit the exact sequence of failures." },
  { icon: "◧", title: "Cold-Storage Logs",         desc: "Immutable data storage with automated tiering for compliance and long-term forensics." },
];

export default function Home() {
  const navigate = useNavigate();

  // Scroll reveal
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add("visible")),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-up").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="home-page">

      {/* ── NAVBAR ──────────────────────── */}
      <nav className="navbar">
        <span className="nav-logo">HOME</span>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#docs">Docs</a>
        </div>

        <div className="nav-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/login")} id="nav-login">
            Login
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/register")} id="nav-get-started">
            Get Started
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────── */}
      <section className="hero">

        {/* Left: Copy */}
        <div className="fade-up">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            NETWORK · MAINNET V4.2 STABLE
          </div>

          <h1 className="hero-title">
            Monitor Everything.<br />
            <span className="hero-title-accent">Miss Nothing.</span>
          </h1>

          <p className="hero-sub">
            The sovereign observation engine. Leveraging Zero-Knowledge
            powered data integrity and localised AI failure analysis for
            enterprise-grade monitoring.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/register")} id="hero-deploy">
              Deploy Engine Free
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate("/login")} id="hero-demo">
              View Interactive Demo
            </button>
          </div>
        </div>

        {/* Right: Dashboard mock */}
        <div className="mock-window fade-up delay-2">
          <div className="mock-titlebar">
            <span className="mock-circle mc-r" />
            <span className="mock-circle mc-y" />
            <span className="mock-circle mc-g" />
            <span className="mock-titlebar-text">H.O.M.E — System Overview</span>
          </div>

          <div className="mock-content">
            <div className="mock-stat-row">
              <div className="mock-stat">
                <span className="mock-stat-label">Uptime</span>
                <span className="mock-stat-value green">99.98%</span>
              </div>
              <div className="mock-stat">
                <span className="mock-stat-label">Latency</span>
                <span className="mock-stat-value">42 ms</span>
              </div>
              <div className="mock-stat">
                <span className="mock-stat-label">Nodes</span>
                <span className="mock-stat-value violet">12/12</span>
              </div>
            </div>

            <div className="mock-bars">
              {[
                { name: "API Gateway",   pct: 92 },
                { name: "Auth Service",  pct: 68, amber: true },
                { name: "Data Pipeline", pct: 87 },
              ].map(b => (
                <div className="mock-bar-item" key={b.name}>
                  <span className="mock-bar-name">{b.name}</span>
                  <div className="mock-bar-track">
                    <div className={`mock-bar-fill${b.amber ? " amber" : ""}`} style={{ width: `${b.pct}%` }} />
                  </div>
                  <span className="mock-bar-pct">{b.pct}%</span>
                </div>
              ))}
            </div>

            <div className="mock-status">
              <span className="dot dot-up dot-pulse" />
              <span className="mock-status-text">All systems operational</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── ENTERPRISE VISIBILITY ─────── */}
      <section className="visibility-section" id="features">
        <div className="section-header fade-up">
          <p className="section-eyebrow">Enterprise Visibility</p>
          <h2 className="section-title">
            Proprietary architecture designed for high-availability environments
            where downtime is not an option.
          </h2>
        </div>
      </section>

      {/* ── FEATURE GRID ─────────────── */}
      <div className="features-section">
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className={`feature-card fade-up delay-${(i % 3) + 1}`} key={f.title}>
              <div className="feature-icon-wrap">{f.icon}</div>
              <p className="feature-title">{f.title}</p>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FINAL CTA ─────────────────── */}
      <section className="cta-section fade-up">
        <p className="section-eyebrow">Get Started Today</p>
        <h2 className="cta-title">Start monitoring in minutes.</h2>
        <p className="cta-sub">
          Free forever for small projects. No credit card required.
        </p>
        <div className="cta-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate("/register")} id="cta-register">
            Create Free Account
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate("/login")} id="cta-login">
            Sign In
          </button>
        </div>
      </section>

      {/* ── FOOTER ────────────────────── */}
      <footer className="site-footer">
        <div className="footer-top">
          <div>
            <p className="footer-brand-name">HOME</p>
            <p className="footer-brand-desc">
              Advanced sovereign monitoring for distributed systems.
            </p>
            <div className="footer-status-row">
              <span className="dot dot-up dot-pulse" />
              <span className="footer-status-label">All systems operational</span>
            </div>
          </div>

          <div>
            <p className="footer-col-title">Platform</p>
            <div className="footer-links-list">
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#docs">Docs</a>
            </div>
          </div>

          <div>
            <p className="footer-col-title">Technology</p>
            <div className="footer-links-list">
              <a href="#">ZKML Privacy</a>
              <a href="#">Global Mesh</a>
              <a href="#">Security</a>
            </div>
          </div>

          <div>
            <p className="footer-col-title">System</p>
            <div className="footer-links-list">
              <a href="#">Status</a>
              <a href="#">Changelog</a>
              <a href="#">API</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copy">© 2026 Home Sovereign Monitoring. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}