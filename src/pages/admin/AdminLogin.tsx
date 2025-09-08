import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiPingHealth } from "../../lib/api";
import { loginAdmin, getAdminPing, ADMIN_TOKEN_KEY } from "../../lib/adminApi";

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

  // ✅ Ping inicial para acordar o Render
  useEffect(() => {
    apiPingHealth().catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    if (!validarEmail(email)) return setMsg({ type: "err", text: "Digite um e-mail válido." });
    if (senha.length < 6) return setMsg({ type: "err", text: "A senha precisa ter pelo menos 6 caracteres." });

    const em = email.trim().toLowerCase();

    try {
      setLoading(true);

      // Tentativas com backoff para cold start
      let data: { token: string } | undefined;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          data = await loginAdmin(em, senha);
          break;
        } catch (err: any) {
          if (attempt === 3 || err?.message !== "network_error") throw err;
          await apiPingHealth().catch(() => {});
          await new Promise((r) => setTimeout(r, attempt * 500));
        }
      }

      // ✅ Verificação segura do token
      if (!data || !data.token) {
        throw new Error("invalid_token");
      }

      const token = data.token;
      localStorage.setItem(ADMIN_TOKEN_KEY, token);

      // ✅ Verifica permissão admin via /api/admin/ping
      const ping = await getAdminPing(token);
      const isAdmin = ping?.isAdmin === true;

      if (!isAdmin) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        throw new Error("unauthorized");
      }

      setMsg({ type: "ok", text: "Login do admin realizado!" });
      nav(redirectTo, { replace: true });
    } catch (err: any) {
      const code = err?.response?.data?.error || err?.message || "login_failed";
      const map: Record<string, string> = {
        invalid_credentials: "E-mail ou senha inválidos.",
        unauthorized: "Acesso negado.",
        invalid_token: "Resposta inválida do servidor.",
        network_error: "Servidor acordando... tente novamente.",
        login_failed: "Não foi possível entrar como admin.",
      };
      setMsg({ type: "err", text: map[code] || code });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
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
