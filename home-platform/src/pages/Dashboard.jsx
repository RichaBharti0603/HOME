import React, { useEffect, useState } from "react";
import { fetchWebsites } from "../services/monitoringApi";
import AddWebsiteForm from "../components/Monitoring/AddWebsiteForm";

<AddWebsiteForm onAdded={loadWebsites} />



const Dashboard = () => {
  const [websites, setWebsites] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWebsites();
    const interval = setInterval(loadWebsites, 30000); // auto-refresh

    return () => clearInterval(interval);
  }, []);

  async function loadWebsites() {
    try {
      const data = await fetchWebsites();
      setWebsites(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (loading) return <p>Loading monitoring data...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="dashboard">
      <h1>Website Monitoring</h1>

      {Object.keys(websites).length === 0 && (
        <p>No websites registered yet.</p>
      )}

      {Object.entries(websites).map(([id, site]) => (
        <div key={id} className="monitor-card">
          <h3>{site.url}</h3>

          {site.last_status ? (
            <>
              <p>Status: {site.last_status.status}</p>
              <p>Response Time: {site.last_status.response_time}s</p>
              <p>Status Code: {site.last_status.status_code}</p>
            </>
          ) : (
            <p>Checking for the first time...</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
