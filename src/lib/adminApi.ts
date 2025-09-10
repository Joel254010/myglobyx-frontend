import axios, { AxiosError } from "axios";
import { BASE_URL } from "./api";

// ========================
// 🔐 Token do Admin
// ========================

export const ADMIN_TOKEN_KEY = "myglobyx_admin_token";

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

// ========================
// ⚙️ Axios configurado com injeção automática de token
// ========================

const adminApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 60_000,
});

adminApi.interceptors.request.use((config) => {
  const token =
    getAdminToken() ||
    localStorage.getItem("myglobyx_token") || ""; // fallback
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

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

// ========================
// 🔐 Autenticação do Admin
// ========================

export async function loginAdmin(email: string, password: string): Promise<{ token: string }> {
  const { data } = await adminApi.post<{ token: string }>(
    "/admin/login",
    { email, password }
  );
  return data;
}

export async function getAdminPing(passedToken?: string | null) {
  const config = passedToken
    ? { headers: { Authorization: `Bearer ${passedToken}` } }
    : undefined;

  const { data } = await adminApi.get("/admin/ping", config);
  return data;
}

export async function getAdminGrants(passedToken?: string | null): Promise<{
  isAdmin: boolean;
  roles?: string[];
  email?: string;
}> {
  const data = await getAdminPing(passedToken);
  const roles = Array.isArray(data?.roles)
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

// ========================
// 👤 Usuários do sistema
// ========================

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
  const { data } = await adminApi.get<AdminUsersResp>("/admin/users", {
    params: { page, limit },
  });
  return data;
}

// ========================
// 📦 Produtos digitais
// ========================

export type AdminProduct = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  mediaUrl?: string;
  thumbnail?: string;       // ✅ imagem de capa
  categoria?: string;       // ✅ categoria adicionada
  subcategoria?: string;    // ✅ subcategoria adicionada
  price?: number;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
};

export async function listProducts(): Promise<AdminProduct[]> {
  const { data } = await adminApi.get<{ products: AdminProduct[] }>("/admin/products");
  return data.products;
}

export async function createProduct(payload: Partial<AdminProduct>): Promise<AdminProduct> {
  const { data } = await adminApi.post<{ product: AdminProduct }>(
    "/admin/products",
    payload
  );
  return data.product;
}

export async function updateProduct(id: string, patch: Partial<AdminProduct>): Promise<AdminProduct> {
  const { data } = await adminApi.put<{ product: AdminProduct }>(
    `/admin/products/${id}`,
    patch
  );
  return data.product;
}

export async function deleteProduct(id: string) {
  await adminApi.delete(`/admin/products/${id}`);
}

// ========================
// 🎫 Grants (Acesso a produtos)
// ========================

export type Grant = {
  id: string;
  email: string;
  productId: string;
  createdAt: string;
  expiresAt?: string;
};

export async function listGrants(email?: string): Promise<Grant[]> {
  const { data } = await adminApi.get<{ grants: Grant[] }>(
    `/admin/grants${email ? `?email=${encodeURIComponent(email)}` : ""}`
  );
  return data.grants;
}

export async function grantAccess(email: string, productId: string, expiresAt?: string): Promise<Grant> {
  const { data } = await adminApi.post<{ grant: Grant }>(`/admin/grants`, {
    email,
    productId,
    expiresAt,
  });
  return data.grant;
}

export async function revokeAccess(email: string, productId: string) {
  await adminApi.delete(
    `/admin/grants?email=${encodeURIComponent(email)}&productId=${encodeURIComponent(
      productId
    )}`
  );
}

// ========================
// 🔍 NOVA FUNÇÃO – Buscar produtos de um usuário
// ========================

export async function getProdutosDoUsuario(email: string): Promise<AdminProduct[]> {
  const grants = await listGrants(email);
  const productIds = grants.map((g) => g.productId);
  const allProducts = await listProducts();
  return allProducts.filter((p) => productIds.includes(p.id));
}

// ========================
// Exporta o client Axios também
// ========================

export default adminApi;
