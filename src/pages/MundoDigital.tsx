import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { listPublicProducts } from "../lib/api";

// 🔹 Tipagem exclusiva para produtos públicos
type PublicProduct = {
  id: string;
  title: string;
  description?: string;
  price?: number;
  thumbnail?: string;
  categoria?: string;
  subcategoria?: string;
  landingPageUrl?: string;
  checkoutUrl?: string; // ✅ link de checkout Appmax
  active: boolean;
};

const TOKEN_KEYS = ["myglobyx_token", "myglobyx:token"];

function logoutLocal() {
  TOKEN_KEYS.forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem("myglobyx_user_name");
}

function resolveUrl(raw: any): string | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withProto).href;
  } catch {
    return null;
  }
}

const resolveLandingUrl = (p: PublicProduct) => resolveUrl(p.landingPageUrl);
const resolveCheckoutUrl = (p: PublicProduct) => resolveUrl(p.checkoutUrl);

const categorias: Record<string, string[]> = {
  "Animais e Pets": ["Cães", "Gatos", "Outros Pets"],
  "Autoconhecimento e espiritualidade": ["Meditação", "Autoajuda", "Espiritualidade"],
  "Carreira e desenvolvimento pessoal": ["Produtividade", "Carreira", "Habilidades"],
  "Culinária e gastronomia": ["Receitas", "Doces", "Bebidas"],
  "Design e fotografia": ["Design Gráfico", "Fotografia", "Edição"],
  "Educação infantil e família": ["Educação Infantil", "Família", "Parentalidade"],
  "Engenharia e arquitetura": ["Engenharia Civil", "Arquitetura", "Urbanismo"],
  "Ensino e estudo acadêmico": ["Matemática", "Ciências", "Humanas"],
  "Finanças e negócios": ["Investimentos", "Gestão", "Empreendedorismo"],
  "Hobbies e Lazer": ["Artesanato", "Esportes", "Outros Hobbies"],
  "Manutenção de equipamentos": ["Informática", "Eletrônicos", "Automotivo"],
  "Marketing e vendas": ["Marketing Digital", "Vendas", "Publicidade"],
  "Moda e beleza": ["Beleza", "Moda", "Estilo de Vida"],
  "Música e artes": ["Instrumentos", "Teoria Musical", "Artes Visuais"],
  "Plantas e ecologia": ["Jardinagem", "Ecologia", "Sustentabilidade"],
  "Relacionamentos": ["Casais", "Amizades", "Comunicação"],
  "Saúde e esporte": ["Saúde", "Fitness", "Nutrição"],
  "Tecnologia e desenvolvimento de software": ["Programação", "IA", "DevOps"],
  "Sem categoria": ["Outros"],
};

export default function MundoDigital() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = React.useState<PublicProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState(
    localStorage.getItem("myglobyx_user_name") || "Usuário"
  );
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

  const [filtroCategoria, setFiltroCategoria] = React.useState("");
  const [filtroSubcategoria, setFiltroSubcategoria] = React.useState("");

  function handleLogout() {
    logoutLocal();
    navigate("/", { replace: true });
  }

  React.useEffect(() => {
    async function fetchProdutos() {
      try {
        const items = await listPublicProducts();
        setProdutos(items.filter((p) => p.active));
      } catch (e: any) {
        setMsg(e?.message || "Erro ao carregar produtos");
      } finally {
        setLoading(false);
      }
    }
    fetchProdutos();
  }, []);

  React.useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem("myglobyx_token");
        if (!token) return;
        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.name) {
            setUserName(data.name);
            localStorage.setItem("myglobyx_user_name", data.name);
          }
        }
      } catch (e) {
        console.error("Erro ao buscar perfil:", e);
      }
    }
    fetchProfile();
  }, []);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }

  const produtosFiltrados = produtos.filter((p) => {
    return (
      (!filtroCategoria || p.categoria === filtroCategoria) &&
      (!filtroSubcategoria || p.subcategoria === filtroSubcategoria)
    );
  });

  return (
    <div className="page">
      {/* Header */}
      <header className="header">
        <div className="container header__inner">
          <Link className="brand__logo" to="/" aria-label="MyGlobyX">
            <img src="/logo-mx.png" alt="MyGlobyX" style={{ height: "40px", width: "auto" }} />
          </Link>

          <div className="admin-dropdown">
            <button
              className="admin-dropdown-button"
              onClick={() => setMenuOpen((v) => !v)}
            >
              👋 Olá, {userName}
            </button>
            {menuOpen && (
              <div className="admin-dropdown-menu">
                <Link to="/app/meus-produtos">Meus Produtos</Link>
                <Link to="/app/meus-dados">Meus Dados</Link>
                <Link to="/suporte">Suporte</Link>
                <button onClick={handleLogout} className="btn btn--ghost">Sair</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      {/* ... conteúdo hero e steps igual ao seu ... */}

      <section id="destaques" className="app">
        <div className="container">
          <h2>Destaques</h2>

          {/* Filtros */}
          {/* ... filtros igual ao seu ... */}

          {msg && <div className="alert alert--err">{msg}</div>}
          {loading && <p>Carregando produtos...</p>}

          {!loading && produtosFiltrados.length === 0 && (
            <p className="muted">Nenhum produto encontrado para os filtros selecionados.</p>
          )}

          <div className="grid-produtos">
            {produtosFiltrados.map((p) => {
              const url = resolveLandingUrl(p);
              const checkout = resolveCheckoutUrl(p);
              return (
                <article key={p.id} className="card-produto">
                  {p.thumbnail && <img src={p.thumbnail} alt={p.title} className="thumb-produto" />}
                  <div className="conteudo-produto">
                    {p.categoria && (
                      <span className="tag-produto">
                        {p.categoria}{p.subcategoria ? ` · ${p.subcategoria}` : ""}
                      </span>
                    )}
                    <h3>{p.title}</h3>
                    {p.description && (
                      <>
                        <p className={expandedIds.has(p.id) ? "desc expandida" : "desc cortada"}>
                          {expandedIds.has(p.id)
                            ? p.description
                            : p.description.split(" ").slice(0, 20).join(" ") +
                              (p.description.split(" ").length > 20 ? "..." : "")}
                        </p>
                        <button className="ver-mais" onClick={() => toggleExpand(p.id)}>
                          {expandedIds.has(p.id) ? "Ver menos" : "Ver mais"}
                        </button>
                      </>
                    )}
                    {p.price !== undefined && (
                      <p className="preco-produto">R$ {p.price.toFixed(2)}</p>
                    )}
                  </div>
                  <div className="acoes-produto">
                    {url ? (
                      <a
                        className="btn btn--primary"
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Saiba mais
                      </a>
                    ) : (
                      <button className="btn btn--primary" disabled title="Sem link disponível">
                        Saiba mais
                      </button>
                    )}

                    {checkout ? (
                      <a
                        className="btn btn--outline"
                        href={checkout}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Comprar
                      </a>
                    ) : (
                      <button className="btn btn--outline" disabled title="Sem checkout disponível">
                        Comprar
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container cta__box">
          <h3>Quando você comprar, o acesso é imediato</h3>
          <p>Pagamentos via Appmax. Seus produtos aparecem automaticamente em "Meus Produtos".</p>
          <div className="hero__actions">
            <Link className="btn btn--primary btn--lg" to="/app/meus-produtos">Ir para Meus Produtos</Link>
            <Link className="btn btn--outline btn--lg" to="/suporte">Suporte</Link>
          </div>
        </div>
      </section>

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