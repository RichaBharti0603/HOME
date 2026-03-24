import { useLocation } from "react-router-dom";

export default function Dashboard() {
  const location = useLocation();
  const monitorId = location.state?.monitorId;

  console.log("Received Monitor ID:", monitorId);

  return (
    <div>
      <h2>Dashboard</h2>

      {monitorId && (
        <p>✅ New monitor created with ID: {monitorId}</p>
      )}
    </div>
  );
}