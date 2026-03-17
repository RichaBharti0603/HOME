import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // 🔒 protect route
    if (!token) {
      navigate("/login");
    }
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Welcome to Dashboard 🎉</h1>
      <p>You are logged in.</p>
    </div>
  );
}