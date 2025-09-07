import React, { useEffect, useState } from "react";
import { apiGetProfile, apiUpdateProfile, Profile } from "../lib/api";
import { getToken } from "../lib/auth";

/** helpers de normalização */
const onlyDigits = (s?: string) => (s ? s.replace(/\D/g, "") : "");
const toUF = (s?: string) => (s ? s.trim().toUpperCase().slice(0, 2) : "");

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
      setLoading(true);
      setError(null);
      setOk(false);
      try {
        const token = getToken();
        if (!token) {
          setError("missing_token");
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

  function setField<K extends keyof Profile>(key: K, v: Profile[K]) {
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
      const token = getToken();
      if (!token) throw new Error("missing_token");

      // Sanitiza antes de enviar (mantém shape Profile)
      const payload: Profile = {
        ...form,
        phone: onlyDigits(form.phone || ""),
        document: onlyDigits(form.document || ""),
        address: {
          cep: onlyDigits(form.address?.cep || ""),
          street: form.address?.street || "",
          number: (form.address?.number || "").trim(),
          complement: (form.address?.complement || "").trim(),
          district: (form.address?.district || "").trim(),
          city: (form.address?.city || "").trim(),
          state: toUF(form.address?.state || ""),
        },
      };

      const updated = await apiUpdateProfile(token, payload);
      setForm({
        name: updated.name || "",
        email: updated.email || "",
        phone: updated.phone || "",
        birthdate: updated.birthdate || "",
        document: updated.document || "",
        address: {
          cep: updated.address?.cep || "",
          street: updated.address?.street || "",
          number: updated.address?.number || "",
          complement: updated.address?.complement || "",
          district: updated.address?.district || "",
          city: updated.address?.city || "",
          state: updated.address?.state || "",
        },
      });
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
        <form onSubmit={onSubmit} className="card profile-card" style={{ padding: 16, marginTop: 12 }}>
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
                onChange={(e) => setField("name", e.target.value)}
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
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="(xx) xxxxx-xxxx"
              />
            </div>

            <div className="field">
              <label>Nascimento</label>
              <input
                className="input"
                type="date"
                value={form.birthdate ?? ""}
                onChange={(e) => setField("birthdate", e.target.value)}
              />
            </div>

            <div className="field">
              <label>CPF</label>
              <input
                className="input"
                type="text"
                value={form.document ?? ""}
                onChange={(e) => setField("document", e.target.value)}
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
                onChange={(e) => setAddr("state", toUF(e.target.value))}
                maxLength={2}
              />
            </div>
          </div>

          <div className="actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={saving}
              aria-busy={saving}
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
