import React from "react";
import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="page">
      <header className="header">
        <div className="container header__inner">
          <Link className="brand__logo" to="/">MYGLOBYX</Link>
          <nav className="nav">
            <Link className="link" to="/admin/produtos">Produtos</Link>
            <Link className="link" to="/admin/liberacoes">Liberações</Link>
            <Link className="link" to="/app/meus-produtos">Área do cliente</Link>
          </nav>
        </div>
      </header>
      <main className="container" style={{ padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
