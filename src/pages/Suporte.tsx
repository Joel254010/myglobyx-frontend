import React from "react";
import { Link } from "react-router-dom";

export default function Suporte() {
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

      <section className="how-hero">
        <div className="container how-hero__content">
          <h1>Suporte</h1>
          <p>Precisa de ajuda com acesso, pagamento ou conteúdo? Veja as respostas abaixo ou fale conosco.</p>
        </div>
      </section>

      <section className="faq">
        <div className="container">
          <h2>Perguntas frequentes</h2>
          <details>
            <summary>Quando meu acesso é liberado?</summary>
            <p>Assim que a Appmax confirma o pagamento, liberamos seu produto automaticamente.</p>
          </details>
          <details>
            <summary>Onde encontro meus produtos?</summary>
            <p>Na página <Link className="link" to="/app/meus-produtos">Meus Produtos</Link> após fazer login.</p>
          </details>
          <details>
            <summary>Posso pagar por Pix?</summary>
            <p>Sim. No checkout Appmax você escolhe Pix, cartão de crédito ou boleto.</p>
          </details>
          <details>
            <summary>Como falar com o suporte?</summary>
            <p>Envie um e-mail para <a className="link" href="mailto:suporte@myglobyx.com">suporte@myglobyx.com</a>.</p>
          </details>
        </div>
      </section>

      <section className="cta">
        <div className="container cta__box">
          <h3>Não encontrou o que precisa?</h3>
          <p>Fale com a equipe e resolvemos com você.</p>
          <div className="hero__actions">
            <a className="btn btn--primary btn--lg" href="mailto:suporte@myglobyx.com">Enviar e-mail</a>
            <Link className="btn btn--outline btn--lg" to="/app">Voltar ao Mundo Digital</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer__inner">
          <small>© {new Date().getFullYear()} MyGlobyX. Todos os direitos reservados.</small>
          <div className="footer__links">
            <Link to="/termos">Termos</Link>
            <Link to="/privacidade">Privacidade</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
