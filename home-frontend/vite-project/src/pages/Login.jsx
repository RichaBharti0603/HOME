import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css"; // reuse same styling

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async () => {

    const response = await fetch("http://127.0.0.1:8000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Login successful ✅");

      // ✅ store token
      localStorage.setItem("token", data.access_token);

      // ✅ redirect
      navigate("/dashboard");

    } else {
      alert(data.detail || "Login failed ❌");
    }
  };

  return (
    <div className="container">

      {/* LEFT IMAGE GRID */}
      <div className="image-grid">
        <img src="/images/img7.jpg" className="grid-img" />
        <img src="/images/img8.jpg" className="grid-img" />
        <img src="/images/img9.jpg" className="grid-img" />
        <img src="/images/img10.jpg" className="grid-img" />
        <img src="/images/img11.jpg" className="grid-img" />
        <img src="/images/img12.jpg" className="grid-img" />
      </div>

      {/* RIGHT FORM */}
      <div className="form-card">

        <h2 className="title">Welcome Back</h2>
        <p className="subtitle">
          Login to continue to HOME
        </p>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={loginUser}>
          Login
        </button>

        {/* REGISTER LINK */}
        <p className="switch-text">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")}>
            Register
          </span>
        </p>

      </div>
    </div>
  );
}