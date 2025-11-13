import React from "react";
import LayoutDashboard from "../../components/Dashboard/LayoutDashboard";
import LockedFeature from "../../components/LockedFeature/LockedFeature";
import { usePlan } from "../../hooks/usePlan";

const PremiumDashboard: React.FC = () => {
  const { plan } = usePlan();
  return (
    <LayoutDashboard title="Dashboard  Premium">
      <div>
        <h3>Bienvenido (Premium)</h3>
        <p>Plan actual: {plan}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
          <div style={{ padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
            <h4>Editor Avanzado</h4>
            <button className="me-btn me-btn-primary">Abrir</button>
          </div>
          <div style={{ padding: 12 }}>
            <LockedFeature label="Mejoras IA avanzadas" onUpgrade={() => alert("Ir a Professional")} />
          </div>
        </div>
      </div>
    </LayoutDashboard>
  );
};

export default PremiumDashboard;
