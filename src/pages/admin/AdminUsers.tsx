import React from "react";
import api from "../../lib/api";

export default function AdminUsers() {
  const [name, setName]   = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pass, setPass]   = React.useState("");
  const [msg, setMsg]     = React.useState<string | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!name || !email || pass.length < 6) {
      setMsg("Preencha nome, e-mail e senha (min. 6).");
      return;
    }
    try {
      await api.post("/auth/signup", { name, email, password: pass });
      setMsg("Usuário criado. (Em breve listagem/edição aqui)");
      setName(""); setEmail(""); setPass("");
    } catch (e: any) {
      setMsg(e?.message || "Erro ao criar usuário.");
    }
  }

  return (
    <div>
      <h1>Usuários</h1>
      {msg && <div className="alert alert--ok" style={{ marginBottom: 12 }}>{msg}</div>}

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
            <input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
          </div>
        </div>
        <div className="actions"><button className="btn btn--primary">Criar</button></div>
      </form>

      <div className="muted">A listagem/edição/exclusão completa entra assim que você me enviar o <code>src/db/usersStore.ts</code> atual para eu expor os métodos (list/update/delete).</div>
    </div>
  );
}
