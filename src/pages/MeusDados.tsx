import React, { useEffect, useState } from "react";
import { apiGetProfile, apiUpdateProfile, Profile } from "../lib/api";

const TOKEN_KEYS = ["myglobyx_token", "myglobyx:token", "token"];

function readToken(): string | null {
  for (const k of TOKEN_KEYS) {
    const v = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

export default function MeusDados() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [form, setForm] = useState<Profile>({
    name: "",
    email: "",
    phone: "",
    birthdate: "",
    document: "",
    address: {
      cep: "",
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      state: "",
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const token = readToken();
        if (!token) {
          setError("missing_token");
          setLoading(false);
          return;
        }
        const p = await apiGetProfile(token);
        setForm({
          name: p.name || "",
          email: p.email || "",
          phone: p.phone || "",
          birthdate: p.birthdate || "",
          document: p.document || "",
          address: {
            cep: p.address?.cep || "",
            street: p.address?.street || "",
            number: p.address?.number || "",
            complement: p.address?.complement || "",
            district: p.address?.district || "",
            city: p.address?.city || "",
            state: p.address?.state || "",
          },
        });
      } catch (e: any) {
        setError(e?.message || "unknown_error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function set<K extends keyof Profile>(key: K, v: Profile[K]) {
    setForm((f) => ({ ...f, [key]: v }));
  }
  function setAddr<K extends keyof NonNullable<Profile["address"]>>(key: K, v: string) {
    setForm((f) => ({ ...f, address: { ...(f.address ?? {}), [key]: v } }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setOk(false);
    setError(null);
    try {
      const token = readToken();
      if (!token) throw new Error("missing_token");
      const updated = await apiUpdateProfile(token, form);
      setForm(updated);
      setOk(true);
    } catch (e: any) {
      setError(e?.message || "unknown_error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container profile-page" style={{ padding: 24, maxWidth: 960 }}>
      <h1>Meus Dados</h1>
      <p>Atualize seus dados pessoais e residenciais. (Sem informações bancárias.)</p>

      {loading ? (
        <div className="card" style={{ padding: 16, marginTop: 12 }}>Carregando…</div>
      ) : (
        <form onSubmit={onSubmit} className="card profile-card">
          {/* Alerts */}
          {error && <div className="alert alert--error">Erro: {error}</div>}
          {ok && <div className="alert alert--ok">Dados salvos com sucesso.</div>}

          {/* Pessoais */}
          <h3>Dados pessoais</h3>
          <div className="form-grid">
            <div className="field field--full">
              <label>Nome completo</label>
              <input
                className="input"
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>E-mail (não editável)</label>
              <input className="input" type="email" value={form.email} disabled />
            </div>

            <div className="field">
              <label>Telefone</label>
              <input
                className="input"
                type="tel"
                value={form.phone ?? ""}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="(xx) xxxxx-xxxx"
              />
            </div>

            <div className="field">
              <label>Nascimento</label>
              <input
                className="input"
                type="date"
                value={form.birthdate ?? ""}
                onChange={(e) => set("birthdate", e.target.value)}
              />
            </div>

            <div className="field">
              <label>CPF</label>
              <input
                className="input"
                type="text"
                value={form.document ?? ""}
                onChange={(e) => set("document", e.target.value)}
                placeholder="Somente números"
              />
            </div>
          </div>

          {/* Endereço */}
          <h3 style={{ marginTop: 12 }}>Endereço</h3>
          <div className="form-grid">
            <div className="field">
              <label>CEP</label>
              <input
                className="input"
                type="text"
                value={form.address?.cep ?? ""}
                onChange={(e) => setAddr("cep", e.target.value)}
              />
            </div>
            <div className="field field--full">
              <label>Rua</label>
              <input
                className="input"
                type="text"
                value={form.address?.street ?? ""}
                onChange={(e) => setAddr("street", e.target.value)}
              />
            </div>
            <div className="field">
              <label>Número</label>
              <input
                className="input"
                type="text"
                value={form.address?.number ?? ""}
                onChange={(e) => setAddr("number", e.target.value)}
              />
            </div>
            <div className="field">
              <label>Complemento</label>
              <input
                className="input"
                type="text"
                value={form.address?.complement ?? ""}
                onChange={(e) => setAddr("complement", e.target.value)}
              />
            </div>
            <div className="field">
              <label>Bairro</label>
              <input
                className="input"
                type="text"
                value={form.address?.district ?? ""}
                onChange={(e) => setAddr("district", e.target.value)}
              />
            </div>
            <div className="field">
              <label>Cidade</label>
              <input
                className="input"
                type="text"
                value={form.address?.city ?? ""}
                onChange={(e) => setAddr("city", e.target.value)}
              />
            </div>
            <div className="field">
              <label>UF</label>
              <input
                className="input"
                type="text"
                value={form.address?.state ?? ""}
                onChange={(e) => setAddr("state", e.target.value.toUpperCase())}
                maxLength={2}
              />
            </div>
          </div>

          <div className="actions">
            <button className="btn btn--primary" disabled={saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
