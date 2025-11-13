import React from "react";

const PrivateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#020203,#0b0f14)", color: "#fff" }}>
      <header style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
        <div style={{ fontWeight: 700 }}>Media Enhancer</div>
        <div>
          <button className="me-btn me-btn-ghost" onClick={() => alert("Perfil")}>Perfil</button>
        </div>
      </header>
      <main style={{ padding: 20 }}>{children}</main>
    </div>
  );
};

export default PrivateLayout;
