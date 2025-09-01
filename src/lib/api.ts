// src/lib/api.ts
import axios, { AxiosError, AxiosInstance } from "axios";

// Lê do Netlify (Vite) e cai para localhost APENAS em dev
const RAW_API_URL = (import.meta as any).env?.VITE_API_URL?.trim?.();
const isBrowser = typeof window !== "undefined";
const isLocal =
  isBrowser &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

export const BASE_URL = RAW_API_URL || (isLocal ? "http://127.0.0.1:5000" : ""); // "" = mesma origem se um dia usar proxy

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
