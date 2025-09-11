import React from "react";
import {
  listProducts,
  listGrants,
  grantAccess,
  revokeAccess,
  AdminProduct,
  Grant,
} from "../../lib/adminApi";

export default function AdminGrants() {
  const [products, setProducts] = React.useState<AdminProduct[]>([]);
  const [grants, setGrants] = React.useState<Grant[]>([]);
  const [email, setEmail] = React.useState("");
  const [productId, setProductId] = React.useState<string>("");
  const [msg, setMsg] = React.useState<string | null>(null);

  async function refresh(emailFilter?: string) {
    const [ps, gs] = await Promise.all([
      listProducts(),
      listGrants(emailFilter),
    ]);
    setProducts(ps);
    setGrants(gs);
  }

  React.useEffect(() => {
    refresh();
  }, []);

  async function onGrant(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!email || !productId) {
      setMsg("Informe e-mail e produto");
      return;
    }
    await grantAccess(email, productId);
    setMsg("Acesso concedido.");
    await refresh(email);
  }

  async function onRevoke(g: Grant) {
    if (!confirm("Revogar acesso?")) return;
    await revokeAccess(g.email, g.productId);
    setMsg("Acesso revogado.");
    await refresh(email || undefined);
  }

  return (
    <div className="page-liberacoes">
      <h1>Liberações</h1>

      {msg && <div className="alert alert--ok">{msg}</div>}

      <form onSubmit={onGrant} className="card">
        <h3>Conceder acesso</h3>
        <div className="form-grid">
          <div className="field">
            <label>E-mail do cliente</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Produto</label>
            <select
              className="input"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">Selecione…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="actions">
          <button className="btn btn--primary">Conceder</button>
        </div>
      </form>

      <div className="card">
        <h3>Liberações {email ? `de ${email}` : ""}</h3>
        <div className="row">
          <input
            className="input"
            placeholder="Filtrar por e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="btn btn--ghost"
            onClick={() => refresh(email || undefined)}
          >
            Aplicar filtro
          </button>
          <button
            className="btn btn--outline"
            onClick={() => {
              setEmail("");
              refresh();
            }}
          >
            Limpar
          </button>
        </div>

        {grants.length === 0 ? (
          <p className="muted">Nenhuma liberação.</p>
        ) : (
          <ul className="list">
            {grants.map((g) => {
              const prod = products.find((p) => p.id === g.productId);
              return (
                <li key={g.id} className="list__row">
                  <div>
                    <b>{prod?.title || g.productId}</b> · {g.email}
                    <div className="muted small">
                      {new Date(g.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    className="btn btn--outline"
                    onClick={() => onRevoke(g)}
                  >
                    Revogar
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
