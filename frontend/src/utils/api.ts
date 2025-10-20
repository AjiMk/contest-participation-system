// Simple API client for the frontend
// Uses Vite env var `VITE_API_URL` or falls back to localhost

export const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

