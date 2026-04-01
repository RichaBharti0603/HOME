import { useEffect, useState } from "react";

export default function Dashboard() {
  const [monitors, setMonitors] = useState([]);

  // 🔒 Check auth
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  // 📡 Fetch monitors
  useEffect(() => {
    let isMounted = true;

    const fetchMonitors = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/monitors");

        const data = await res.json();

        if (isMounted) {
          setMonitors(data);
        }
      } catch (err) {
        console.error("Error fetching monitors:", err);
      }
    };

    fetchMonitors();

    const interval = setInterval(fetchMonitors, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // 🔓 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>📊 Monitoring Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {monitors.length === 0 ? (
        <p>No monitors yet</p>
      ) : (
        <table border="1" cellPadding="10" style={{ marginTop: "20px", width: "100%" }}>
          <thead>
            <tr>
              <th>Project</th>
              <th>URL</th>
              <th>Status</th>
              <th>Frequency</th>
            </tr>
          </thead>
          <tbody>
            {monitors.map((m) => (
              <tr key={m.id}>
                <td>{m.project_name}</td>
                <td>{m.url}</td>
                <td
                  style={{
                    color:
                      m.status === "UP"
                        ? "green"
                        : m.status === "DOWN"
                        ? "red"
                        : "gray",
                    fontWeight: "bold",
                  }}
                >
                  {m.status}
                </td>
                <td>{m.frequency}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}