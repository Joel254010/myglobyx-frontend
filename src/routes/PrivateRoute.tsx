// src/routes/PrivateRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getToken, initAuthFromStorage } from "../lib/auth";

/**
 * Rota protegida para áreas autenticadas do usuário.
 * - Usa o helper unificado de auth (localStorage/sessionStorage + compat).
 * - Preserva o `state.from` para redirecionar de volta após login.
 */
export default function PrivateRoute() {
  // garante que o Authorization do axios seja restaurado ao montar a app
  initAuthFromStorage();

  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
