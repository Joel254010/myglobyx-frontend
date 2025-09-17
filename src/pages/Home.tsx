// src/pages/Home.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Depo = {
  name: string;
  role: string;
  text: string;
  avatar: string;
};

const depoimentos: Depo[] = [
  {
    name: "Carla Mendes",
    role: "Comprou: Guia Black 2025",
    text:
      "Recebi o acesso na hora! Em 2 dias já apliquei as estratégias do e-book e tive minhas primeiras vendas.",
    avatar:
      "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=256&auto=format&fit=crop",
  },
  {
    name: "Rafael Souza",
    role: "Aluno do Curso Venda Digital Pro",
    text:
      "Conteúdo direto ao ponto, sem enrolação. A plataforma é muito rápida e bem organizada.",
    avatar:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=256&auto=format&fit=crop",
  },
  {
    name: "Mariana Lopes",
    role: "Assinante Conteúdos Premium",
    text:
      "O suporte foi impecável. Valeu cada centavo! Já indiquei para dois amigos.",
    avatar:
      "https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?q=80&w=256&auto=format&fit=crop",
  },
];

export default function Home() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % depoimentos.length);
    }, 4200);
    return () => clearInterval(t);
  }, []);

  const d = depoimentos[idx];

  const handleAvatarError = (
    e: React.SyntheticEvent<HTMLImageElement>,
    name: string,
    size = 128
  ) => {
    const img = e.currentTarget;
    img.onerror = null;
    img.src = `https://i.pravatar.cc/${size}?u=${encodeURIComponent(name)}`;
  };

  return (
    <div className="page">
      {/* 🔥 Banner oficial no topo */}
      <section className="promo-banner">
        <div className="promo__inner">
          <h2>
            Somos todos MyGlobyX 🚀
            <Link to="/criar-conta" className="btn btn--promo-inline">
              Registre-se Já!
            </Link>
          </h2>
          <p className="promo__subtitle">
            A plataforma global dos nossos produtos digitais exclusivos — 
            E-books, cursos e serviços premium com acesso imediato em qualquer lugar do mundo.
          </p>
        </div>
      </section>

      {/* Header */}
      <header className="header">
        <div className="container header__inner">
          <div className="brand">
            <span className="brand__logo" aria-label="MyGlobyX">
              MYGLOBYX
            </span>
          </div>
          <nav className="nav">
            <Link className="link" to="/como-funciona">
              Como funciona
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
      <main>
        <section className="hero">
          <div className="container hero__grid">
            <div className="hero__content">
              <p className="eyebrow">UMA PLATAFORMA. POTENCIAL ILIMITADO.</p>
              <h1 className="hero__title">
                O hub dos seus{" "}
                <span className="grad">produtos digitais exclusivos</span>.
              </h1>
              <p className="hero__subtitle">
                E-books, cursos e conteúdos premium com{" "}
                <strong>acesso imediato</strong>. Pagamentos 100% seguros via{" "}
                <strong>Appmax</strong> e entrega dentro da <b>MyGlobyX</b>.
              </p>

              <div className="hero__actions">
                <Link className="btn btn--primary btn--lg" to="/criar-conta">
                  Criar conta grátis
                </Link>
                <Link className="btn btn--outline btn--lg" to="/login">
                  Já tenho conta
                </Link>
              </div>

              <ul className="trust">
                <li>⭐️ 4,9/5 por clientes reais</li>
                <li>⚡ Acesso imediato pós-pagamento</li>
                <li>🔒 Pagamentos via Appmax</li>
                <li>🎓 Área de membros própria</li>
              </ul>
            </div>

            <aside className="collage">
              <div className="collage__grid">
                <img
                  src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=600&auto=format&fit=crop"
                  alt="Pessoa sorrindo após comprar um curso"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleAvatarError(e, "Cliente feliz 1", 300)}
                />
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop"
                  alt="Cliente satisfeito celebrando"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleAvatarError(e, "Cliente feliz 2", 300)}
                />
                <img
                  src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&auto=format&fit=crop"
                  alt="Grupo feliz estudando online"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleAvatarError(e, "Cliente feliz 3", 300)}
                />
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop"
                  alt="Aluna feliz com e-book"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleAvatarError(e, "Cliente feliz 4", 300)}
                />
              </div>
              <div className="badge__stack">
                <span className="pill">Pagamento via Appmax</span>
                <span className="pill pill--ok">Satisfação garantida</span>
              </div>
            </aside>
          </div>
        </section>

        {/* Social proof */}
        <section className="socialproof">
          <div className="container socialproof__row">
            <div className="kpi">
              <strong>+12k</strong>
              <span>Downloads e acessos</span>
            </div>
            <div className="kpi">
              <strong>4,9/5</strong>
              <span>Avaliação média</span>
            </div>
            <div className="kpi">
              <strong>100%</strong>
              <span>Checkout seguro Appmax</span>
            </div>
            <div className="kpi">
              <strong>24/7</strong>
              <span>Acesso imediato</span>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section className="steps">
          <div className="container">
            <h2>Como funciona</h2>
            <div className="steps__grid">
              <div className="step">
                <div className="step__num">1</div>
                <h3>Crie sua conta</h3>
                <p>Leva menos de 1 minuto e é grátis.</p>
              </div>
              <div className="step">
                <div className="step__num">2</div>
                <h3>Escolha seu produto</h3>
                <p>E-books, cursos e conteúdos premium.</p>
              </div>
              <div className="step">
                <div className="step__num">3</div>
                <h3>Pague com Appmax</h3>
                <p>Pix, cartão ou boleto — 100% seguro.</p>
              </div>
              <div className="step">
                <div className="step__num">4</div>
                <h3>Acesse na hora</h3>
                <p>Área de membros MyGlobyX, sem espera.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="depos">
          <div className="container depos__wrap">
            <div className="depo">
              <img
                className="depo__avatar"
                src={d.avatar}
                alt={d.name}
                referrerPolicy="no-referrer"
                onError={(e) => handleAvatarError(e, d.name, 128)}
              />
              <div className="depo__body">
                <div className="stars" aria-label="Avaliação cinco estrelas">
                  ★★★★★
                </div>
                <p className="depo__text">“{d.text}”</p>
                <div className="depo__meta">
                  <strong>{d.name}</strong>
                  <span>{d.role}</span>
                </div>
              </div>
            </div>

            <ul className="depo__thumbs" aria-label="Outros depoimentos">
              {depoimentos.map((p, i) => (
                <li key={p.name}>
                  <button
                    className={`thumb ${i === idx ? "is-active" : ""}`}
                    onClick={() => setIdx(i)}
                    aria-label={`Ver depoimento de ${p.name}`}
                  >
                    <img
                      src={p.avatar}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => handleAvatarError(e, p.name, 80)}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Garantia */}
        <section className="guarantee">
          <div className="container guarantee__box">
            <div className="shield" aria-hidden>
              🛡️
            </div>
            <div>
              <h3>Garantia de 7 dias</h3>
              <p>
                Acreditamos nos nossos produtos. Se não for para você, peça
                reembolso em até 7 dias.
              </p>
            </div>
            <Link className="btn btn--primary" to="/criar-conta">
              Começar agora
            </Link>
          </div>
        </section>

        {/* CTA final */}
        <section className="cta">
          <div className="container cta__box">
            <h3>Entre agora e desbloqueie sua biblioteca digital</h3>
            <p>
              Inscrições abertas hoje. Garanta acesso imediato aos conteúdos da
              MyGlobyX.
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
      </main>

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
