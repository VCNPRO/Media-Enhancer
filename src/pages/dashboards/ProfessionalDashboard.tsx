import React from "react";
import LayoutDashboard from "../../components/Dashboard/LayoutDashboard";
import { usePlan } from "../../hooks/usePlan";

const ProfessionalDashboard: React.FC = () => {
  const { plan } = usePlan();

  return (
    <LayoutDashboard title="Dashboard  Professional">
      <div>
        <h3>Bienvenido (Professional)</h3>
        <p>Plan actual: {plan}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
          <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
            <h4>Editor Pro (IA desbloqueada)</h4>
            <button className="me-btn me-btn-primary">Abrir</button>
          </div>
          <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
            <h4>Storage: 500GB</h4>
            <p>Exports ilimitados</p>
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default ProfessionalDashboard;
