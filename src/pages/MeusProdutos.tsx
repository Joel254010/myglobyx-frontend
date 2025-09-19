import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listUserProducts, UserProduct } from "../lib/api";

const ENTITLEMENTS_KEY = "mx_entitlements";
const TOKEN_KEYS = ["myglobyx_token", "myglobyx:token"];

export default function MeusProdutos() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<UserProduct[]>([]);

  function logoutLocal() {
    TOKEN_KEYS.forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem(ENTITLEMENTS_KEY);
  }

  function handleLogout() {
    logoutLocal();
    navigate("/", { replace: true });
  }

  function getUserToken(): string | null {
    return (
      localStorage.getItem("myglobyx_token") ||
      localStorage.getItem("myglobyx:token")
    );
  }

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const token = getUserToken();
        if (!token) {
          console.warn("Token não encontrado");
          return;
        }
        const produtosDoUsuario = await listUserProducts(token);
        setProdutos(produtosDoUsuario);
        localStorage.setItem(
          ENTITLEMENTS_KEY,
          JSON.stringify(produtosDoUsuario)
        );
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
      }
    }

    carregarProdutos();
  }, []);

  function getAcessoLabel(p: UserProduct) {
    switch (p.type) {
      case "ebook":
        return "Ler agora";
      case "curso":
        return "Assistir";
      case "servico": // ✅ sem acento
        return "Ver instruções";
      default:
        return "Acessar";
    }
  }

  function getTagLabel(p: UserProduct) {
    switch (p.type) {
      case "ebook":
        return "E-book";
      case "curso":
        return "Curso";
      case "servico":
        return "Serviço";
      default:
        return "Premium";
    }
  }

  return (
    <div className="page fundo-feed">
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
            <h1>Meus Produtos</h1>
            <p className="muted">
              Aqui ficam os produtos que você adquiriu e foram liberados pelo
              administrador.
            </p>
          </div>

          {produtos.length === 0 ? (
            <div className="empty" style={{ padding: "18px 0" }}>
              <p className="muted">
                Você ainda não tem produtos liberados. Explore o{" "}
                <Link className="link" to="/app">
                  Mundo Digital
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid grid-produtos" style={{ marginTop: 16 }}>
              {produtos.map((p) => (
                <article key={p.id} className="card card-produto">
                  {p.thumbnail && (
                    <img
                      src={p.thumbnail}
                      alt={p.title}
                      className="thumb-produto"
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "8px 8px 0 0",
                      }}
                    />
                  )}

                  <div className="conteudo-produto" style={{ padding: "12px" }}>
                    <span className="tag">{getTagLabel(p)}</span>
                    <h3 style={{ margin: "8px 0" }}>{p.title}</h3>
                    <p
                      className="muted small"
                      style={{ marginBottom: "12px" }}
                    >
                      {p.desc}
                    </p>

                    {/* E-book */}
                    {p.type === "ebook" && p.mediaUrl && (
                      <a
                        className="btn btn--primary"
                        href={p.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getAcessoLabel(p)}
                      </a>
                    )}

                    {/* Curso */}
                    {p.type === "curso" && p.url && (
                      <a
                        className="btn btn--primary"
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {getAcessoLabel(p)}
                      </a>
                    )}

                    {/* Serviço */}
                    {p.type === "servico" && p.instrucoes ? (
                      <div className="box-instrucoes">
                        <details>
                          <summary className="btn btn--outline">
                            {getAcessoLabel(p)}
                          </summary>
                          <div style={{ marginTop: 8 }}>
                            <p className="muted small">{p.instrucoes}</p>
                          </div>
                        </details>
                      </div>
                    ) : null}

                    {/* Caso não tenha URL/media */}
                    {!p.url && !p.mediaUrl && p.type !== "servico" && (
                      <button className="btn btn--primary" disabled>
                        {getAcessoLabel(p)}
                      </button>
                    )}
                  </div>
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
