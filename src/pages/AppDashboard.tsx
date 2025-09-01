// src/pages/AppDashboard.tsx
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../lib/auth";

export default function AppDashboard() {
  const navigate = useNavigate();
  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }
  return (
    <div className="page">
      <header className="header">
        <div className="container header__inner">
          <Link className="brand__logo" to="/">MYGLOBYX</Link>
          <nav className="nav">
            <Link className="link" to="/como-funciona">Como funciona</Link>
            <button className="btn btn--outline" onClick={handleLogout}>Sair</button>
          </nav>
        </div>
      </header>

      <section className="app">
        <div className="container">
          <div className="app__top">
            <div>
              <h1>Minha Biblioteca</h1>
              <p className="muted">Aqui ficam seus e-books, cursos e conteúdos premium liberados.</p>
            </div>
            <div className="app__stats">
              <div className="stat"><strong>0</strong><span>Produtos</span></div>
              <div className="stat"><strong>0</strong><span>Cursos</span></div>
              <div className="stat"><strong>0</strong><span>Premium</span></div>
            </div>
          </div>

          <div className="grid">
            <article className="card">
              <span className="tag">E-book</span>
              <h3>Guia Black 2025</h3>
              <p>Exemplo de item liberado após a compra via Appmax.</p>
              <button className="btn btn--primary" disabled>Baixar</button>
            </article>
            <article className="card">
              <span className="tag">Curso</span>
              <h3>Venda Digital Pro</h3>
              <p>As aulas aparecem aqui quando forem liberadas.</p>
              <button className="btn btn--primary" disabled>Assistir</button>
            </article>
            <article className="card">
              <span className="tag">Premium</span>
              <h3>Conteúdos Black</h3>
              <p>Acesso restrito. Liberado automaticamente via webhook.</p>
              <button className="btn btn--primary" disabled>Entrar</button>
            </article>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer__inner">
          <small>© {new Date().getFullYear()} MyGlobyX. Todos os direitos reservados.</small>
          <div className="footer__links">
            <a href="/termos">Termos</a>
            <a href="/privacidade">Privacidade</a>
            <a href="/suporte">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
