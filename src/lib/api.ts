// src/lib/api.ts
import axios, { AxiosError, AxiosInstance } from "axios";

const RAW_API_URL = (import.meta as any)?.env?.VITE_API_URL as string | undefined;

const isBrowser = typeof window !== "undefined";
const isLocalhost =
  isBrowser &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const DEFAULT_LOCAL = "/api";
const DEFAULT_PROD = "https://backend-myglobyx.onrender.com/api";

export const BASE_URL = String(
  RAW_API_URL && RAW_API_URL.trim()
    ? RAW_API_URL.trim()
    : isLocalhost
    ? DEFAULT_LOCAL
    : DEFAULT_PROD
).replace(/\/+$/, "");

const ORIGIN_BASE = BASE_URL.includes("/api")
  ? BASE_URL.replace(/\/api$/, "")
  : BASE_URL;

if (!RAW_API_URL) {
  // eslint-disable-next-line no-console
  console.warn(`[api] VITE_API_URL não definido. Usando fallback: ${BASE_URL}`);
}

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60_000,
  withCredentials: false,
});

export function setAuthToken(token?: string | null) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError<any>) => {
    if (
      err.code === "ECONNABORTED" ||
      err.code === "ERR_NETWORK" ||
      err.message?.toLowerCase().includes("network")
    ) {
      return Promise.reject(new Error("network_error"));
    }
    const code = (err.response?.data as any)?.error as string | undefined;
    if (code) return Promise.reject(new Error(code));
    const http = err.response?.status ? `HTTP_${err.response.status}` : "unknown_error";
    return Promise.reject(new Error(http));
  }
);

export type AuthResponse = {
  token: string;
  user: { id?: string; name: string; email: string; admin?: boolean; isVerified?: boolean };
};

export type SignupResponse = Partial<AuthResponse> & { message?: string };

export async function apiRegister(
  name: string,
  email: string,
  password: string,
  phone?: string
): Promise<SignupResponse> {
  const payload: any = { name, email, password };
  if (phone) payload.phone = phone;
  const { data } = await api.post<SignupResponse>("/auth/register", payload);
  return data;
}

// alias para compat
export function apiSignup(
  name: string,
  email: string,
  password: string,
  phone?: string
): Promise<SignupResponse> {
  return apiRegister(name, email, password, phone);
}

export async function apiLogin(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

/** /health na raiz (pode dar CORS; ignoramos) */
export async function apiPingHealth() {
  try {
    return await axios.get(`${ORIGIN_BASE}/health`, { timeout: 15_000 });
  } catch {
    return;
  }
}

export type Address = {
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
};

export type Profile = {
  name: string;
  email: string;
  phone?: string;
  birthdate?: string;
  document?: string;
  address?: Address;
};

export async function apiGetProfile(token: string) {
  const { data } = await api.get<{ profile: Profile }>("/profile/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.profile;
}

/**
 * Atualiza perfil de forma tolerante:
 * - Tenta PATCH /profile
 * - Se voltar HTTP_404 ou HTTP_405, cai para PUT /profile/me
 */
export async function apiUpdateProfile(token: string, payload: Profile) {
  try {
    const { data } = await api.patch<{ profile: Profile }>("/profile", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.profile;
  } catch (e: any) {
    const msg = String(e?.message || "");
    if (msg === "HTTP_404" || msg === "HTTP_405") {
      const { data } = await api.put<{ profile: Profile }>("/profile/me", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return data.profile;
    }
    throw e;
  }
}

/** ===== Admin ===== */
export type AdminPingResponse = { ok: boolean; isAdmin?: boolean; roles?: string[]; email?: string };

/** Backend publicado aceita GET /admin/ping */
export async function apiAdminPing(token: string): Promise<AdminPingResponse> {
  const { data } = await api.get<AdminPingResponse>("/admin/ping", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export default api;
