// src/pages/admin/AdminLayout.tsx
import React from "react";
import { Link, Outlet } from "react-router-dom";

const ADMIN_TOKEN_KEY = "myglobyx_admin_token";

export default function AdminLayout() {
  function handleAdminLogout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    // volta para o login exclusivo do admin
    window.location.href = "/admin/login";
  }

  return (
    <div className="page">
      <header className="header">
        <div className="container header__inner">
          <Link className="brand__logo" to="/">MYGLOBYX</Link>
          <nav className="nav">
            <Link className="link" to="/admin/produtos">Produtos</Link>
            <Link className="link" to="/admin/liberacoes">Liberações</Link>
            <Link className="link" to="/app/meus-produtos">Área do cliente</Link>
            <button className="btn btn--outline" onClick={handleAdminLogout}>Sair (Admin)</button>
          </nav>
        </div>
      </header>
      <main className="container" style={{ padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
