import React from "react";
import "./PlanCard.css";

type Props = {
  id: "basic" | "premium" | "professional";
  title: string;
  price: string;
  features: string[];
  buttonLabel?: string;
  highlighted?: boolean;
  onSelect?: (id: string) => void;
};

const PlanCard: React.FC<Props> = ({ id, title, price, features, buttonLabel = "Seleccionar", highlighted, onSelect }) => {
  return (
    <div className={`me-plancard ${highlighted ? "highlight" : ""}`}>
      <div className="me-plancard-header">
        <h3>{title}</h3>
        <div className="me-plan-price">{price}</div>
      </div>
      <ul className="me-plan-features">
        {features.map((f, i) => <li key={i}>{f}</li>)}
      </ul>
      <div className="me-plan-cta">
        <button className="me-btn me-btn-primary" onClick={() => onSelect?.(id)}>{buttonLabel}</button>
      </div>
    </div>
  );
};

export default PlanCard;
