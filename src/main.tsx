import React, { lazy, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./style.css";

import PrivateRoute from "./routes/PrivateRoute";

/* Páginas (lazy) */
const Home = lazy(() => import("./pages/Home"));
const ComoFunciona = lazy(() => import("./pages/ComoFunciona"));
const Login = lazy(() => import("./pages/Login"));
const CriarConta = lazy(() => import("./pages/CriarConta"));
const MundoDigital = lazy(() => import("./pages/MundoDigital"));
const MeusProdutos = lazy(() => import("./pages/MeusProdutos"));
const Suporte = lazy(() => import("./pages/Suporte"));
const Termos = lazy(() => import("./pages/Termos"));
const Privacidade = lazy(() => import("./pages/Privacidade"));
const MeusDados = lazy(() => import("./pages/MeusDados")); // ✅ novo

/* Scroll to top */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
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
  static getDerivedStateFromError() {
    return { hasError: true };
  }
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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
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

            {/* área logada */}
            <Route element={<PrivateRoute />}>
              <Route path="/app" element={<MundoDigital />} />
              <Route path="/app/meus-produtos" element={<MeusProdutos />} />
              <Route path="/app/meus-dados" element={<MeusDados />} /> {/* ✅ novo */}
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);
