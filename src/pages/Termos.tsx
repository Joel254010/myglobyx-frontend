import React from "react";
import { Link } from "react-router-dom";

export default function Termos() {
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
          <h1>Termos de Uso</h1>
          <p className="muted">Última atualização: {lastUpdated}</p>

          <h3>1. Objeto</h3>
          <p>
            A MyGlobyX oferece acesso a produtos digitais próprios (e-books,
            cursos e conteúdos premium).
          </p>

          <h3>2. Conta e acesso</h3>
          <ul>
            <li>Você é responsável por manter a confidencialidade das suas credenciais.</li>
            <li>O acesso é pessoal e intransferível.</li>
          </ul>

          <h3>3. Pagamentos</h3>
          <p>
            Os pagamentos são processados via Appmax. A liberação ocorre após a
            confirmação do pagamento.
          </p>

          <h3>4. Reembolsos</h3>
          <p>
            Oferecemos garantia de 7 dias, salvo produtos que indiquem política
            diferente na página de compra.
          </p>

          <h3>5. Propriedade intelectual</h3>
          <p>
            É proibida a reprodução, distribuição ou revenda do conteúdo sem
            autorização.
          </p>

          <h3>6. Suporte</h3>
          <p>
            Fale conosco pelo e-mail{" "}
            <a className="link" href="mailto:suporte@myglobyx.com">
              suporte@myglobyx.com
            </a>.
          </p>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer__inner">
          <small>© {new Date().getFullYear()} MyGlobyX. Todos os direitos reservados.</small>
          <div className="footer__links">
            <Link to="/privacidade">Privacidade</Link>
            <Link to="/suporte">Suporte</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
