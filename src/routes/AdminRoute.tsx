// src/routes/AdminRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { adminPing } from "../lib/adminApi";

const ADMIN_TOKEN_KEY = "myglobyx_admin_token";

export default function AdminRoute() {
  const [ok, setOk] = React.useState<null | boolean>(null);
  const location = useLocation();

  React.useEffect(() => {
    const t = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!t) { setOk(false); return; }

    let active = true;

    (async () => {
      try {
        await adminPing(); // faz GET /api/admin/ping com Bearer do localStorage
        if (!active) return;
        setOk(true);
      } catch (err: any) {
        if (!active) return;
        const code = String(err?.message || "");

        // Se for claramente falta de permissão/token, limpamos o token
        const shouldClear =
          code.includes("missing_admin_token") ||
          code.includes("unauthorized") ||
          code.includes("forbidden") ||
          code.includes("invalid_token") ||
          code.includes("token_expired") ||
          code.includes("HTTP_401") ||
          code.includes("HTTP_403");

        if (shouldClear) {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
        }
        setOk(false);
      }
    })();

    return () => { active = false; };
  }, []);

  if (ok === null) {
    return <div className="container" style={{ padding: 24 }}>Verificando permissões…</div>;
  }

  if (ok === false) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
