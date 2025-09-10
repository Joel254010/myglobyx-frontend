// src/pages/admin/AdminUsers.tsx — atualizado com layout moderno e colunas claras
import React from "react";
import adminApi, { listAdminUsers } from "../../lib/adminApi";

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
  const [data, setData] = React.useState<ListResp | null>(null);
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(25);
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  const total = data?.total ?? data?.users?.length ?? 0;
  const totalPages =
    data?.limit && data?.total
      ? Math.max(1, Math.ceil((data.total as number) / (data.limit as number)))
      : Math.max(1, Math.ceil(total / limit));

  async function loadUsers(p = page) {
    setLoading(true);
    setMsg(null);
    try {
      const resp = await listAdminUsers(p, limit);
      setData(resp);
      setPage(resp.page || p);
    } catch (e: any) {
      const code = e?.message || "Erro ao carregar";
      const map: Record<string, string> = {
        missing_token: "Sessão de admin ausente. Faça login como admin.",
        missing_admin_token: "Sessão de admin ausente. Faça login como admin.",
        unauthorized: "Sessão expirada. Entre novamente como admin.",
        forbidden: "Acesso negado. Esta conta não é admin.",
        HTTP_401: "Sessão expirada. Faça login como admin novamente.",
        HTTP_403: "Acesso negado. Conta sem permissão de administrador.",
        HTTP_404: "Rota não encontrada (token inválido/ausente também pode retornar 404).",
      };
      setMsg(map[code] || code);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1 className="page-title">Painel de Usuários</h1>

      {msg && <div className="alert alert--err">{msg}</div>}

      <div className="card" style={{ padding: 16 }}>
        <div className="row-between" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Usuários Cadastrados</h3>
          <button className="btn" onClick={() => loadUsers(page)} disabled={loading}>
            {loading ? "Atualizando…" : "Atualizar"}
          </button>
        </div>

        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Status</th>
                <th>Data de Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {data?.users?.length ? (
                data.users.map((u, index) => (
                  <tr key={u.email}>
                    <td>{(page - 1) * limit + index + 1}</td>
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
                  <td colSpan={6} className="muted" style={{ textAlign: "center", padding: 16 }}>
                    {loading ? "Carregando…" : "Nenhum usuário encontrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="row-between" style={{ marginTop: 16 }}>
          <button className="btn" disabled={loading || page <= 1} onClick={() => loadUsers(page - 1)}>
            ◀ Anterior
          </button>
          <div className="muted">
            Total: {total} • Página <strong>{page}</strong> de <strong>{totalPages}</strong>
          </div>
          <button className="btn" disabled={loading || page >= totalPages} onClick={() => loadUsers(page + 1)}>
            Próxima ▶
          </button>
        </div>
      </div>
    </div>
  );
}
