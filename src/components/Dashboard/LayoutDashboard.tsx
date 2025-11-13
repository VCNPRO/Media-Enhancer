import React from "react";
import "./LayoutDashboard.css";
import { Link } from "react-router-dom";

const LayoutDashboard: React.FC<{ children: React.ReactNode; title?: string }> = ({ children, title }) => {
  return (
    <div className="me-dashboard">
      <aside className="me-sidebar">
        <div className="me-sidebar-brand">Media Enhancer</div>
        <nav className="me-nav">
          <Link to="/dashboard/basic">Proyectos</Link>
          <Link to="/dashboard/basic">Editor</Link>
          <Link to="/dashboard/basic">Almacenamiento</Link>
          <Link to="/dashboard/basic">Exportar</Link>
        </nav>
        <div className="me-sidebar-footer">Plan: <strong>...</strong></div>
      </aside>
      <main className="me-main">
        <header className="me-main-header">
          <h2>{title ?? "Dashboard"}</h2>
        </header>
        <section className="me-main-content">{children}</section>
      </main>
    </div>
  );
};

export default LayoutDashboard;
