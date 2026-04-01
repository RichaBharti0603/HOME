const BASE = "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function apiRegister(email, password) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Registration failed");
  return data;
}

export async function apiLogin(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");
  return data;
}

export async function apiGetMonitors() {
  const res = await fetch(`${BASE}/monitors`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch monitors");
  return res.json();
}

export async function apiCreateMonitor(payload) {
  const res = await fetch(`${BASE}/setup`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to create monitor");
  return data;
}

export async function apiDeleteMonitor(id) {
  const res = await fetch(`${BASE}/monitors/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete monitor");
  return res.json();
}

export async function apiHealth() {
  const res = await fetch(`${BASE}/health`);
  if (!res.ok) throw new Error("Backend unreachable");
  return res.json();
}
