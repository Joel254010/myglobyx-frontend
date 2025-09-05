// src/pages/admin/AdminUsers.tsx
import React from "react";
import api, { setAuthToken } from "../../lib/api";

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
  const [data, setData] = React.useState<ListResp | null>(null);
  const [page, setPage] = React.useState(1);
  const [limit] = React.useState(25);
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  // ✅ injeta o token do admin no Axios uma vez
  React.useEffect(() => {
    const t =
      localStorage.getItem(ADMIN_TOKEN_KEY) ||
      localStorage.getItem("myglobyx_token") || // fallback (se houver)
      "";
    setAuthToken(t || undefined);
  }, []);

  const total = data?.total ?? data?.users?.length ?? 0;
  const totalPages =
    data?.limit && data?.total
      ? Math.max(1, Math.ceil((data.total as number) / (data.limit as number)))
      : Math.max(1, Math.ceil(total / limit));

  async function loadUsers(p = page) {
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.get<ListResp>("/api/admin/users", {
        params: { page: p, limit },
      });
      setData(res.data);
      setPage(res.data.page || p);
    } catch (e: any) {
      // Mostra erro “amigável”
      const code = e?.message || "Erro ao carregar";
      const map: Record<string, string> = {
        HTTP_401: "Sessão expirada. Faça login como admin novamente.",
        HTTP_403: "Acesso negado. Conta sem permissão de administrador.",
        HTTP_404: "Rota não encontrada (verificação de token também pode causar 404 aqui).",
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
      <h1>Usuários</h1>

      {msg && (
        <div className="alert alert--err" style={{ marginBottom: 12 }}>
          {msg}
        </div>
      )}

      <div className="card" style={{ padding: 12 }}>
        <div className="row-between" style={{ marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Lista</h3>
          <button className="btn" onClick={() => loadUsers(page)} disabled={loading}>
            {loading ? "Atualizando…" : "Atualizar"}
          </button>
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
