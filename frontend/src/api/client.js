export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081/api";

export function getStoredSession() {
  const raw = localStorage.getItem("sport_buddy_session");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("sport_buddy_session");
    return null;
  }
}

export function storeSession(session) {
  localStorage.setItem("sport_buddy_session", JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem("sport_buddy_session");
}

function createQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

export function withQuery(path, params) {
  return `${path}${createQuery(params)}`;
}

export async function apiFetch(path, options = {}) {
  const session = getStoredSession();
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearSession();
  }

  const contentType = response.headers.get("content-type") || "";
  const data = response.status === 204
    ? null
    : contentType.includes("application/json")
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    const message = typeof data === "object" && data?.message
      ? data.message
      : `Erreur HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = data?.details;
    throw error;
  }

  return data;
}

export function jsonBody(payload) {
  return JSON.stringify(payload);
}
