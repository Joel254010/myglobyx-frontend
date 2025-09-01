import React from "react";
import { Link, useNavigate } from "react-router-dom";

const TOKEN_KEYS = ["myglobyx_token", "myglobyx:token"];

function logoutLocal() {
  TOKEN_KEYS.forEach((k) => localStorage.removeItem(k));
  // Se quiser limpar também outros dados de sessão, faça aqui.
}

export default function MundoDigital() {
  const navigate = useNavigate();

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
            <Link className="link" to="/app/meus-produtos">Meus Produtos</Link>
            <Link className="link" to="/suporte">Suporte</Link>
            <button className="btn btn--outline" onClick={handleLogout}>Sair</button>
          </nav>
        </div>
      </header>

      {/* Hero interno */}
      <section className="how-hero">
        <div className="container how-hero__content">
          <h1>Conheça o Mundo Digital da MyGlobyX</h1>
          <p>
            Bem-vindo! Aqui você encontra trilhas, conteúdos de introdução e
            destaques para começar do jeito certo. Seus produtos comprados
            ficam em <b>Meus Produtos</b>.
          </p>
          <div className="hero__actions">
            <Link className="btn btn--primary btn--lg" to="/app/meus-produtos">
              Ver Meus Produtos
            </Link>
            <Link className="btn btn--outline btn--lg" to="/como-funciona">
              Como funciona
            </Link>
          </div>
        </div>
      </section>

      {/* Primeiros passos */}
      <section className="steps">
        <div className="container">
          <h2>Primeiros passos</h2>
          <div className="steps__grid">
            <div className="step">
              <div className="step__num">1</div>
              <h3>Entenda a plataforma</h3>
              <p>Leia o guia "Como funciona" e veja onde acessar seus produtos.</p>
              <Link className="btn btn--ghost" to="/como-funciona">Abrir guia</Link>
            </div>
            <div className="step">
              <div className="step__num">2</div>
              <h3>Explore destaques</h3>
              <p>Veja novidades e conteúdos recomendados para você.</p>
              <a className="btn btn--ghost" href="#destaques">Ver destaques</a>
            </div>
            <div className="step">
              <div className="step__num">3</div>
              <h3>Compre e acesse</h3>
              <p>Pague via Appmax e tenha acesso liberado automaticamente.</p>
              <Link className="btn btn--ghost" to="/app/meus-produtos">Ir para Meus Produtos</Link>
            </div>
            <div className="step">
              <div className="step__num">4</div>
              <h3>Precisa de ajuda?</h3>
              <p>Conte com nosso suporte humano para qualquer dúvida.</p>
              <Link className="btn btn--ghost" to="/suporte">Falar com suporte</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Destaques */}
      <section id="destaques" className="app">
        <div className="container">
          <h2>Destaques</h2>
          <div className="grid" style={{ marginTop: 12 }}>
            <article className="card">
              <span className="tag">E-book</span>
              <h3>Guia Black: primeiros passos</h3>
              <p>Um e-book introdutório com estratégias práticas para começar.</p>
              <button className="btn btn--primary">Saiba mais</button>
            </article>
            <article className="card">
              <span className="tag">Curso</span>
              <h3>Venda Digital Express</h3>
              <p>Mini-curso de 10 minutos para você destravar resultados.</p>
              <button className="btn btn--primary">Saiba mais</button>
            </article>
            <article className="card">
              <span className="tag">Premium</span>
              <h3>Conteúdos Black</h3>
              <p>Materiais exclusivos e atualizados com frequência.</p>
              <button className="btn btn--primary">Saiba mais</button>
            </article>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="container cta__box">
          <h3>Quando você comprar, o acesso é imediato</h3>
          <p>Pagamentos via Appmax. Seus produtos aparecem automaticamente em "Meus Produtos".</p>
          <div className="hero__actions">
            <Link className="btn btn--primary btn--lg" to="/app/meus-produtos">
              Ir para Meus Produtos
            </Link>
            <Link className="btn btn--outline btn--lg" to="/suporte">
              Suporte
            </Link>
          </div>
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
