// Simple API client for the frontend
// Uses Vite env var `VITE_API_URL` or falls back to localhost

export const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

function authHeaders(): Record<string, string> {
  try {
    const tokenCookie = document.cookie.split(';').map((p) => p.trim()).find((p) => p.startsWith('cps_token='));
    const token = tokenCookie ? decodeURIComponent(tokenCookie.split('=')[1]) : '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body ?? {}),
  });
  let json: ApiEnvelope<T> | null = null;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // ignore
  }
  if (!res.ok || !json?.success) {
    const msg = json?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return json!.data as T;
}

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: { ...authHeaders() },
  });
  let json: ApiEnvelope<T> | null = null;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // ignore
  }
  if (!res.ok || !json?.success) {
    const msg = json?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return json!.data as T;
}

export async function del<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  let json: ApiEnvelope<T> | null = null;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // ignore
  }
  if (!res.ok || (json && json.success === false)) {
    const msg = json?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (json?.data as T) ?? (undefined as unknown as T);
}

// Auth response shapes from backend
export type BackendUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
};

export type AuthResult = {
  user: BackendUser;
  token: string;
};
