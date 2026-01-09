import React, { useEffect, useState } from "react";
import { fetchWebsites } from "../services/monitoringApi";
import WebsiteList from "../components/Monitoring/WebsiteList";
import AddWebsiteForm from "../components/Monitoring/AddWebsiteForm";

const Dashboard = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadWebsites() {
    setLoading(true);
    const data = await fetchWebsites();
    setWebsites(data);
    setLoading(false);
  }

  useEffect(() => {
    loadWebsites();

    const interval = setInterval(loadWebsites, 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Website Monitoring</h1>

      <AddWebsiteForm onAdded={loadWebsites} />

      {loading ? <p>Loading...</p> : <WebsiteList websites={websites} />}
    </div>
  );
};

export default Dashboard;
