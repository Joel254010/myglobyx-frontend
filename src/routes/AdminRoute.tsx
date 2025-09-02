// src/routes/AdminRoute.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { adminPing } from "../lib/adminApi";

const ADMIN_TOKEN_KEY = "myglobyx_admin_token";

export default function AdminRoute() {
  const [ok, setOk] = React.useState<null | boolean>(null);
  const location = useLocation();

  React.useEffect(() => {
    // se não tem token do admin, manda para login do admin
    const t = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!t) { setOk(false); return; }

    let live = true;
    adminPing()
      .then(() => live && setOk(true))
      .catch(() => live && setOk(false));
    return () => { live = false; };
  }, []);

  if (ok === null) {
    return <div className="container" style={{ padding: 24 }}>Verificando permissões…</div>;
  }

  if (ok === false) {
    // ❗️ login do admin é separado do login do usuário
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
