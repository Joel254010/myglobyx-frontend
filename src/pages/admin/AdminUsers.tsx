import React from "react";
import api from "../../lib/api";

/* ------------ Tipos ------------ */
type Msg = { type: "ok" | "err"; text: string } | null;

type UserRow = {
  name: string;
  email: string;
  phone?: string;
  isVerified?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type UsersResp = {
  total: number;
  page: number;
  limit: number;
  users: UserRow[];
};

type SortKey = "name" | "email" | "phone" | "isVerified" | "createdAt";
type SortDir = "asc" | "desc";

/* ------------ Helpers ------------ */
function maskPhone(v?: string) {
  if (!v) return "—";
  const digits = v.replace(/\D/g, "");
  if (digits.length < 10) return v;
  const ddd = digits.slice(0, 2);
  const meio = digits.length === 11 ? digits.slice(2, 7) : digits.slice(2, 6);
  const fim = "**" + (digits.length >= 2 ? digits.slice(-2) : "");
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

function toBool(v: any): boolean {
  return !!v;
}

/* ------------ Componente ------------ */
export default function AdminUsers() {
  /* criação provisória */
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pass, setPass] = React.useState("");

  /* listagem (server-side) */
  const [data, setData] = React.useState<UsersResp | null>(null);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(25);
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<Msg>(null);

  /* filtros/ordenação (client-side sobre a página atual) */
  const [search, setSearch] = React.useState("");
  const [verifiedFilter, setVerifiedFilter] = React.useState<"all" | "yes" | "no">("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const totalPages: number = data ? Math.max(1, Math.ceil(data.total / (data.limit || limit))) : 1;
  const isFirstPage: boolean = page <= 1;
  const isLastPage: boolean = page >= totalPages;

  async function loadUsers(p = page, l = limit) {
    setLoading(true);
    setMsg(null);
    try {
      const res = await api.get<UsersResp>("/admin/users", {
        params: { page: p, limit: l },
      });
      setData(res.data);
      setPage(res.data.page);
    } catch (e: any) {
      const text =
        e?.response?.data?.error ||
        e?.message ||
        "Não foi possível carregar usuários.";
      setMsg({ type: "err", text });
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadUsers(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!name || !email || pass.length < 6) {
      setMsg({ type: "err", text: "Preencha nome, e-mail e senha (min. 6)." });
      return;
    }
    try {
      await api.post("/auth/signup", { name, email, password: pass });
      setMsg({
        type: "ok",
        text: "Usuário criado. Enviamos e-mail de confirmação (ou foi logado no console, em dev).",
      });
      setName("");
      setEmail("");
      setPass("");
      loadUsers(1, limit);
    } catch (e: any) {
      const text = e?.response?.data?.error || e?.message || "Erro ao criar usuário.";
      setMsg({ type: "err", text });
    }
  }

  /* -------- dados filtrados/ordenados (sobre a página atual) -------- */
  const pageUsers = data?.users ?? [];

  const filteredUsers = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = pageUsers.filter((u) => {
      const matchesSearch =
        !q ||
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q);
      const matchesVerified =
        verifiedFilter === "all"
          ? true
          : verifiedFilter === "yes"
          ? toBool(u.isVerified)
          : !toBool(u.isVerified);
      return matchesSearch && matchesVerified;
    });

    const dirMul = sortDir === "asc" ? 1 : -1;

    return list.sort((a, b) => {
      const av =
        sortKey === "createdAt"
          ? new Date(a.createdAt || 0).getTime()
          : sortKey === "isVerified"
          ? Number(Boolean(a.isVerified))
          : String((a as any)[sortKey] || "").toLowerCase();

      const bv =
        sortKey === "createdAt"
          ? new Date(b.createdAt || 0).getTime()
          : sortKey === "isVerified"
          ? Number(Boolean(b.isVerified))
          : String((b as any)[sortKey] || "").toLowerCase();

      if (av < bv) return -1 * dirMul;
      if (av > bv) return 1 * dirMul;
      return 0;
    });
  }, [pageUsers, search, verifiedFilter, sortKey, sortDir]);

  /* ------------ ações extras (export/copy) ------------ */
  function exportCSV() {
    const rows = [
      ["name", "email", "phone", "isVerified", "createdAt", "updatedAt"],
      ...filteredUsers.map((u) => [
        u.name || "",
        u.email || "",
        u.phone || "",
        String(Boolean(u.isVerified)),
        typeof u.createdAt === "string" ? u.createdAt : (u.createdAt ? (u.createdAt as Date).toISOString() : ""),
        typeof u.updatedAt === "string" ? u.updatedAt : (u.updatedAt ? (u.updatedAt as Date).toISOString() : ""),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usuarios_mygloybx_p${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyEmails() {
    try {
      const content = filteredUsers.map((u) => u.email).filter(Boolean).join(", ");
      await navigator.clipboard.writeText(content);
      setMsg({ type: "ok", text: "E-mails copiados para a área de transferência." });
    } catch {
      setMsg({ type: "err", text: "Não foi possível copiar os e-mails." });
    }
  }

  function toggleSort(k: SortKey) {
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir(k === "createdAt" ? "desc" : "asc"); // padrão: data desc, texto asc
    }
  }

  /* ------------ UI ------------ */
  return (
    <div>
      <h1>Usuários</h1>

      {msg && (
        <div
          className={`alert ${msg.type === "ok" ? "alert--ok" : "alert--err"}`}
          style={{ marginBottom: 12 }}
        >
          {msg.text}
        </div>
      )}

      {/* Top bar: filtros/ações */}
      <div className="card" style={{ padding: 12, marginBottom: 12 }}>
        <div className="row-between" style={{ gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, flex: 1, minWidth: 280 }}>
            <input
              className="input"
              placeholder="Buscar por nome, e-mail ou telefone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="input"
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value as any)}
              title="Filtrar por verificação"
            >
              <option value="all">Todos</option>
              <option value="yes">Verificados</option>
              <option value="no">Não verificados</option>
            </select>
            <select
              className="input"
              value={String(limit)}
              onChange={(e) => setLimit(Number(e.target.value))}
              title="Itens por página (server-side)"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn" onClick={() => loadUsers(page, limit)} disabled={loading}>
              {loading ? "Atualizando…" : "Atualizar"}
            </button>
            <button className="btn" onClick={copyEmails} disabled={!filteredUsers.length}>
              Copiar e-mails
            </button>
            <button className="btn" onClick={exportCSV} disabled={!filteredUsers.length}>
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Card: Criar novo usuário (provisório) */}
      <form onSubmit={onCreate} className="card" style={{ padding: 12, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Novo usuário (provisório)</h3>
        <div className="form-grid" style={{ marginTop: 12 }}>
          <div className="field field--full">
            <label>Nome</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
            />
          </div>
          <div className="field">
            <label>E-mail</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              type="email"
            />
          </div>
          <div className="field">
            <label>Senha</label>
            <input
              className="input"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="mín. 6 caracteres"
            />
          </div>
        </div>
        <div className="actions">
          <button className="btn btn--primary" disabled={loading}>
            {loading ? "Criando…" : "Criar"}
          </button>
        </div>
      </form>

      {/* Card: Lista de usuários */}
      <div className="card" style={{ padding: 12 }}>
        <div className="row-between" style={{ marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Lista</h3>
          <small className="muted">
            Total: {data?.total ?? "—"} • Página {page}/{totalPages}
          </small>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "26%", cursor: "pointer" }} onClick={() => toggleSort("name")}>
                  Nome {sortKey === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </th>
                <th style={{ width: "28%", cursor: "pointer" }} onClick={() => toggleSort("email")}>
                  E-mail {sortKey === "email" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </th>
                <th style={{ width: "18%", cursor: "pointer" }} onClick={() => toggleSort("phone")}>
                  Telefone {sortKey === "phone" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </th>
                <th style={{ width: "12%", cursor: "pointer" }} onClick={() => toggleSort("isVerified")}>
                  Status {sortKey === "isVerified" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </th>
                <th style={{ width: "16%", cursor: "pointer" }} onClick={() => toggleSort("createdAt")}>
                  Criado {sortKey === "createdAt" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length ? (
                filteredUsers.map((u) => (
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

        {/* Paginação (server-side) */}
        <div className="row-between" style={{ marginTop: 12 }}>
          <button
            className="btn"
            disabled={loading || isFirstPage}
            onClick={() => loadUsers(page - 1, limit)}
          >
            ◀ Anterior
          </button>
          <div className="muted">
            Página <strong>{page}</strong> de <strong>{totalPages}</strong>
          </div>
          <button
            className="btn"
            disabled={loading || isLastPage}
            onClick={() => loadUsers(page + 1, limit)}
          >
            Próxima ▶
          </button>
        </div>
      </div>

      <p className="muted" style={{ marginTop: 8 }}>
        * Busca e filtros atuam sobre a página carregada. Para conjuntos muito grandes, aumente “itens por página”
        ou implementamos filtros no backend quando quiser.
      </p>
    </div>
  );
}
