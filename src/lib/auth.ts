// Auth helper unificado (compat + produção)
// - Chaves suportadas: myglobyx_token, myglobyx:token, mx_token
// - Salva sempre na principal (myglobyx_token) e mantém aliases por compat.

export const TOKEN_KEYS = ["myglobyx_token", "myglobyx:token", "mx_token"];
export const TOKEN_KEY = TOKEN_KEYS[0]; // principal
export const USER_KEY  = "myglobyx:user";

const jwtRx = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

// === leitura robusta do token (local ou session, JSON ou "Bearer xxx")
export function getToken(): string | null {
  const stores = [localStorage, sessionStorage];

  // 1) chaves conhecidas
  for (const store of stores) {
    for (const key of TOKEN_KEYS) {
      const raw = store.getItem(key);
      if (!raw) continue;

      let v = raw.trim().replace(/^Bearer\s+/i, "");
      // se veio JSON {token} / {access_token}
      try {
        const obj = JSON.parse(raw);
        const cand =
          obj?.token?.toString?.() ||
          obj?.access_token?.toString?.() ||
          obj?.value?.toString?.();
        if (cand) v = cand;
      } catch { /* ignore */ }

      if (jwtRx.test(v)) return v; // JWT válido
      if (key === "mx_token" && v) return v; // compat: aceita o legado
    }
  }

  // 2) varre tudo como fallback
  for (const store of stores) {
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i)!;
      const raw = store.getItem(k) || "";
      let v = raw.trim().replace(/^Bearer\s+/i, "");
      try {
        const obj = JSON.parse(raw);
        const cand =
          obj?.token?.toString?.() ||
          obj?.access_token?.toString?.() ||
          obj?.value?.toString?.();
        if (cand) v = cand;
      } catch {}
      if (jwtRx.test(v)) return v;
    }
  }
  return null;
}

// === grava em todas as chaves (principal + aliases)
export function setAuth(token: string, user?: any) {
  localStorage.setItem(TOKEN_KEYS[0], token); // myglobyx_token (principal)
  localStorage.setItem(TOKEN_KEYS[1], token); // myglobyx:token (alias)
  localStorage.setItem(TOKEN_KEYS[2], token); // mx_token (compat)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  for (const k of [...TOKEN_KEYS, USER_KEY]) {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// === apenas para DEV/local: cria um token “fake” (mantido por compat)
export function loginMock(email: string) {
  // finge um JWT: header.payload.signature (só para não quebrar quem valide regex)
  const now = Math.floor(Date.now() / 1000);
  const payload = btoa(JSON.stringify({ sub: email, iat: now, exp: now + 86400 }));
  const fake = `dev.${payload}.sig`;
  setAuth(fake, { name: email.split("@")[0], email });
}

export function logout() {
  clearAuth();
}
