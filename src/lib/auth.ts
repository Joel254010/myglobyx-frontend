// src/lib/auth.ts
//
// Auth helper unificado (compat + produção)
// - Chaves suportadas: myglobyx_token, myglobyx:token, mx_token
// - Salva sempre na principal (myglobyx_token) e mantém aliases por compat.
// - Integra com axios (setAuthToken) para enviar Authorization: Bearer <token>

import { setAuthToken } from "./api";

export const TOKEN_KEYS = ["myglobyx_token", "myglobyx:token", "mx_token"] as const;
export const TOKEN_KEY = TOKEN_KEYS[0]; // principal
export const USER_KEY = "myglobyx:user";

const jwtRx = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

type WebStore = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">;

// --- Helpers de storage seguros (evitam erro em ambientes bloqueados)
function storages(): WebStore[] {
  if (typeof window === "undefined") return [];
  const out: WebStore[] = [];
  try {
    out.push(window.localStorage);
  } catch {}
  try {
    out.push(window.sessionStorage);
  } catch {}
  return out;
}

function parseMaybeToken(raw: string): string | null {
  if (!raw) return null;
  let v = raw.trim().replace(/^Bearer\s+/i, "");
  try {
    const obj = JSON.parse(raw);
    const cand =
      obj?.token?.toString?.() ||
      obj?.access_token?.toString?.() ||
      obj?.value?.toString?.();
    if (cand) v = String(cand);
  } catch {}
  if (!v) return null;
  if (jwtRx.test(v)) return v;
  return v || null;
}

// === leitura robusta do token (local ou session, JSON ou "Bearer xxx")
export function getToken(): string | null {
  const stores = storages();
  for (const store of stores) {
    for (const key of TOKEN_KEYS) {
      try {
        const raw = store.getItem(key);
        if (!raw) continue;
        const maybe = parseMaybeToken(raw);
        if (maybe) return maybe;
      } catch {}
    }
  }
  for (const store of stores) {
    try {
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i)!;
        const raw = store.getItem(k) || "";
        const maybe = parseMaybeToken(raw);
        if (maybe) return maybe;
      }
    } catch {}
  }
  return null;
}

// === leitura do usuário (se salvo)
export function getUser<T = any>(): T | null {
  for (const s of storages()) {
    try {
      const raw = s.getItem(USER_KEY);
      if (!raw) continue;
      return JSON.parse(raw) as T;
    } catch {}
  }
  return null;
}

// === grava em todas as chaves (principal + aliases) e aplica no axios
export function setAuth(token: string, user?: any) {
  for (const s of storages()) {
    try {
      s.setItem(TOKEN_KEYS[0], token);
      s.setItem(TOKEN_KEYS[1], token);
      s.setItem(TOKEN_KEYS[2], token);
      if (user) s.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
  }
  setAuthToken(token);
}

export const setToken = (t: string, u?: any) => setAuth(t, u);

export function clearAuth() {
  for (const s of storages()) {
    try {
      for (const k of [...TOKEN_KEYS, USER_KEY]) s.removeItem(k);
    } catch {}
  }
  setAuthToken(undefined);
}

export const clearToken = () => clearAuth();

export function isAuthenticated(): boolean {
  return !!getToken();
}

// === apenas para DEV/local: cria um token “fake”
export function loginMock(email: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify({ sub: email.toLowerCase(), email: email.toLowerCase(), iat: now, exp: now + 86400 }));
  const fake = `${header}.${payload}.sig`;
  setAuth(fake, { name: email.split("@")[0], email });
}

export function logout() {
  clearAuth();
  if (typeof window !== "undefined") {
    window.location.href = "/login"; // redireciona para a página de login após logout
  }
}

// === Bootstrap
export function initAuthFromStorage() {
  const t = getToken();
  if (t) setAuthToken(t);
}

// Conveniência para headers em fetch/axios manuais
export function authHeader(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
