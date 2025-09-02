import React from "react";
import { AdminProduct, listProducts, createProduct, updateProduct, deleteProduct } from "../../lib/adminApi";

export default function AdminProducts() {
  const [items, setItems] = React.useState<AdminProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState<Partial<AdminProduct>>({ title: "", description: "", mediaUrl: "", price: undefined, active: true });
  const [msg, setMsg] = React.useState<string | null>(null);

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

  React.useEffect(() => { refresh(); }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!form.title?.trim()) { setMsg("Informe o título"); return; }
    try {
      await createProduct({
        title: form.title,
        description: form.description,
        mediaUrl: form.mediaUrl,
        price: form.price ? Number(form.price) : undefined,
        active: !!form.active,
      });
      setForm({ title: "", description: "", mediaUrl: "", price: undefined, active: true });
      await refresh();
      setMsg("Produto criado.");
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
    <div>
      <h1>Produtos</h1>
      {msg && <div className="alert alert--ok" style={{ marginBottom: 12 }}>{msg}</div>}

      <form onSubmit={onCreate} className="card" style={{ padding: 12, marginBottom: 16 }}>
        <h3>Novo produto</h3>
        <div className="form-grid">
          <div className="field field--full">
            <label>Título</label>
            <input className="input" value={form.title || ""} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="field field--full">
            <label>Descrição</label>
            <input className="input" value={form.description || ""} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="field field--full">
            <label>URL do conteúdo (vídeo/pdf/link)</label>
            <input className="input" value={form.mediaUrl || ""} onChange={(e) => setForm(f => ({ ...f, mediaUrl: e.target.value }))} />
          </div>
          <div className="field">
            <label>Preço (opcional)</label>
            <input className="input" type="number" step="0.01" value={form.price as any || ""} onChange={(e) => setForm(f => ({ ...f, price: e.target.value as any }))} />
          </div>
          <div className="field">
            <label>Status</label>
            <select className="input" value={form.active ? "1" : "0"} onChange={(e) => setForm(f => ({ ...f, active: e.target.value === "1" }))}>
              <option value="1">Ativo</option>
              <option value="0">Inativo</option>
            </select>
          </div>
        </div>
        <div className="actions"><button className="btn btn--primary">Criar</button></div>
      </form>

      {loading ? (
        <div>Carregando…</div>
      ) : (
        <div className="card" style={{ padding: 12 }}>
          <h3>Lista</h3>
          {items.length === 0 ? (
            <p className="muted">Nenhum produto.</p>
          ) : (
            <ul className="list">
              {items.map(p => (
                <li key={p.id} className="list__row">
                  <div>
                    <b>{p.title}</b> {p.active ? "· ativo" : "· inativo"}
                    <div className="muted small">{p.mediaUrl}</div>
                  </div>
                  <div className="row">
                    <button className="btn btn--ghost" onClick={() => toggleActive(p)}>{p.active ? "Desativar" : "Ativar"}</button>
                    <button className="btn btn--outline" onClick={() => remove(p.id)}>Excluir</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
