import React from "react";
import LayoutDashboard from "../../components/Dashboard/LayoutDashboard";
import { usePlan } from "../../hooks/usePlan";

const BasicDashboard: React.FC = () => {
  const { plan } = usePlan();

  return (
    <LayoutDashboard title="Dashboard  Básico">
      <div>
        <h3>Bienvenido (Básico)</h3>
        <p>Plan actual: {plan}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
            <h4>Editor Simple</h4>
            <button className="me-btn me-btn-primary">Abrir Editor</button>
          </div>
          <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
            <h4>Subir Video</h4>
            <button className="me-btn me-btn-ghost" onClick={() => alert("Subir - implementar")}>Subir</button>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default BasicDashboard;
