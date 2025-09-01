import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiLogin } from "../lib/api";

const TOKEN_KEYS = ["myglobyx_token", "myglobyx:token"]; // principal + alias
const USER_KEY = "myglobyx:user";

function hasTokenSaved() {
  for (const k of TOKEN_KEYS) {
    if (localStorage.getItem(k) || sessionStorage.getItem(k)) return true;
  }
  return false;
}

function saveAuth(token: string, user: { name: string; email: string }) {
  // padrão principal
  localStorage.setItem(TOKEN_KEYS[0], token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // alias de compatibilidade (se algo da app ler esse nome)
  localStorage.setItem(TOKEN_KEYS[1], token);
}

const getApiErrorMessageLocal = (err: unknown, fallback = "Erro inesperado.") => {
  if (err instanceof Error) return err.message;
  const e = err as any;
  return e?.response?.data?.error || e?.message || fallback;
};

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasTokenSaved()) {
      nav("/app", { replace: true });
    }
  }, [nav]);

  const validarEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.toLowerCase());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    if (!validarEmail(email)) {
      return setMsg({ type: "err", text: "Digite um e-mail válido." });
    }
    if (senha.length < 6) {
      return setMsg({ type: "err", text: "A senha precisa ter pelo menos 6 caracteres." });
    }

    try {
      setLoading(true);
      const { token, user } = await apiLogin(email, senha); // { token, user }
      saveAuth(token, user);
      setMsg({ type: "ok", text: "Login realizado! Redirecionando…" });
      nav("/app", { replace: true });
    } catch (err) {
      const code = getApiErrorMessageLocal(err);
      const map: Record<string, string> = {
        invalid_credentials: "E-mail ou senha inválidos.",
        unauthorized: "Sua sessão expirou. Entre novamente.",
        network_error: "Falha de rede. Verifique sua conexão e tente novamente.",
      };
      setMsg({ type: "err", text: map[code] || code || "Não foi possível entrar. Tente novamente." });
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
            <Link className="btn btn--primary" to="/criar-conta">Criar conta</Link>
          </nav>
        </div>
      </header>

      <section className="auth">
        <div className="container auth__grid">
          <div className="auth__intro">
            <h1>Entrar</h1>
            <p>Acesse sua biblioteca de e-books, cursos e conteúdos premium.</p>
            <ul className="trust">
              <li>🔒 Pagamentos via Appmax</li>
              <li>⚡ Acesso imediato</li>
              <li>🎓 Área de membros própria</li>
            </ul>
          </div>

          <div className="auth-card">
            <form onSubmit={handleSubmit} className="form">
              <div className="form-row">
                <label className="label">E-mail</label>
                <input
                  className="input"
                  type="email"
                  placeholder="voce@exemplo.com"
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
                <div className="row-between">
                  <label className="check">
                    <input type="checkbox" disabled /> Lembrar de mim
                  </label>
                  <a className="link" href="#recuperar">Esqueci a senha</a>
                </div>
              </div>

              {msg && <p className={msg.type === "ok" ? "success" : "error"}>{msg.text}</p>}

              <button className="btn btn--primary btn--lg btn--block" disabled={loading}>
                {loading ? "Entrando…" : "Entrar"}
              </button>

              <p className="muted small" style={{ textAlign: "center", marginTop: 12 }}>
                Não tem conta? <Link className="link" to="/criar-conta">Crie agora</Link>
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
