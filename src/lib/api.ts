/**
 * Centralised API client for the DriveSchool Pro backend.
 *
 * Usage:
 *   import { api } from "@/lib/api";
 *   const { data } = await api.get("/profile");
 *   const { data } = await api.patch("/profile", { full_name: "Amara" });
 */

import { supabase } from "@/integrations/supabase/client";

// In production this is set via VITE_API_URL env var (your Cloudflare Worker URL).
// Falls back to Wrangler's default local dev port.
const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8787";

type ApiResponse<T = unknown> =
  | { data: T; error: null }
  | { data: null; error: string };

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  const authHeader = await getAuthHeader();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...authHeader,
  };

  try {
    const res = await fetch(`${BASE_URL}/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      return { data: null, error: (json as { error?: string }).error ?? `HTTP ${res.status}` };
    }

    return { data: json as T, error: null };
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
};
