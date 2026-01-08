const API_BASE = "http://127.0.0.1:8000";

export async function fetchWebsites() {
  const res = await fetch(`${API_BASE}/api/websites/`);
  return res.json();
}

export async function registerWebsite(url) {
  const res = await fetch(`${API_BASE}/api/websites/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    throw new Error("Failed to register website");
  }

  return res.json();
}
