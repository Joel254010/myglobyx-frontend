import React from "react";
import api from "../../lib/api";

type UserRow = {
  name: string;
  email: string;
  phone?: string;
  isVerified?: boolean;
  createdAt?: string | Date;
};

type ListResp = {
  total?: number;
  page?: number;
  limit?: number;
  users: UserRow[];
};

const ADMIN_TOKEN_KEY = "myglobyx_admin_token";

function maskPhone(v?: string) {
  if (!v) return "—";
  const d = v.replace(/\D/g, "");
  if (d.length < 10) return v;
  const ddd = d.slice(0, 2);
  const meio = d.length === 11 ? d.slice(2, 7) : d.slice(2, 6);
  const fim = "**" + (d.length >= 2 ? d.slice(-2) : "");
  return `(${ddd}) ${meio}-${fim}`;
}

function fmtDate(d?: string | Date) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminUsers() {
  // criação provisória (mantido)
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");

  // listagem
  const [data, setData] = React.useState<ListResp | null>(null);
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(25);
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  const token = React.useMemo(
    () => localStorage.getItem(ADMIN_TOKEN_KEY) || "",
    []
  );

  const total = data?.total ?? data?.users?.length ?? 0;
  const totalPages =
    data?.limit && data?.total
      ? Math.max(1, Math.ceil((data.total as number) / (data.limit as number)))
      : Math.max(1, Math.ceil(total / limit));
  const isFirstPage = page <= 1;
  const isLastPage = page >= totalPages;

  async function loadUsers(p = page) {
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.get<ListResp>("/api/admin/users", {
        params: { page: p, limit },
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
      setPage(res.data.page || p);
    } catch (e: any) {
      setMsg(e?.response?.data?.error || e?.message || "Falha ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!name || !email || pass.length < 6) {
      setMsg("Preencha nome, e-mail e senha (min. 6).");
      return;
    }
    try {
      await api.post("/auth/signup", { name, email, password: pass });
      setMsg("Usuário criado. Enviamos e-mail de confirmação (ou log no console, em dev).");
      setName("");
      setEmail("");
      setPass("");
      loadUsers(1);
    } catch (e: any) {
      setMsg(e?.response?.data?.error || e?.message || "Erro ao criar usuário.");
    }
  }

  return (
    <div>
      <h1>Usuários</h1>

      {msg && (
        <div className="alert alert--ok" style={{ marginBottom: 12 }}>
          {msg}
        </div>
      )}

      {/* Criar novo (provisório) */}
      <form onSubmit={onCreate} className="card" style={{ padding: 12, marginBottom: 16 }}>
        <h3>Novo usuário (provisório)</h3>
        <div className="form-grid">
          <div className="field field--full">
            <label>Nome</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>E-mail</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Senha</label>
            <input
              className="input"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
        </div>
        <div className="actions">
          <button className="btn btn--primary" disabled={loading}>
            {loading ? "Criando…" : "Criar"}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => loadUsers(page)}
            disabled={loading}
            style={{ marginLeft: 8 }}
          >
            {loading ? "Atualizando…" : "Atualizar lista"}
          </button>
        </div>
      </form>

      {/* Lista de usuários */}
      <div className="card" style={{ padding: 12 }}>
        <div className="row-between" style={{ marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Lista</h3>
          <small className="muted">
            Total: {total} • Página {page}/{totalPages}
          </small>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "28%" }}>Nome</th>
                <th style={{ width: "30%" }}>E-mail</th>
                <th style={{ width: "18%" }}>Telefone</th>
                <th style={{ width: "12%" }}>Status</th>
                <th style={{ width: "12%" }}>Criado</th>
              </tr>
            </thead>
            <tbody>
              {data?.users?.length ? (
                data.users.map((u) => (
                  <tr key={u.email}>
                    <td>{u.name || "—"}</td>
                    <td>{u.email}</td>
                    <td>{maskPhone(u.phone)}</td>
                    <td>
                      {u.isVerified ? (
                        <span className="badge badge--ok">Verificado</span>
                      ) : (
                        <span className="badge badge--warn">Não verificado</span>
                      )}
                    </td>
                    <td>{fmtDate(u.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="muted" style={{ textAlign: "center", padding: 16 }}>
                    {loading ? "Carregando…" : "Nenhum usuário encontrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="row-between" style={{ marginTop: 12 }}>
          <button
            className="btn"
            disabled={loading || isFirstPage}
            onClick={() => loadUsers(page - 1)}
          >
            ◀ Anterior
          </button>
          <div className="muted">
            Página <strong>{page}</strong> de <strong>{totalPages}</strong>
          </div>
          <button
            className="btn"
            disabled={loading || isLastPage}
            onClick={() => loadUsers(page + 1)}
          >
            Próxima ▶
          </button>
        </div>
      </div>
    </div>
  );
}
