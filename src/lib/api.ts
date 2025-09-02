// src/lib/api.ts
import axios, { AxiosError, AxiosInstance } from "axios";

/**
 * Prioridade da base URL:
 * 1) VITE_API_URL (Netlify/.env.local)
 * 2) localhost:4000 quando rodando local
 * 3) backend de produção (Render) como fallback
 */
const RAW_API_URL = (import.meta as any)?.env?.VITE_API_URL as string | undefined;

const isBrowser = typeof window !== "undefined";
const isLocalhost =
  isBrowser &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const DEFAULT_LOCAL = "http://127.0.0.1:4000";
const DEFAULT_PROD = "https://backend-myglobyx.onrender.com";

export const BASE_URL = String(
  RAW_API_URL && RAW_API_URL.trim()
    ? RAW_API_URL.trim()
    : isLocalhost
    ? DEFAULT_LOCAL
    : DEFAULT_PROD
).replace(/\/+$/, ""); // remove trailing slash

if (!RAW_API_URL) {
  // Ajuda em DX: avisa se está usando fallback
  // eslint-disable-next-line no-console
  console.warn(
    `[api] VITE_API_URL não definido. Usando fallback: ${BASE_URL}`
  );
}

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
  withCredentials: false,
});

// Helper opcional para setar/remover Bearer no cliente global
export function setAuthToken(token?: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// Interceptor de erros → mapeia para códigos simples
api.interceptors.response.use(
  (r) => r,
  (err: AxiosError<any>) => {
    // timeout/rede
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
  user: { id?: string; name: string; email: string };
};

export async function apiSignup(name: string, email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/signup", { name, email, password });
  return data;
}

export async function apiLogin(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
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
  birthdate?: string; // YYYY-MM-DD
  document?: string;  // CPF
  address?: Address;
};

export async function apiGetProfile(token: string) {
  const { data } = await api.get<{ profile: Profile }>("/api/profile/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.profile;
}

export async function apiUpdateProfile(token: string, payload: Profile) {
  const { data } = await api.put<{ profile: Profile }>("/api/profile/me", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.profile;
}

export default api;
