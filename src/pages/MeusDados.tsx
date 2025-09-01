// src/pages/MeusDados.tsx
import React, { useEffect, useState } from "react";
import { apiGetProfile, apiUpdateProfile, Profile } from "../lib/api";

function readToken(): string | null {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
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

  if (loading) {
    return <div className="container" style={{ padding: 24 }}>Carregando…</div>;
  }

  return (
    <div className="container" style={{ maxWidth: 900, padding: 24 }}>
      <h1>Meus Dados</h1>
      <p>Atualize seus dados pessoais e residenciais. (Sem informações bancárias.)</p>

      {error && <div className="alert alert--error">Erro: {error}</div>}
      {ok && <div className="alert alert--ok">Dados salvos com sucesso.</div>}

      <form onSubmit={onSubmit} className="card" style={{ padding: 16, marginTop: 12 }}>
        <h3>Dados pessoais</h3>

        <div className="grid" style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <label style={{ gridColumn: "1 / -1" }}>
            Nome completo
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </label>

          <label>
            E-mail (não editável)
            <input type="email" value={form.email} disabled />
          </label>

          <label>
            Telefone
            <input
              type="tel"
              value={form.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="(xx) xxxxx-xxxx"
            />
          </label>

          <label>
            Nascimento
            <input
              type="date"
              value={form.birthdate ?? ""}
              onChange={(e) => set("birthdate", e.target.value)}
            />
          </label>

          <label>
            CPF
            <input
              type="text"
              value={form.document ?? ""}
              onChange={(e) => set("document", e.target.value)}
              placeholder="Somente números"
            />
          </label>
        </div>

        <h3 style={{ marginTop: 24 }}>Endereço</h3>
        <div className="grid" style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
          <label>
            CEP
            <input
              type="text"
              value={form.address?.cep ?? ""}
              onChange={(e) => setAddr("cep", e.target.value)}
            />
          </label>
          <span />

          <label style={{ gridColumn: "1 / -1" }}>
            Rua
            <input
              type="text"
              value={form.address?.street ?? ""}
              onChange={(e) => setAddr("street", e.target.value)}
            />
          </label>

          <label>
            Número
            <input
              type="text"
              value={form.address?.number ?? ""}
              onChange={(e) => setAddr("number", e.target.value)}
            />
          </label>

          <label>
            Complemento
            <input
              type="text"
              value={form.address?.complement ?? ""}
              onChange={(e) => setAddr("complement", e.target.value)}
            />
          </label>

          <label>
            Bairro
            <input
              type="text"
              value={form.address?.district ?? ""}
              onChange={(e) => setAddr("district", e.target.value)}
            />
          </label>

          <label>
            Cidade
            <input
              type="text"
              value={form.address?.city ?? ""}
              onChange={(e) => setAddr("city", e.target.value)}
            />
          </label>

          <label>
            UF
            <input
              type="text"
              value={form.address?.state ?? ""}
              onChange={(e) => setAddr("state", e.target.value.toUpperCase())}
              maxLength={2}
            />
          </label>
        </div>

        <div className="hero__actions" style={{ marginTop: 20 }}>
          <button className="btn btn--primary" disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
