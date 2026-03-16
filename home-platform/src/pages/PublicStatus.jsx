import { useParams, useEffect, useState } from "react";

export default function PublicStatus() {
  const { token } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8000/status/${token}`)
      .then(res => res.json())
      .then(setData);
  }, [token]);

  if (!data) return <p>Loading...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h2>{data.url}</h2>
      <h3>Status: {data.status.toUpperCase()}</h3>
      <p>Last checked: {data.last_checked}</p>
    </div>
  );
}
