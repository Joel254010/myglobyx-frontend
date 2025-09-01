import { Navigate, Outlet, useLocation } from "react-router-dom";

const TOKEN_KEY = "myglobyx_token";

export default function PrivateRoute() {
  const location = useLocation();
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
