import React, { useEffect, useState } from "react";
import PublicLayout from "../layouts/PublicLayout";
import "./DebugPage.css";

const DebugPage: React.FC = () => {
  const [plan, setPlan] = useState<string | null>(null);
  const [backend, setBackend] = useState<string | null>(null);

  useEffect(() => {
    const p = localStorage.getItem("me_plan");
    setPlan(p);
    const candidates = [
      (window as any).BACKEND_URL,
      (window as any).__BACKEND_URL__,
      (window as any).VITE_BACKEND_URL,
      (process as any)?.env?.VITE_BACKEND_URL,
      (process as any)?.env?.BACKEND_URL
    ];
    const found = candidates.find(Boolean) || null;
    setBackend(found);
  }, []);

  const apply = (p: string) => {
    localStorage.setItem("me_plan", p);
    setPlan(p);
    alert("Plan set to " + p + ". Recarga la página si es necesario.");
  };

  const clear = () => {
    localStorage.removeItem("me_plan");
    setPlan(null);
    alert("Plan eliminado. Recarga la página.");
  };

  return (
    <PublicLayout>
      <div className="me-debug" style={{ padding: 24 }}>
        <h2>Debug / Diagnóstico</h2>
        <div className="me-debug-grid">
          <div className="me-debug-card">
            <h3>Plan actual</h3>
            <div className="me-debug-value">{plan ?? " (no establecido)"}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="me-btn me-btn-primary" onClick={() => apply("basic")}>Set basic</button>
              <button className="me-btn me-btn-primary" onClick={() => apply("premium")}>Set premium</button>
              <button className="me-btn me-btn-primary" onClick={() => apply("professional")}>Set professional</button>
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="me-btn me-btn-ghost" onClick={clear}>Clear plan</button>
            </div>
          </div>

          <div className="me-debug-card">
            <h3>Rutas rápidas</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a href="/dashboard/basic">Ir a Dashboard Básico</a>
              <a href="/dashboard/premium">Ir a Dashboard Premium</a>
              <a href="/dashboard/professional">Ir a Dashboard Professional</a>
              <a href="/select-plan">Ir a Selección de Plan</a>
            </div>
          </div>

          <div className="me-debug-card">
            <h3>Backend</h3>
            <div className="me-debug-value">{backend ?? "No detectado (ver consola)"}</div>
            <div style={{ marginTop: 12 }}>
              <button className="me-btn me-btn-ghost" onClick={() => alert("Mira la consola para mensajes de api.ts")}>Mostrar consola</button>
            </div>
          </div>

          <div className="me-debug-card">
            <h3>Acciones</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="me-btn me-btn-primary" onClick={() => location.reload()}>Recargar página</button>
              <button className="me-btn me-btn-ghost" onClick={() => console.log("LocalStorage:", JSON.stringify(localStorage))}>Log localStorage</button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, color: "rgba(255,255,255,0.7)" }}>
          Nota: estos cambios son locales (localStorage). Utiliza la opción de borrar para volver al estado inicial.
        </div>
      </div>
    </PublicLayout>
  );
};

export default DebugPage;
