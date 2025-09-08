// src/routes/AdminRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { adminPing } from "../lib/adminApi";

const ADMIN_TOKEN_KEY = "myglobyx_admin_token";

export default function AdminRoute() {
  const [ok, setOk] = React.useState<null | boolean>(null);
  const location = useLocation();

  React.useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      setOk(false);
      return;
    }

    let isMounted = true;

    const verificarAdmin = async () => {
      try {
        await adminPing(token); // Faz requisição com Bearer
        if (isMounted) setOk(true);
      } catch (err: any) {
        if (!isMounted) return;

        const msg = String(err?.message || "");
        const deveRemoverToken = [
          "missing_admin_token",
          "unauthorized",
          "forbidden",
          "invalid_token",
          "token_expired",
          "HTTP_401",
          "HTTP_403",
        ].some(c => msg.includes(c));

        if (deveRemoverToken) {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
        }

        setOk(false);
      }
    };

    verificarAdmin();

    return () => {
      isMounted = false;
    };
  }, []);

  if (ok === null) {
    return (
      <div className="container" style={{ padding: 24 }}>
        Verificando permissões…
      </div>
    );
  }

  if (ok === false) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
