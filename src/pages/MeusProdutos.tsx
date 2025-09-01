import React from "react";
import { Link, useNavigate } from "react-router-dom";

type Produto = {
  id: string;
  type: "ebook" | "curso" | "premium";
  title: string;
  desc: string;
  action: string; // Baixar / Assistir / Entrar
  url?: string;
};

const TOKEN_KEYS = ["myglobyx_token", "myglobyx:token"];
const ENTITLEMENTS_KEY = "mx_entitlements";

function carregarEntitlements(): Produto[] {
  try {
    const raw = localStorage.getItem(ENTITLEMENTS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Produto[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function logoutLocal() {
  TOKEN_KEYS.forEach((k) => localStorage.removeItem(k));
  // Opcional: limpar entitlements ao sair
  // localStorage.removeItem(ENTITLEMENTS_KEY);
}

export default function MeusProdutos() {
  const navigate = useNavigate();
  const items = carregarEntitlements();

  function handleLogout() {
    logoutLocal();
    navigate("/", { replace: true });
  }

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="container header__inner">
          <Link className="brand__logo" to="/">MYGLOBYX</Link>
          <nav className="nav">
            <Link className="link" to="/app">Mundo Digital</Link>
            <Link className="link" to="/suporte">Suporte</Link>
            <button className="btn btn--outline" onClick={handleLogout}>Sair</button>
          </nav>
        </div>
      </header>

      <section className="app">
        <div className="container">
          <div className="app__top">
            <div>
              <h1>Meus Produtos</h1>
              <p className="muted">Aqui ficam apenas os produtos que você comprou e foram liberados.</p>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="empty" style={{ padding: "18px 0" }}>
              <p className="muted">
                Você ainda não tem produtos liberados. Explore o{" "}
                <Link className="link" to="/app">Mundo Digital</Link> e confira os destaques.
              </p>
            </div>
          ) : (
            <div className="grid" style={{ marginTop: 12 }}>
              {items.map((p) => (
                <article key={p.id} className="card">
                  <span className="tag">
                    {p.type === "ebook" ? "E-book" : p.type === "curso" ? "Curso" : "Premium"}
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  {p.url ? (
                    <a
                      className="btn btn--primary"
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {p.action}
                    </a>
                  ) : (
                    <button className="btn btn--primary" disabled>
                      {p.action}
                    </button>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
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
