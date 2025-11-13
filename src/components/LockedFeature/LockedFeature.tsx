import React from "react";
import "./LockedFeature.css";

const LockedFeature: React.FC<{ label?: string; onUpgrade?: () => void }> = ({ label = "Función Pro", onUpgrade }) => {
  return (
    <div className="me-locked">
      <div className="me-locked-icon"></div>
      <div className="me-locked-body">
        <div className="me-locked-label">{label}</div>
        <button className="me-btn me-btn-ghost" onClick={onUpgrade}>Mejorar</button>
      </div>
    </div>
  );
};

export default LockedFeature;
