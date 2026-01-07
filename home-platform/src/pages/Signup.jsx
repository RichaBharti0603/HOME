import React from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card card">
          <h1>Get Started with HOME</h1>
          <p>Create your account to continue</p>

          <button
            className="btn btn-primary"
            onClick={() => navigate("/onboarding")}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
