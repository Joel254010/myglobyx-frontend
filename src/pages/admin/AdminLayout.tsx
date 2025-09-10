// src/pages/admin/AdminLayout.tsx
import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { getAdminGrants } from "../../lib/adminApi";

const ADMIN_TOKEN_KEY = "myglobyx_admin_token";

export default function AdminLayout() {
  const [adminEmail, setAdminEmail] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    let active = true;

    (async () => {
      try {
        const grants = await getAdminGrants();
        if (!active) return;
        setAdminEmail(grants?.email ?? null);
      } catch (err: any) {
        if (!active) return;
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
    <div className="page" style={{ backgroundImage: 'url(/globyx-globe-bg.svg)', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: '60%', backgroundAttachment: 'fixed' }}>
      <header className="header">
        <div className="container header__inner">
          <Link className="brand__logo" to="/">MYGLOBYX</Link>
          <nav className="nav" style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {adminEmail && (
              <div className="dropdown">
                <button
                  onClick={() => setMenuOpen(prev => !prev)}
                  className="btn btn--link"
                  style={{ fontSize: 14, opacity: 0.8 }}
                >
                  {adminEmail}
                </button>
                {menuOpen && (
                  <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', background: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', padding: '8px 12px', borderRadius: 8, zIndex: 1000 }}>
                    <Link to="/admin/produtos" className="link" onClick={() => setMenuOpen(false)}>Produtos</Link><br />
                    <Link to="/admin/liberacoes" className="link" onClick={() => setMenuOpen(false)}>Liberações</Link><br />
                    <Link to="/admin/usuarios" className="link" onClick={() => setMenuOpen(false)}>Usuários</Link>
                  </div>
                )}
              </div>
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
