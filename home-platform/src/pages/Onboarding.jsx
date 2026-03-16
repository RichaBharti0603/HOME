import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/onboarding.css";
// replace with your actual image name

const Onboarding = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState(null);

  const [websiteData, setWebsiteData] = useState({
    productName: "",
    websiteUrl: "",
    industry: "",
    environment: "production",
    alerts: {
      email: true,
      slack: false,
      sms: false,
    },
  });
 


  const handleContinue = () => {
    if (!userType) return;
    setStep(2);
  };

  const handleWebsiteSubmit = (e) => {
    e.preventDefault();

    localStorage.setItem("userType", "startup");
    localStorage.setItem("websiteData", JSON.stringify(websiteData));

    navigate("/dashboard");
  };

  const handleAIOnly = () => {
    localStorage.setItem("userType", "ai-only");
    navigate("/ai-assistant");
  };

  return (
    <div className="onboarding-wrapper">
      <div className="onboarding-container">

        {/* LEFT IMAGE */}
         <img
  src="/images/onboarding.png"
  alt="Onboarding"
  className="onboarding-image"
/>

        {/* RIGHT CONTENT */}
        <div className="onboarding-card">
          {step === 1 && (
            <>
              <h1>Welcome to HOME</h1>
              <p className="subtitle">
                Let’s set up HOME based on how you want to use it.
              </p>

              <div className="option-grid">
                <div
                  className={`option-card ${userType === "startup" ? "active" : ""}`}
                  onClick={() => setUserType("startup")}
                >
                  <h3>I have a startup / website</h3>
                  <p>
                    Monitor uptime, SSL, security issues and compliance.
                  </p>
                </div>

                <div
                  className={`option-card ${userType === "ai-only" ? "active" : ""}`}
                  onClick={() => setUserType("ai-only")}
                >
                  <h3>I just want the AI Assistant</h3>
                  <p>
                    Use HOME’s private AI without registering a website.
                  </p>
                </div>
              </div>

              <button
                className="primary-btn"
                disabled={!userType}
                onClick={handleContinue}
              >
                Continue
              </button>
            </>
          )}

          {step === 2 && userType === "startup" && (
            <>
              <h1>Register Your Website</h1>
              <p className="subtitle">
                HOME will monitor and protect this site.
              </p>

              <form onSubmit={handleWebsiteSubmit} className="onboarding-form">
                <input
                  type="text"
                  placeholder="Product / Startup Name"
                  required
                  value={websiteData.productName}
                  onChange={(e) =>
                    setWebsiteData({ ...websiteData, productName: e.target.value })
                  }
                />

                <input
                  type="url"
                  placeholder="Website URL"
                  required
                  value={websiteData.websiteUrl}
                  onChange={(e) =>
                    setWebsiteData({ ...websiteData, websiteUrl: e.target.value })
                  }
                />

                <select
                  required
                  value={websiteData.industry}
                  onChange={(e) =>
                    setWebsiteData({ ...websiteData, industry: e.target.value })
                  }
                >
                  <option value="">Select Industry</option>
                  <option value="fintech">FinTech</option>
                  <option value="saas">SaaS</option>
                  <option value="health">Healthcare</option>
                  <option value="ecommerce">E-commerce</option>
                </select>

                <select
                  value={websiteData.environment}
                  onChange={(e) =>
                    setWebsiteData({ ...websiteData, environment: e.target.value })
                  }
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                </select>

                <div className="checkbox-group">
                  <label>
                    <input type="checkbox" checked readOnly />
                    Email Alerts
                  </label>
                  <label>
                    <input type="checkbox" />
                    Slack Alerts (Coming Soon)
                  </label>
                  <label>
                    <input type="checkbox" />
                    SMS Alerts (Coming Soon)
                  </label>
                </div>

                <button type="submit" className="primary-btn">
                  Finish Setup
                </button>
              </form>
            </>
          )}

          {step === 2 && userType === "ai-only" && (
            <>
              <h1>You're All Set</h1>
              <p className="subtitle">
                Start using HOME’s private AI assistant instantly.
              </p>

              <button className="primary-btn" onClick={handleAIOnly}>
                Go to AI Assistant
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
