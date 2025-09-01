import React from "react";
import { Link } from "react-router-dom";

export default function Privacidade() {
  const lastUpdated = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="page">
      <header className="header">
        <div className="container header__inner">
          <Link className="brand__logo" to="/">MYGLOBYX</Link>
          <nav className="nav">
            <Link className="link" to="/app">Mundo Digital</Link>
            <Link className="link" to="/app/meus-produtos">Meus Produtos</Link>
          </nav>
        </div>
      </header>

      <section className="app">
        <div className="container">
          <h1>Política de Privacidade</h1>
          <p className="muted">Última atualização: {lastUpdated}</p>

          <h3>Dados coletados</h3>
          <ul>
            <li>Cadastro: nome e e-mail.</li>
            <li>Transações: dados de pagamento processados pela Appmax.</li>
            <li>Uso: dados técnicos para melhorar a experiência.</li>
          </ul>

          <h3>Como usamos</h3>
          <p>Para identificar sua conta, liberar produtos e comunicar novidades relevantes.</p>

          <h3>Compartilhamento</h3>
          <p>Compartilhamos dados somente com provedores essenciais (como Appmax) para fins de operação.</p>

          <h3>Seus direitos</h3>
          <p>Você pode solicitar atualização ou exclusão dos dados conforme a legislação aplicável.</p>

          <h3>Contato</h3>
          <p>
            Dúvidas?{" "}
            <a className="link" href="mailto:suporte@myglobyx.com">
              suporte@myglobyx.com
            </a>
          </p>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer__inner">
          <small>© {new Date().getFullYear()} MyGlobyX. Todos os direitos reservados.</small>
          <div className="footer__links">
            <Link to="/termos">Termos</Link>
            <Link to="/suporte">Suporte</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
