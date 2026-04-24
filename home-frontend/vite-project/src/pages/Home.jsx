import "./home.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">

      {/* HEADER */}
      <header className="header">
        <div className="logo">HOME</div>
        <div className="nav">
          <button onClick={() => navigate("/login")}>Login</button>
          <button className="join-btn" onClick={() => navigate("/register")}>Join</button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="overlay">
          <h1>Monitor Everything That Matters</h1>
          <p>
            Websites. Portfolios. Startups. Your entire digital presence — in one place.
          </p>

          <button
            className="cta-btn"
            onClick={() => navigate("/register")}
          >
            Join HOME
          </button>
        </div>
      </section>

      

      {/* FEATURES */}
      <section className="features">
        <h2>Why HOME?</h2>
        <div className="feature-cards">
          <div className="card">
            <h3>Real-Time Monitoring</h3>
            <p>Track uptime, performance, and issues instantly.</p>
          </div>

          <div className="card">
            <h3>All-in-One Dashboard</h3>
            <p>Manage everything in one clean interface.</p>
          </div>

          <div className="card">
            <h3>Smart Insights</h3>
            <p>Understand patterns, not just raw data.</p>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="usecases">
        <h2>Built For</h2>
        <div className="usecase-grid">
          <div className="box"> Startups</div>
          <div className="box"> Websites</div>
          <div className="box"> Portfolios</div>
          <div className="box"> Businesses</div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <h2>Start Monitoring Today</h2>
        <button
          className="cta-btn large"
          onClick={() => navigate("/register")}
        >
          Get Started
        </button>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p> HOME. Built with precision.</p>
      </footer>

    </div>
  );
}