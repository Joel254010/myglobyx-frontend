// src/pages/admin/AdminLayout.tsx
import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { getAdminGrants } from "../../lib/adminApi";

const ADMIN_TOKEN_KEY = "myglobyx_admin_token";

export default function AdminLayout() {
  const [adminEmail, setAdminEmail] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    let active = true;

    (async () => {
      try {
        // tenta obter permissões/dados do admin
        const grants = await getAdminGrants(); // usa token do localStorage
        if (!active) return;
        setAdminEmail(grants?.email ?? null);
      } catch (err: any) {
        if (!active) return;
        // token inválido/expirado → limpa e volta pro login
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        navigate("/admin/login", { replace: true, state: { from: { pathname: "/admin" } } });
        return;
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [navigate]);

  function handleAdminLogout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="page">
      <header className="header">
        <div className="container header__inner">
          <Link className="brand__logo" to="/">MYGLOBYX</Link>
          <nav className="nav" style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link className="link" to="/admin/produtos">Produtos</Link>
            <Link className="link" to="/admin/liberacoes">Liberações</Link>
            <Link className="link" to="/admin/usuarios">Usuários</Link>
            {adminEmail && (
              <span className="muted small" title={adminEmail} style={{ opacity: 0.8 }}>
                {adminEmail}
              </span>
            )}
            <button className="btn btn--outline" onClick={handleAdminLogout}>Sair (Admin)</button>
          </nav>
        </div>
      </header>

      <main className="container" style={{ padding: 24 }}>
        {loading ? <div>Verificando sessão…</div> : <Outlet />}
      </main>
    </div>
  );
}
