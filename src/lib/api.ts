/**
 * Centralised API client for the DriveSchool Pro backend.
 * Uses Cloudflare D1 database via Pages Functions
 */

// API calls go to the same domain (Cloudflare Pages)
const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

type ApiResponse<T = unknown> =
  | { data: T; error: null }
  | { data: null; error: string };

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function setAuthToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      let errorMessage = `HTTP ${res.status}`;
      try {
        const json = text ? JSON.parse(text) : {};
        errorMessage = json.error ?? errorMessage;
      } catch { /* ignore parse error */ }
      return { data: null, error: errorMessage };
    }

    const text = await res.text();
    let data = null;
    
    if (text.trim()) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse API response", text);
        return { data: null, error: "Invalid JSON response from server" };
      }
    }
    
    return { data: data as T, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return { data: null, error: message };
  }
}

export const api = {
  get:    <T = unknown>(path: string)                  => request<T>("GET",    path),
  post:   <T = unknown>(path: string, body?: unknown)  => request<T>("POST",   path, body),
  patch:  <T = unknown>(path: string, body?: unknown)  => request<T>("PATCH",  path, body),
  put:    <T = unknown>(path: string, body?: unknown)  => request<T>("PUT",    path, body),
  delete: <T = unknown>(path: string)                  => request<T>("DELETE", path),
  setAuthToken,
  getAuthToken,
  clearAuthToken: () => setAuthToken(null),
};
