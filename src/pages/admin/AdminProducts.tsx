import React from "react";
import {
  AdminProduct,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../lib/adminApi";

// Categorias e subcategorias pré-definidas
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

export default function AdminProducts() {
  const [items, setItems] = React.useState<AdminProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [msg, setMsg] = React.useState<string | null>(null);

  const [form, setForm] = React.useState<Partial<AdminProduct> & {
    categoria?: string;
    subcategoria?: string;
    landingPageUrl?: string;
  }>({
    title: "",
    description: "",
    mediaUrl: "",
    thumbnail: "",
    categoria: "",
    subcategoria: "",
    price: undefined,
    active: true,
    landingPageUrl: "",
  });

  async function refresh() {
    setLoading(true);
    try {
      const data = await listProducts();
      setItems(data);
    } catch (e: any) {
      setMsg(e?.message || "Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    refresh();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.title?.trim()) {
      setMsg("Informe o título");
      return;
    }
    try {
      await createProduct({
        title: form.title,
        description: form.description,
        mediaUrl: form.mediaUrl,
        thumbnail: form.thumbnail,
        categoria: form.categoria,
        subcategoria: form.subcategoria,
        landingPageUrl: form.landingPageUrl,
        price: form.price ? Number(form.price) : undefined,
        active: !!form.active,
      } as any);

      setForm({
        title: "",
        description: "",
        mediaUrl: "",
        thumbnail: "",
        categoria: "",
        subcategoria: "",
        price: undefined,
        active: true,
        landingPageUrl: "",
      });
      await refresh();
      setMsg("✅ Produto criado com sucesso.");
    } catch (e: any) {
      setMsg(e?.message || "Erro ao criar produto");
    }
  }

  async function toggleActive(p: AdminProduct) {
    try {
      await updateProduct(p.id, { active: !p.active });
      await refresh();
    } catch (e: any) {
      setMsg(e?.message || "Erro ao atualizar");
    }
  }

  async function remove(id: string) {
    if (!confirm("Remover este produto?")) return;
    try {
      await deleteProduct(id);
      await refresh();
    } catch (e: any) {
      setMsg(e?.message || "Erro ao deletar");
    }
  }

  return (
    <div className="admin-produtos fundo-feed">
      <h1 className="titulo-admin">Gerenciar Produtos</h1>

      {msg && (
        <div className="alert alert--ok" style={{ marginBottom: 12 }}>
          {msg}
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={onCreate} className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 12 }}>Novo produto</h3>
        <div className="form-grid">
          <div className="field field--full">
            <label>Título</label>
            <input
              className="input"
              value={form.title || ""}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="field field--full">
            <label>Descrição</label>
            <textarea
              className="input"
              rows={3}
              value={form.description || ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="field field--full">
            <label>URL do conteúdo (vídeo/pdf/link)</label>
            <input
              className="input"
              value={form.mediaUrl || ""}
              onChange={(e) => setForm((f) => ({ ...f, mediaUrl: e.target.value }))}
            />
          </div>

          <div className="field field--full">
            <label>URL da Thumbnail (imagem de capa)</label>
            <input
              className="input"
              value={form.thumbnail || ""}
              onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
              placeholder="https://..."
            />
            {form.thumbnail && (
              <img
                src={form.thumbnail}
                alt="Prévia da thumbnail"
                style={{
                  marginTop: 8,
                  maxWidth: 200,
                  borderRadius: 8,
                  boxShadow: "0 0 4px rgba(0,0,0,0.3)",
                }}
              />
            )}
          </div>

          <div className="field field--full">
            <label>URL da Landing Page (botão "Saiba mais")</label>
            <input
              className="input"
              value={form.landingPageUrl || ""}
              onChange={(e) => setForm((f) => ({ ...f, landingPageUrl: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="field">
            <label>Categoria</label>
            <select
              className="input"
              value={form.categoria || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  categoria: e.target.value,
                  subcategoria: "",
                }))
              }
            >
              <option value="">Selecione</option>
              {Object.keys(categorias).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Subcategoria</label>
            <select
              className="input"
              value={form.subcategoria || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, subcategoria: e.target.value }))
              }
              disabled={!form.categoria}
            >
              <option value="">Selecione</option>
              {form.categoria &&
                categorias[form.categoria]?.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
            </select>
          </div>

          <div className="field">
            <label>Preço (opcional)</label>
            <input
              className="input"
              type="number"
              step="0.01"
              value={form.price as any || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value as any }))
              }
            />
          </div>

          <div className="field">
            <label>Status</label>
            <select
              className="input"
              value={form.active ? "1" : "0"}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.value === "1" }))
              }
            >
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </select>
          </div>
        </div>

        <div className="actions" style={{ marginTop: 16 }}>
          <button className="btn btn--primary">Criar</button>
        </div>
      </form>

      {/* Lista */}
      {loading ? (
        <div>Carregando…</div>
      ) : (
        <div className="grid-produtos">
          {items.length === 0 ? (
            <p className="muted">Nenhum produto cadastrado.</p>
          ) : (
            items.map((p) => (
              <div key={p.id} className="card card-produto">
                {p.thumbnail && (
                  <img
                    src={p.thumbnail}
                    alt={p.title}
                    className="thumb-produto"
                  />
                )}
                <div className="conteudo-produto">
                  <h4>{p.title}</h4>
                  {p.categoria && (
                    <p className="muted small">
                      {p.categoria} {p.subcategoria ? `> ${p.subcategoria}` : ""}
                    </p>
                  )}
                  {p.price && (
                    <p>
                      💰 <b>R$ {p.price.toFixed(2)}</b>
                    </p>
                  )}
                  <p className="muted small">{p.description}</p>
                  {p.landingPageUrl && (
                    <p>
                      🌐 <a href={p.landingPageUrl} target="_blank" rel="noreferrer">Landing Page</a>
                    </p>
                  )}
                  <span
                    className={`badge ${p.active ? "badge--ok" : "badge--warn"}`}
                  >
                    {p.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="acoes-produto">
                  <button
                    className="btn btn--ghost"
                    onClick={() => toggleActive(p)}
                  >
                    {p.active ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    className="btn btn--outline"
                    onClick={() => remove(p.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
