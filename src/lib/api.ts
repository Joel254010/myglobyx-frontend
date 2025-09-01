// src/lib/api.ts
import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:4000", // chama a API direto, sem proxy do Vite
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
  withCredentials: false,
});

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError<any>) => {
    if (err.code === "ECONNABORTED" || err.message === "Network Error") {
      return Promise.reject(new Error("network_error"));
    }
    const code = err.response?.data?.error as string | undefined;
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

export default api;
