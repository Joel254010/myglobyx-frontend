import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiSignup } from "../lib/api";

// === helpers de storage (mantidos para compat, mas NÃO faremos auto-login após signup)
const TOKEN_KEYS = ["myglobyx_token", "myglobyx:token"];
const USER_KEY = "myglobyx:user";

function getApiErrorMessageLocal(err: unknown, fallback = "Erro inesperado.") {
  if (err instanceof Error) return err.message;
  const e = err as any;
  return e?.response?.data?.error || e?.message || fallback;
}

// máscara BR simples: (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX
function maskPhoneBR(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11); // máx 11 dígitos
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

function isValidBRPhone(v: string) {
  const d = v.replace(/\D/g, "");
  // 10 dígitos (fixo) ou 11 dígitos (celular) — validação básica
  return d.length === 10 || d.length === 11;
}

function calcStrength(pwd: string) {
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const percent = Math.min(100, (score / 5) * 100);
  let label = "Fraca";
  if (percent >= 60 && percent < 85) label = "Média";
  if (percent >= 85) label = "Forte";
  return { percent, label };
}

export default function CriarConta() {
  const nav = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [aceite, setAceite] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => calcStrength(senha), [senha]);
  const validarEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.toLowerCase());

  function onPhoneChange(raw: string) {
    setTelefone(maskPhoneBR(raw));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);

    const phoneDigits = telefone.replace(/\D/g, "");

    if (!nome.trim()) return setMsg({ type: "err", text: "Informe seu nome." });
    if (!validarEmail(email)) return setMsg({ type: "err", text: "Digite um e-mail válido." });
    if (!isValidBRPhone(telefone)) return setMsg({ type: "err", text: "Informe um telefone válido (DDD + número)." });
    if (senha.length < 6) return setMsg({ type: "err", text: "A senha precisa ter pelo menos 6 caracteres." });
    if (senha !== confirm) return setMsg({ type: "err", text: "A confirmação de senha não confere." });
    if (!aceite) return setMsg({ type: "err", text: "É necessário aceitar os Termos para continuar." });

    try {
      setLoading(true);
      // Agora enviamos também o telefone. O backend pode salvar como digits.
      await apiSignup(nome, email, senha, phoneDigits);

      // Não fazemos auto-login: mostramos instrução para verificar o e-mail.
      setMsg({
        type: "ok",
        text:
          "Conta criada! Enviamos um e-mail de confirmação. Verifique sua caixa de entrada (e Spam/Promoções).",
      });

      // Opcional: redirecionar ao login após alguns segundos
      setTimeout(() => {
        nav("/login?possignup=1", { replace: true });
      }, 1500);
    } catch (err) {
      const codeOrMsg = getApiErrorMessageLocal(err);
      const map: Record<string, string> = {
        email_in_use: "Este e-mail já está cadastrado.",
        network_error: "Falha de rede. Verifique sua conexão e tente novamente.",
      };
      setMsg({ type: "err", text: map[codeOrMsg] || codeOrMsg || "Não foi possível criar sua conta. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="container header__inner">
          <Link className="brand__logo" to="/">MYGLOBYX</Link>
          <nav className="nav">
            <Link className="link" to="/como-funciona">Como funciona</Link>
            <Link className="btn btn--ghost" to="/login">Entrar</Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo */}
      <section className="auth">
        <div className="container auth__grid">
          <div className="auth__intro">
            <h1>Criar conta</h1>
            <p>Leva menos de 1 minuto. Depois você já pode explorar o catálogo privado da MyGlobyX.</p>
            <ul className="trust">
              <li>⭐️ Acesso imediato aos produtos</li>
              <li>🔒 Seus dados protegidos</li>
              <li>✅ Pagamentos via Appmax</li>
            </ul>
          </div>

          <div className="auth-card">
            <form onSubmit={handleSubmit} className="form">
              <div className="form-row">
                <label className="label">Nome completo</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

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
                <label className="label">Telefone (com DDD)</label>
                <input
                  className="input"
                  type="tel"
                  inputMode="tel"
                  placeholder="(11) 91234-5678"
                  value={telefone}
                  onChange={(e) => onPhoneChange(e.target.value)}
                  autoComplete="tel"
                  required
                />
                <small className="muted">Usaremos para suporte e contato da compra.</small>
              </div>

              <div className="form-row">
                <label className="label">Senha</label>
                <div className="field-pass">
                  <input
                    className="input"
                    type={mostrar ? "text" : "password"}
                    placeholder="Crie uma senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    autoComplete="new-password"
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

                {/* medidor de força */}
                <div className="meter" aria-live="polite">
                  <div
                    className={`meter__bar ${
                      strength.label === "Forte" ? "ok" : strength.label === "Média" ? "mid" : "low"
                    }`}
                    style={{ width: `${strength.percent}%` }}
                  />
                </div>
                <small className="muted">Força da senha: <b>{strength.label}</b></small>
              </div>

              <div className="form-row">
                <label className="label">Confirmar senha</label>
                <input
                  className="input"
                  type={mostrar ? "text" : "password"}
                  placeholder="Repita a senha"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <label className="check form-row">
                <input
                  type="checkbox"
                  checked={aceite}
                  onChange={(e) => setAceite(e.target.checked)}
                />
                Eu li e aceito os <Link className="link" to="/termos">Termos</Link> e a{" "}
                <Link className="link" to="/privacidade">Política de Privacidade</Link>.
              </label>

              {msg && <p className={msg.type === "ok" ? "success" : "error"}>{msg.text}</p>}

              <button className="btn btn--primary btn--lg btn--block" disabled={loading}>
                {loading ? "Criando conta…" : "Criar conta"}
              </button>

              <p className="muted small" style={{ textAlign: "center", marginTop: 12 }}>
                Já tem conta? <Link className="link" to="/login">Entrar</Link>
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer__inner">
          <small>© {new Date().getFullYear()} MyGlobyX. Todos os direitos reservados.</small>
        </div>
      </footer>
    </div>
  );
}
