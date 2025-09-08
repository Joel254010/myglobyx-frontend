import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAdminPing, ADMIN_TOKEN_KEY } from "../lib/adminApi";

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

  async function verificarPermissaoAdmin() {
    try {
      await getAdminPing(token as string); // ✅ Correção aqui
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
      ].some((c) => msg.includes(c));

      if (deveRemoverToken) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
      }

      setOk(false);
    }
  }

  verificarPermissaoAdmin();

  return () => {
    isMounted = false;
  };
}, []);


  if (ok === null) {
    return (
      <div className="container" style={{ padding: "48px 24px", textAlign: "center" }}>
        <p>🔐 Verificando permissões de administrador...</p>
      </div>
    );
  }

  if (ok === false) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
