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
        navigate("/admin/login", {
          replace: true,
          state: { from: { pathname: "/admin" } },
        });
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
    <div
      className="page"
      style={{
        backgroundImage: 'url("/globyx-globe-bg.svg")',
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "60%",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
      }}
    >
      <header className="header" style={{ padding: "16px 0" }}>
        <div
          className="container header__inner"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <Link className="brand__logo" to="/" style={{ fontWeight: 700, fontSize: 20 }}>
            MYGLOBYX
          </Link>

          <nav className="nav" style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {adminEmail && (
              <>
                <span
                  style={{
                    fontWeight: 600,
                    color: "#00BFFF",
                    fontSize: "14px",
                    background: "#001E35",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontFamily: "monospace",
                  }}
                >
                  {adminEmail}
                </span>

                <div className="dropdown" style={{ position: "relative" }}>
                  <button
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="admin-menu-btn"
                  >
                    Menu
                  </button>

                  {menuOpen && (
                    <div className="admin-submenu">
                      <Link to="/admin/produtos" onClick={() => setMenuOpen(false)}>
                        Produtos
                      </Link>
                      <Link to="/admin/liberacoes" onClick={() => setMenuOpen(false)}>
                        Liberações
                      </Link>
                      <Link to="/admin/usuarios" onClick={() => setMenuOpen(false)}>
                        Usuários
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
            <button
              className="btn"
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontWeight: "bold",
                color: "#00BFFF",
                border: "1px solid #00BFFF",
                background: "transparent",
              }}
              onClick={handleAdminLogout}
            >
              Sair (Admin)
            </button>
          </nav>
        </div>
      </header>

      <main className="container" style={{ padding: 24 }}>
        {loading ? <div>Verificando sessão…</div> : <Outlet />}
      </main>
    </div>
  );
}
