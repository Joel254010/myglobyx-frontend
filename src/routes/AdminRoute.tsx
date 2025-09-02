import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { adminPing } from "../lib/adminApi";

export default function AdminRoute() {
  const [ok, setOk] = React.useState<null | boolean>(null);
  const location = useLocation();

  React.useEffect(() => {
    let flag = true;
    adminPing()
      .then(() => flag && setOk(true))
      .catch(() => flag && setOk(false));
    return () => { flag = false; };
  }, []);

  if (ok === null) return <div className="container" style={{ padding: 24 }}>Verificando permissões…</div>;
  if (ok === false) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
