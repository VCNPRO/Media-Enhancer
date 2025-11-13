import React from "react";

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#07070b,#0b1020)", color: "#fff" }}>
      <header style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 700 }}>Media Enhancer</div>
        <nav>
          <a href="/select-plan" style={{ color: "#fff", marginRight: 12 }}>Planes</a>
          <a href="/login" style={{ color: "#fff" }}>Entrar</a>
        </nav>
      </header>
      <main>{children}</main>
      <footer style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.6)" }}>
         { new Date().getFullYear() } Media Enhancer
      </footer>
    </div>
  );
};

export default PublicLayout;
