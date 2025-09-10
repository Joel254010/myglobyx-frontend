// src/lib/auth.ts

import { setAuthToken } from "./api";

export const TOKEN_KEYS = ["myglobyx_token", "myglobyx:token", "mx_token"] as const;
export const TOKEN_KEY = TOKEN_KEYS[0]; // chave principal
export const USER_KEY = "myglobyx:user";

const jwtRx = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

// Tipagem parcial de Storage
type WebStore = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key" | "length">;

// Detecta os storages disponíveis (localStorage e sessionStorage)
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

// Tenta extrair token de string crua ou JSON armazenado
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
  return jwtRx.test(v) ? v : null;
}

// === Leitura robusta do token salvo
export function getToken(): string | null {
  const stores = storages();
  for (const store of stores) {
    for (const key of TOKEN_KEYS) {
      try {
        const raw = store.getItem(key);
        const maybe = parseMaybeToken(raw || "");
        if (maybe) return maybe;
      } catch {}
    }
  }
  return null;
}

// === Lê o usuário salvo (como JSON)
export function getUser<T = any>(): T | null {
  for (const s of storages()) {
    try {
      const raw = s.getItem(USER_KEY);
      const parsed = JSON.parse(raw || "");
      if (parsed && typeof parsed === "object" && parsed.name) {
        return parsed as T;
      }
    } catch {}
  }
  return null;
}

// === Salva token e usuário nos storages
export function setAuth(token: string, user?: any) {
  for (const s of storages()) {
    try {
      for (const key of TOKEN_KEYS) s.setItem(key, token);
      if (user) s.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
  }
  setAuthToken(token);
}
export const setToken = (t: string, u?: any) => setAuth(t, u);

// === Limpa todos os tokens e usuário dos storages
export function clearAuth() {
  for (const s of storages()) {
    try {
      for (const k of [...TOKEN_KEYS, USER_KEY]) s.removeItem(k);
    } catch {}
  }
  setAuthToken(undefined);
}

// === Retorna true se houver token válido
export function isAuthenticated(): boolean {
  return !!getToken();
}

// === Mock login (dev/local apenas)
export function loginMock(email: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: email.toLowerCase(),
      email: email.toLowerCase(),
      iat: now,
      exp: now + 86400,
    })
  );
  const fake = `${header}.${payload}.sig`;
  setAuth(fake, { name: email.split("@")[0], email });
}

// === Executa logout e força redirecionamento para /login
export function logout() {
  clearAuth();
  if (typeof window !== "undefined") {
    window.location.replace("/login"); // 🔄 garante redirecionamento real
  }
}

// === Inicializa auth no axios a partir do storage
export function initAuthFromStorage() {
  const t = getToken();
  if (t) {
    setAuthToken(t);
  }
}

// === Header manual para requisições autenticadas
export function authHeader(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
