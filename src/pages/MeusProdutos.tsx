import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type Produto = {
  id: string;
  type: "ebook" | "curso" | "premium";
  title: string;
  desc: string;
  action: string;
  url?: string;
};

const ENTITLEMENTS_KEY = "mx_entitlements";
const TOKEN_KEYS = ["myglobyx_token", "myglobyx:token"];

export default function MeusProdutos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);

  function logoutLocal() {
    TOKEN_KEYS.forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem(ENTITLEMENTS_KEY);
  }

  function handleLogout() {
    logoutLocal();
    navigate("/", { replace: true });
  }

  useEffect(() => {
    async function fetchMeusProdutos() {
      try {
        const res = await fetch("/api/me/products");
        const data = await res.json();

        const convertidos: Produto[] = (data?.products ?? []).map((p: any) => ({
          id: p.id,
          title: p.title,
          desc: p.desc,
          url: p.url ?? undefined,
          type: p.type ?? "premium", // fallback
          action:
            p.type === "ebook"
              ? "Baixar"
              : p.type === "curso"
              ? "Assistir"
              : "Acessar",
        }));

        // Salva localmente para sessões futuras
        localStorage.setItem(ENTITLEMENTS_KEY, JSON.stringify(convertidos));
        setProdutos(convertidos);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
      }
    }

    fetchMeusProdutos();
  }, []);

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="container header__inner">
          <Link className="brand__logo" to="/" aria-label="Voltar para Home">
            <img
              src="/logo-mx.png"
              alt="MyGlobyX"
              style={{ height: "40px", width: "auto" }}
            />
          </Link>
          <nav className="nav">
            <Link className="btn btn--ghost" to="/app">
              Mundo Digital
            </Link>
            <Link className="btn btn--ghost" to="/suporte">
              Suporte
            </Link>
            <button className="btn btn--outline" onClick={handleLogout}>
              Sair
            </button>
          </nav>
        </div>
      </header>

      {/* Conteúdo principal */}
      <section className="app">
        <div className="container">
          <div className="app__top">
            <div>
              <h1>Meus Produtos</h1>
              <p className="muted">
                Aqui ficam apenas os produtos que você comprou e foram liberados.
              </p>
            </div>
          </div>

          {produtos.length === 0 ? (
            <div className="empty" style={{ padding: "18px 0" }}>
              <p className="muted">
                Você ainda não tem produtos liberados. Explore o{" "}
                <Link className="link" to="/app">
                  Mundo Digital
                </Link>{" "}
                e confira os destaques.
              </p>
            </div>
          ) : (
            <div className="grid" style={{ marginTop: 12 }}>
              {produtos.map((p) => (
                <article key={p.id} className="card">
                  <span className="tag">
                    {p.type === "ebook"
                      ? "E-book"
                      : p.type === "curso"
                      ? "Curso"
                      : "Premium"}
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
          <small>
            © {new Date().getFullYear()} MyGlobyX. Todos os direitos reservados.
          </small>
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
