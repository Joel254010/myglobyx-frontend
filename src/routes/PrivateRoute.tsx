// src/routes/PrivateRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

const TOKEN_KEYS = ["myglobyx_token", "myglobyx:token"];

function readToken(): string | null {
  const stores = [localStorage, sessionStorage];
  const jwtRx = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

  for (const store of stores) {
    for (const key of TOKEN_KEYS) {
      const raw = store.getItem(key);
      if (!raw) continue;

      // remove prefixo "Bearer "
      const trimmed = raw.trim().replace(/^Bearer\s+/i, "");
      // valor direto tipo "<jwt>"
      if (jwtRx.test(trimmed)) {
        // checa expiração se o token tiver claim exp
        try {
          const payloadB64 = trimmed.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
          const payloadJson = atob(payloadB64);
          const payload = JSON.parse(payloadJson);
          if (payload?.exp && Date.now() / 1000 > payload.exp) {
            // expirado -> ignora e tenta outra chave
            continue;
          }
        } catch {
          // se não der pra decodificar, segue adiante
        }
        return trimmed;
      }

      // valor salvo como JSON: { token: "...", access_token: "..." }
      try {
        const obj = JSON.parse(raw);
        const cand =
          obj?.token?.toString?.() ||
          obj?.access_token?.toString?.() ||
          obj?.value?.toString?.();
        if (cand && jwtRx.test(cand)) return cand;
      } catch {
        /* ignore */
      }
    }
  }
  return null;
}

export default function PrivateRoute() {
  const location = useLocation();
  const token = readToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
