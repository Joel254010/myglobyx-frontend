// src/lib/adminApi.ts
import axios, { AxiosError } from "axios";
import { BASE_URL } from "./api"; // reaproveita a mesma base URL do app

// 👉 token EXCLUSIVO do admin (separado do token do cliente)
const ADMIN_TOKEN_KEY = "myglobyx_admin_token";

/* Helpers de token admin */
export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}
export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}
export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

/** ================== Axios do Admin (com injeção de token) ================== */
const adminApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60_000,
});

// injeta o token de admin antes de cada request
adminApi.interceptors.request.use((config) => {
  const t =
    getAdminToken() ||
    localStorage.getItem("myglobyx_token") || // fallback (se estiver usando o mesmo token)
    "";
  if (t) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${t}`;
  }
  return config;
});

// normaliza erros como no api.ts
adminApi.interceptors.response.use(
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

/** ================== Grants / Permissões do Admin ================== */
export type AdminGrants = {
  isAdmin: boolean;
  roles?: string[];
  email?: string;
};

/**
 * Valida as permissões do admin no backend.
 * Se `passedToken` vier, usa só nessa chamada; caso contrário usa o token salvo (interceptor).
 */
export async function getAdminGrants(passedToken?: string): Promise<AdminGrants> {
  const cfg = passedToken
    ? { headers: { Authorization: `Bearer ${passedToken}` } }
    : undefined;

  const { data } = await adminApi.get("/api/admin/ping", cfg);

  const roles: string[] = Array.isArray(data?.roles)
    ? data.roles
    : data?.isAdmin
    ? ["admin"]
    : [];

  return {
    isAdmin: Boolean(data?.isAdmin || roles.includes("admin")),
    roles,
    email: data?.email,
  };
}

export async function adminPing() {
  const { data } = await adminApi.get("/api/admin/ping");
  return data;
}

/** ================== Usuários (Admin) ================== */
export type AdminUserRow = {
  name: string;
  email: string;
  phone?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminUsersResp = {
  total: number;
  page: number;
  limit: number;
  users: AdminUserRow[];
};

export async function listAdminUsers(page = 1, limit = 25): Promise<AdminUsersResp> {
  const { data } = await adminApi.get<AdminUsersResp>("/api/admin/users", {
    params: { page, limit },
  });
  return data;
}

/** ================== Produtos (CRUD) ================== */
export type AdminProduct = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  mediaUrl?: string;
  price?: number;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
};

export async function listProducts() {
  const { data } = await adminApi.get<{ products: AdminProduct[] }>("/api/admin/products");
  return data.products;
}

export async function createProduct(payload: Partial<AdminProduct>) {
  const { data } = await adminApi.post<{ product: AdminProduct }>(
    "/api/admin/products",
    payload
  );
  return data.product;
}

export async function updateProduct(id: string, patch: Partial<AdminProduct>) {
  const { data } = await adminApi.put<{ product: AdminProduct }>(
    `/api/admin/products/${id}`,
    patch
  );
  return data.product;
}

export async function deleteProduct(id: string) {
  await adminApi.delete(`/api/admin/products/${id}`);
}

/** ================== Grants de Acesso a Produtos ================== */
export type Grant = {
  id: string;
  email: string;
  productId: string;
  createdAt: string;
  expiresAt?: string;
};

export async function listGrants(email?: string) {
  const { data } = await adminApi.get<{ grants: Grant[] }>(
    `/api/admin/grants${email ? `?email=${encodeURIComponent(email)}` : ""}`
  );
  return data.grants;
}

export async function grantAccess(email: string, productId: string, expiresAt?: string) {
  const { data } = await adminApi.post<{ grant: Grant }>(`/api/admin/grants`, {
    email,
    productId,
    expiresAt,
  });
  return data.grant;
}

export async function revokeAccess(email: string, productId: string) {
  await adminApi.delete(
    `/api/admin/grants?email=${encodeURIComponent(email)}&productId=${encodeURIComponent(
      productId
    )}`
  );
}

/** exporta o cliente também, caso queira usar direto */
export default adminApi;
