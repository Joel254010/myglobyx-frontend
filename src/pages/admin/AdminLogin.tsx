// src/pages/admin/AdminLogin.tsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiLogin, apiPingHealth } from "../../lib/api";
import { getAdminGrants } from "../../lib/adminApi"; // checagem de permissão pós-login

const ADMIN_TOKEN_KEY = "myglobyx_admin_token";

function getErrMessage(err: unknown, fallback = "Erro inesperado.") {
  if (err instanceof Error) return err.message;
  const e = err as any;
  return e?.response?.data?.error || e?.message || fallback;
}

export default function AdminLogin() {
  const nav = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as any)?.from?.pathname &&
    String((location.state as any).from.pathname).startsWith("/admin")
      ? (location.state as any).from.pathname
      : "/admin";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const validarEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.toLowerCase());

  // 🔥 Aquece o backend (evita timeout no primeiro acesso do Render)
  React.useEffect(() => {
    apiPingHealth().catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    if (!validarEmail(email)) return setMsg({ type: "err", text: "Digite um e-mail válido." });
    if (senha.length < 6) return setMsg({ type: "err", text: "A senha precisa ter pelo menos 6 caracteres." });

    try {
      setLoading(true);

      // 1) Login normal (mesmo endpoint dos clientes) com retry em caso de cold start/timeout
      const normalizedEmail = email.trim().toLowerCase();
      let data;
      try {
        data = await apiLogin(normalizedEmail, senha);
      } catch (err) {
        if (getErrMessage(err) === "network_error") {
          await apiPingHealth().catch(() => {});
          data = await apiLogin(normalizedEmail, senha);
        } else {
          throw err;
        }
      }

      // 2) Guardar token no slot do admin
      const { token } = data;
      localStorage.setItem(ADMIN_TOKEN_KEY, token);

      // 3) Validar permissão de admin no backend
      const grants = await getAdminGrants(token);
      const isAdmin =
        Boolean((grants as any)?.isAdmin) ||
        (Array.isArray((grants as any)?.roles) && (grants as any).roles.includes("admin"));

      if (!isAdmin) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        throw new Error("unauthorized");
      }

      setMsg({ type: "ok", text: "Login do admin realizado!" });
      nav(redirectTo, { replace: true });
    } catch (err) {
      const code = getErrMessage(err);
      const map: Record<string, string> = {
        invalid_credentials: "E-mail ou senha inválidos.",
        unauthorized: "Acesso negado.",
        network_error: "Servidor acordando… tente novamente.",
      };
      setMsg({ type: "err", text: map[code] || code || "Não foi possível entrar como admin." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      {/* Header simples */}
      <header className="header">
        <div className="container header__inner">
          <Link className="brand__logo" to="/">MYGLOBYX</Link>
          <nav className="nav">
            <Link className="link" to="/como-funciona">Como funciona</Link>
            <Link className="link" to="/login">Login do cliente</Link>
          </nav>
        </div>
      </header>

      <section className="auth">
        <div className="container auth__grid">
          <div className="auth__intro">
            <h1>Login do Admin</h1>
            <p>Área exclusiva de gestão da MyGlobyX. Apenas e-mails autorizados têm acesso.</p>
            <ul className="trust">
              <li>🔐 Sessão separada da área do cliente</li>
              <li>✅ Checagem de permissão no backend</li>
            </ul>
          </div>

          <div className="auth-card">
            <form onSubmit={handleSubmit} className="form">
              <div className="form-row">
                <label className="label">E-mail</label>
                <input
                  className="input"
                  type="email"
                  placeholder="admin@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-row">
                <label className="label">Senha</label>
                <div className="field-pass">
                  <input
                    className="input"
                    type={mostrar ? "text" : "password"}
                    placeholder="Sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle"
                    onClick={() => setMostrar((s) => !s)}
                    aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {mostrar ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {msg && <p className={msg.type === "ok" ? "success" : "error"}>{msg.text}</p>}

              <button className="btn btn--primary btn--lg btn--block" disabled={loading}>
                {loading ? "Entrando…" : "Entrar no painel"}
              </button>

              <p className="muted small" style={{ textAlign: "center", marginTop: 12 }}>
                Precisa do login do cliente? <Link className="link" to="/login">Clique aqui</Link>.
              </p>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer__inner">
          <small>© {new Date().getFullYear()} MyGlobyX. Todos os direitos reservados.</small>
          <div className="footer__links">
            <Link to="/termos">Termos</Link>
            <Link to="/privacidade">Privacidade</Link>
            <Link to="/suporte">Suporte</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
