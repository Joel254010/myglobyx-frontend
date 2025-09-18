// src/pages/ComoFunciona.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function ComoFunciona() {
  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="container header__inner">
          <div className="brand">
            <Link to="/" aria-label="Voltar para Home">
              <img
                src="/logo-mx.png"
                alt="MyGlobyX"
                className="brand__logo-img"
                style={{ height: "40px", width: "auto" }}
              />
            </Link>
          </div>
          <nav className="nav">
            <Link className="btn btn--ghost" to="/">
              Início
            </Link>
            <Link className="btn btn--ghost" to="/login">
              Entrar
            </Link>
            <Link className="btn btn--primary" to="/criar-conta">
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="how-hero">
        <div className="container how-hero__content">
          <div>
            <h1>Como a MyGlobyX funciona</h1>
            <p>
              Simples, rápido e seguro: você cria sua conta, escolhe um produto
              digital, paga via <b>Appmax</b> e acessa <b>na hora</b> dentro da
              nossa área de membros.
            </p>
            <div className="hero__actions">
              <Link className="btn btn--primary btn--lg" to="/criar-conta">
                Criar conta grátis
              </Link>
              <Link className="btn btn--outline btn--lg" to="/login">
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4 passos */}
      <section className="steps">
        <div className="container">
          <h2>4 passos para entrar</h2>
          <div className="steps__grid">
            <div className="step">
              <div className="step__num">1</div>
              <h3>Crie sua conta</h3>
              <p>Com seu e-mail e senha. Leva menos de 1 minuto.</p>
            </div>
            <div className="step">
              <div className="step__num">2</div>
              <h3>Escolha o produto</h3>
              <p>Catálogo privado com e-books, cursos e conteúdos premium.</p>
            </div>
            <div className="step">
              <div className="step__num">3</div>
              <h3>Pague com Appmax</h3>
              <p>Pix, cartão ou boleto no checkout seguro da Appmax.</p>
            </div>
            <div className="step">
              <div className="step__num">4</div>
              <h3>Acesse na hora</h3>
              <p>Liberação automática na sua biblioteca MyGlobyX.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline do clique ao acesso */}
      <section className="timeline">
        <div className="container">
          <h2>Do clique ao acesso: o que acontece</h2>
          <ol className="timeline__list">
            <li>
              <span className="bubble">🔐</span>
              <div>
                <strong>Conta criada</strong>
                <p>Você entra na área privada e vê todo o catálogo.</p>
              </div>
            </li>
            <li>
              <span className="bubble">🛒</span>
              <div>
                <strong>Escolha do produto</strong>
                <p>Detalhes, benefícios e botão “Comprar”.</p>
              </div>
            </li>
            <li>
              <span className="bubble">💳</span>
              <div>
                <strong>Checkout Appmax</strong>
                <p>Pagamento 100% seguro (Pix, cartão, boleto).</p>
              </div>
            </li>
            <li>
              <span className="bubble">📬</span>
              <div>
                <strong>Confirmação da Appmax</strong>
                <p>A Appmax confirma a compra e nos envia um aviso (webhook).</p>
              </div>
            </li>
            <li>
              <span className="bubble">✅</span>
              <div>
                <strong>Liberação automática</strong>
                <p>Seu acesso é liberado automaticamente na biblioteca.</p>
              </div>
            </li>
            <li>
              <span className="bubble">⚡</span>
              <div>
                <strong>Acesso imediato 24/7</strong>
                <p>
                  Baixe e-books, assista aulas e entre nos conteúdos premium.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Cartõezinhos de confiança */}
      <section className="trust-cards">
        <div className="container trust-cards__grid">
          <article className="trust-card">
            <h3>Pagamento via Appmax</h3>
            <p>
              Operadora reconhecida no Brasil. Segurança, velocidade e múltiplos
              meios de pagamento.
            </p>
          </article>
          <article className="trust-card">
            <h3>Segurança & Privacidade</h3>
            <p>
              Seus dados ficam protegidos e seu conteúdo liberado apenas para a
              sua conta.
            </p>
          </article>
          <article className="trust-card">
            <h3>Garantia de 7 dias</h3>
            <p>
              Não era o que esperava? Solicite reembolso em até 7 dias. Simples
              assim.
            </p>
          </article>
          <article className="trust-card">
            <h3>Suporte humano</h3>
            <p>
              Estamos por perto para ajudar você a aproveitar o máximo da sua
              compra.
            </p>
          </article>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <div className="container">
          <h2>Perguntas frequentes</h2>
          <details>
            <summary>Quando recebo o acesso?</summary>
            <p>
              No mesmo minuto em que a Appmax aprova o pagamento, sua biblioteca
              é liberada.
            </p>
          </details>
          <details>
            <summary>Posso pagar por Pix?</summary>
            <p>
              Sim. No checkout Appmax você escolhe Pix, cartão de crédito ou
              boleto.
            </p>
          </details>
          <details>
            <summary>Por onde acesso meus cursos?</summary>
            <p>
              Pelo menu “Meus produtos” dentro da MyGlobyX, após fazer login.
            </p>
          </details>
          <details>
            <summary>E se eu tiver problemas com o acesso?</summary>
            <p>
              Fale com nosso suporte que resolvemos rapidamente para você.
            </p>
          </details>
        </div>
      </section>

      {/* CTA final */}
      <section className="cta">
        <div className="container cta__box">
          <h3>Pronto para começar?</h3>
          <p>
            Crie sua conta gratuita e veja o catálogo privado da MyGlobyX por
            dentro.
          </p>
          <div className="hero__actions">
            <Link className="btn btn--primary btn--lg" to="/criar-conta">
              Criar conta grátis
            </Link>
            <Link className="btn btn--outline btn--lg" to="/login">
              Já tenho conta
            </Link>
          </div>
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
