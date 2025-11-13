import React from "react";
import PublicLayout from "../layouts/PublicLayout";
import PlanCard from "../components/PlanCard/PlanCard";
import { useLocation, useNavigate } from "react-router-dom";
import { usePlan } from "../hooks/usePlan";

const PlanSelection: React.FC = () => {
  const nav = useNavigate();
  const { selectPlan } = usePlan();
  const loc = useLocation() as any;
  const pre = loc.state?.plan;

  const onSelect = (id: string) => {
    selectPlan(id as any);
    if (id === "basic") nav("/dashboard/basic");
    if (id === "premium") nav("/dashboard/premium");
    if (id === "professional") nav("/dashboard/professional");
  };

  return (
    <PublicLayout>
      <div style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
        <h2>Elige tu plan</h2>
        <p>Has seleccionado: <strong>{pre ?? ""}</strong></p>
        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          <PlanCard id="basic" title="Básico" price="€9.99/mes" features={["Editor simple","10GB"]} onSelect={onSelect} />
          <PlanCard id="premium" title="Premium" price="€24.99/mes" features={["Editor avanzado","100GB","IA parcial"]} highlighted onSelect={onSelect} />
          <PlanCard id="professional" title="Professional" price="€49.99/mes" features={["Todas funciones","500GB","Soporte"]} onSelect={onSelect} />
        </div>
      </div>
    </PublicLayout>
  );
};

export default PlanSelection;
