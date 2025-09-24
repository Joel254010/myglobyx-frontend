// src/pages/admin/AdminProducts.tsx
import React from "react";
import {
  AdminProduct,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../lib/adminApi"; // ⚡ corrigido para adminApi

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

const tiposProduto: { value: "ebook" | "curso" | "servico"; label: string }[] = [
  { value: "ebook", label: "E-book" },
  { value: "curso", label: "Curso (YouTube)" },
  { value: "servico", label: "Serviço" },
];

export default function AdminProducts() {
  const [items, setItems] = React.useState<AdminProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [expandedMap, setExpandedMap] = React.useState<Record<string, boolean>>({});
  const [aulas, setAulas] = React.useState<{ titulo: string; capa?: string; link: string }[]>([]);

  const [form, setForm] = React.useState<
    Partial<AdminProduct & { instrucoes?: string; tipo: "ebook" | "curso" | "servico"; checkoutUrl?: string }>
  >({
    title: "",
    description: "",
    mediaUrl: "",
    thumbnail: "",
    categoria: "",
    subcategoria: "",
    tipo: "ebook",
    price: undefined,
    active: true,
    landingPageUrl: "",
    checkoutUrl: "",   // ✅ novo campo
    instrucoes: "",
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.title?.trim()) {
      setMsg("Informe o título");
      return;
    }
    if (form.tipo === "ebook" && !form.mediaUrl?.trim()) {
      setMsg("Informe a URL do conteúdo para E-book");
      return;
    }
    if (form.tipo === "curso" && aulas.length === 0) {
      setMsg("Adicione ao menos uma aula para o curso");
      return;
    }

    const payload = {
      ...form,
      price: form.price ? Number(form.price) : undefined,
      aulas,
    } as AdminProduct & { aulas?: typeof aulas; instrucoes?: string; tipo: "ebook" | "curso" | "servico"; checkoutUrl?: string };

    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        setMsg("✅ Produto atualizado com sucesso.");
      } else {
        await createProduct(payload);
        setMsg("✅ Produto criado com sucesso.");
      }

      setForm({
        title: "",
        description: "",
        mediaUrl: "",
        thumbnail: "",
        categoria: "",
        subcategoria: "",
        tipo: "ebook",
        price: undefined,
        active: true,
        landingPageUrl: "",
        checkoutUrl: "",   // reset
        instrucoes: "",
      });
      setAulas([]);
      setEditingId(null);
      await refresh();
    } catch (e: any) {
      setMsg(e?.message || "Erro ao salvar produto");
    }
  }

  function addAula() {
    setAulas([...aulas, { titulo: "", capa: "", link: "" }]);
  }

  function updateAula(index: number, campo: string, valor: string) {
    const novas = [...aulas];
    novas[index][campo as "titulo" | "capa" | "link"] = valor;
    setAulas(novas);
  }

  function removeAula(index: number) {
    const novas = aulas.filter((_, i) => i !== index);
    setAulas(novas);
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

  const toggleDescription = (id: string) => {
    setExpandedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="admin-produtos fundo-feed">
      <h1 className="titulo-admin">Gerenciar Produtos</h1>

      {msg && <div className="alert alert--ok" style={{ marginBottom: 12 }}>{msg}</div>}

      <form onSubmit={onSubmit} className="card" style={{ padding: 20, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 12 }}>
          {editingId ? "Editar produto" : "Novo produto"}
        </h3>

        <div className="form-grid">
          {/* Título */}
          <div className="field field--full">
            <label>Título</label>
            <input
              className="input"
              value={form.title || ""}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* Descrição */}
          <div className="field field--full">
            <label>Descrição</label>
            <textarea
              className="input"
              rows={3}
              value={form.description || ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Ebook */}
          {form.tipo === "ebook" && (
            <div className="field field--full">
              <label>URL do conteúdo</label>
              <input
                className="input"
                value={form.mediaUrl || ""}
                onChange={(e) => setForm((f) => ({ ...f, mediaUrl: e.target.value }))}
              />
            </div>
          )}

          {/* Curso */}
          {form.tipo === "curso" && (
            <div className="field field--full">
              <label>Aulas do Curso</label>
              {aulas.map((aula, i) => (
                <div key={i} style={{ marginBottom: 12, padding: 10, border: "1px solid #ccc", borderRadius: 8 }}>
                  <input
                    className="input"
                    placeholder="Título da Aula"
                    value={aula.titulo}
                    onChange={(e) => updateAula(i, "titulo", e.target.value)}
                    style={{ marginBottom: 6 }}
                  />
                  <input
                    className="input"
                    placeholder="Capa (URL imagem)"
                    value={aula.capa}
                    onChange={(e) => updateAula(i, "capa", e.target.value)}
                    style={{ marginBottom: 6 }}
                  />
                  <input
                    className="input"
                    placeholder="Link YouTube"
                    value={aula.link}
                    onChange={(e) => updateAula(i, "link", e.target.value)}
                    style={{ marginBottom: 6 }}
                  />
                  <button type="button" className="btn btn--outline" onClick={() => removeAula(i)}>
                    Remover
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn--ghost" onClick={addAula}>
                + Adicionar Aula
              </button>
            </div>
          )}

          {/* Serviço */}
          {form.tipo === "servico" && (
            <div className="field field--full">
              <label>Instruções sobre o serviço</label>
              <textarea
                className="input"
                rows={3}
                value={form.instrucoes || ""}
                onChange={(e) => setForm((f) => ({ ...f, instrucoes: e.target.value }))}
              />
            </div>
          )}

          {/* Thumbnail */}
          <div className="field field--full">
            <label>Thumbnail</label>
            <input
              className="input"
              value={form.thumbnail || ""}
              onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
            />
            {form.thumbnail && (
              <img src={form.thumbnail} alt="Prévia" style={{ maxWidth: 200, marginTop: 8 }} />
            )}
          </div>

          {/* Landing Page */}
          <div className="field field--full">
            <label>Landing Page</label>
            <input
              className="input"
              value={form.landingPageUrl || ""}
              onChange={(e) => setForm((f) => ({ ...f, landingPageUrl: e.target.value }))}
            />
          </div>

          {/* Checkout Appmax */}
          <div className="field field--full">
            <label>Link de Checkout (Appmax)</label>
            <input
              className="input"
              value={form.checkoutUrl || ""}
              onChange={(e) => setForm((f) => ({ ...f, checkoutUrl: e.target.value }))}
            />
          </div>

          {/* Categoria */}
          <div className="field">
            <label>Categoria</label>
            <select
              className="input"
              value={form.categoria || ""}
              onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value, subcategoria: "" }))}
            >
              <option value="">Selecione</option>
              {Object.keys(categorias).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategoria */}
          <div className="field">
            <label>Subcategoria</label>
            <select
              className="input"
              value={form.subcategoria || ""}
              onChange={(e) => setForm((f) => ({ ...f, subcategoria: e.target.value }))}
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

          {/* Tipo */}
          <div className="field">
            <label>Tipo de Produto</label>
            <select
              className="input"
              value={form.tipo || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  tipo: e.target.value as "ebook" | "curso" | "servico",
                }))
              }
            >
              <option value="">Selecione</option>
              {tiposProduto.map((tp) => (
                <option key={tp.value} value={tp.value}>
                  {tp.label}
                </option>
              ))}
            </select>
          </div>

          {/* Preço */}
          <div className="field">
            <label>Preço</label>
            <input
              className="input"
              type="number"
              step="0.01"
              value={(form.price as any) || ""}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value as any }))}
            />
          </div>

          {/* Status */}
          <div className="field">
            <label>Status</label>
            <select
              className="input"
              value={form.active ? "1" : "0"}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.value === "1" }))}
            >
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </select>
          </div>
        </div>

        <div className="actions" style={{ marginTop: 16 }}>
          <button className="btn btn--primary">
            {editingId ? "Salvar Alterações" : "Criar"}
          </button>
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
            items.map((p) => {
              const isExpanded = expandedMap[p.id];
              const desc = String(p.description || "");
              const showToggle = desc.length > 120;
              const shortDesc = desc.slice(0, 120);
              return (
                <div key={p.id} className="card card-produto">
                  {p.thumbnail && <img src={p.thumbnail} className="thumb-produto" alt={p.title} />}
                  <div className="conteudo-produto">
                    <h4>{p.title}</h4>
                    <p className="muted small">
                      {p.tipo ? `📦 ${p.tipo.toUpperCase()} — ` : ""}
                      {p.categoria} {p.subcategoria && `> ${p.subcategoria}`}
                    </p>
                    {p.price && <p>💰 <b>R$ {p.price.toFixed(2)}</b></p>}
                    <p className="muted small">
                      {isExpanded ? desc : shortDesc}
                      {showToggle && (
                        <button className="btn btn--link btn--sm" onClick={() => toggleDescription(p.id)}>
                          {isExpanded ? "Ver menos" : "Ver mais"}
                        </button>
                      )}
                    </p>
                    {p.landingPageUrl && (
                      <p>🌐 <a href={p.landingPageUrl} target="_blank" rel="noreferrer">Landing Page</a></p>
                    )}
                    {p.checkoutUrl && (
                      <p>🛒 <a href={p.checkoutUrl} target="_blank" rel="noreferrer">Checkout</a></p>
                    )}
                    <span className={`badge ${p.active ? "badge--ok" : "badge--warn"}`}>
                      {p.active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <div className="acoes-produto">
                    <button
                      className="btn btn--ghost"
                      onClick={() => {
                        setForm({
                          ...(p as AdminProduct),
                          instrucoes: (p as any).instrucoes || "",
                          tipo: (p as any).tipo as "ebook" | "curso" | "servico",
                          checkoutUrl: (p as any).checkoutUrl || "",
                        });
                        setAulas((p as any).aulas || []);
                        setEditingId(p.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Editar
                    </button>
                    <button className="btn btn--outline" onClick={() => remove(p.id)}>
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
