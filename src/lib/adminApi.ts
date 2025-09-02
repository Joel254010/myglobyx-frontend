// src/lib/adminApi.ts
import api from "./api";

// 👉 token EXCLUSIVO do admin
const ADMIN_TOKEN_KEY = "myglobyx_admin_token";
function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

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

export async function adminPing() {
  const t = getAdminToken();
  if (!t) throw new Error("missing_admin_token");
  const { data } = await api.get("/api/admin/ping", {
    headers: { Authorization: `Bearer ${t}` },
  });
  return data;
}

export async function listProducts() {
  const t = getAdminToken(); if (!t) throw new Error("missing_admin_token");
  const { data } = await api.get<{products: AdminProduct[]}>("/api/admin/products", {
    headers: { Authorization: `Bearer ${t}` },
  });
  return data.products;
}

export async function createProduct(payload: Partial<AdminProduct>) {
  const t = getAdminToken(); if (!t) throw new Error("missing_admin_token");
  const { data } = await api.post<{product: AdminProduct}>("/api/admin/products", payload, {
    headers: { Authorization: `Bearer ${t}` },
  });
  return data.product;
}

export async function updateProduct(id: string, patch: Partial<AdminProduct>) {
  const t = getAdminToken(); if (!t) throw new Error("missing_admin_token");
  const { data } = await api.put<{product: AdminProduct}>(`/api/admin/products/${id}`, patch, {
    headers: { Authorization: `Bearer ${t}` },
  });
  return data.product;
}

export async function deleteProduct(id: string) {
  const t = getAdminToken(); if (!t) throw new Error("missing_admin_token");
  await api.delete(`/api/admin/products/${id}`, {
    headers: { Authorization: `Bearer ${t}` },
  });
}

export type Grant = { id: string; email: string; productId: string; createdAt: string; expiresAt?: string; };

export async function listGrants(email?: string) {
  const t = getAdminToken(); if (!t) throw new Error("missing_admin_token");
  const { data } = await api.get<{grants: Grant[]}>(`/api/admin/grants${email ? `?email=${encodeURIComponent(email)}` : ""}`, {
    headers: { Authorization: `Bearer ${t}` },
  });
  return data.grants;
}

export async function grantAccess(email: string, productId: string, expiresAt?: string) {
  const t = getAdminToken(); if (!t) throw new Error("missing_admin_token");
  const { data } = await api.post<{grant: Grant}>(`/api/admin/grants`, { email, productId, expiresAt }, {
    headers: { Authorization: `Bearer ${t}` },
  });
  return data.grant;
}

export async function revokeAccess(email: string, productId: string) {
  const t = getAdminToken(); if (!t) throw new Error("missing_admin_token");
  await api.delete(`/api/admin/grants?email=${encodeURIComponent(email)}&productId=${encodeURIComponent(productId)}`, {
    headers: { Authorization: `Bearer ${t}` },
  });
}
