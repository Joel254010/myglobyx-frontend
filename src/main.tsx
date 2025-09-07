// src/main.tsx
import React, { lazy, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./style.css";

import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";

// ✅ ajuste de caminhos: como este arquivo está em src/, use "./lib/*"
import { initAuthFromStorage } from "./lib/auth";
import { apiPingHealth } from "./lib/api";

/* Páginas (lazy) — ✅ todos com "./pages/*" */
const Home          = lazy(() => import("./pages/Home"));
const ComoFunciona  = lazy(() => import("./pages/ComoFunciona"));
const Login         = lazy(() => import("./pages/Login"));
const CriarConta    = lazy(() => import("./pages/CriarConta"));
const MundoDigital  = lazy(() => import("./pages/MundoDigital"));
const MeusProdutos  = lazy(() => import("./pages/MeusProdutos"));
const Suporte       = lazy(() => import("./pages/Suporte"));
const Termos        = lazy(() => import("./pages/Termos"));
const Privacidade   = lazy(() => import("./pages/Privacidade"));
const MeusDados     = lazy(() => import("./pages/MeusDados"));

/* Admin (lazy) */
const AdminLayout   = lazy(() => import("./pages/admin/AdminLayout"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminGrants   = lazy(() => import("./pages/admin/AdminGrants"));
const AdminUsers    = lazy(() => import("./pages/admin/AdminUsers"));
const AdminLogin    = lazy(() => import("./pages/admin/AdminLogin"));

/* Scroll to top */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/* Aquecer backend (Render cold start) */
function WarmBackend() {
  useEffect(() => {
    apiPingHealth().catch(() => void 0);
  }, []);
  return null;
}

/* Loader */
function Loader() {
  return (
    <div className="container" style={{ padding: "64px 0" }}>
      <p style={{ fontWeight: 700, color: "#1066FF" }}>Carregando...</p>
    </div>
  );
}

/* 404 */
function NotFound() {
  return (
    <div className="container" style={{ padding: "64px 0" }}>
      <h1 style={{ margin: 0 }}>Página não encontrada (404)</h1>
      <p style={{ color: "#3A4153" }}>
        O endereço pode ter mudado. Volte para a página inicial.
      </p>
      <a className="btn btn--primary" href="/">Voltar ao início</a>
    </div>
  );
}

/* ErrorBoundary */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) {
    console.error("❌ UI error boundary:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ padding: "64px 0" }}>
          <h1>Ocorreu um erro na interface</h1>
          <p style={{ color: "#3A4153" }}>
            Recarregue a página. Se persistir, veja o console (F12).
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

/* Restaura Authorization do Axios no boot */
initAuthFromStorage();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <WarmBackend />
      <ErrorBoundary>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/como-funciona" element={<ComoFunciona />} />
            <Route path="/login" element={<Login />} />
            <Route path="/criar-conta" element={<CriarConta />} />
            <Route path="/suporte" element={<Suporte />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/privacidade" element={<Privacidade />} />

            {/* login do admin */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* área logada (cliente) */}
            <Route element={<PrivateRoute />}>
              <Route path="/app" element={<MundoDigital />} />
              <Route path="/app/meus-produtos" element={<MeusProdutos />} />
              <Route path="/app/meus-dados" element={<MeusDados />} />
            </Route>

            {/* redirects legados */}
            <Route path="/mundo-digital" element={<Navigate to="/app" replace />} />
            <Route path="/meus-produtos" element={<Navigate to="/app/meus-produtos" replace />} />
            <Route path="/meus-dados" element={<Navigate to="/app/meus-dados" replace />} />

            {/* admin protegido */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminProducts />} />
                <Route path="produtos" element={<AdminProducts />} />
                <Route path="liberacoes" element={<AdminGrants />} />
                <Route path="usuarios" element={<AdminUsers />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
