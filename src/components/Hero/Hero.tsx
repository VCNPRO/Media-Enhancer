import React from "react";
import "./Hero.css";

const Hero: React.FC<{ onGetStarted?: () => void }> = ({ onGetStarted }) => {
  return (
    <section className="me-hero">
      <div className="me-hero-inner">
        <div className="me-hero-left">
          <h1 className="me-hero-title">Edita tus videos VHS como un profesional</h1>
          <p className="me-hero-sub">
            Restaura, estiliza y mejora tus grabaciones antiguas con un editor fácil e IA avanzada.
          </p>
          <div className="me-hero-ctas">
            <button className="me-btn me-btn-primary" onClick={onGetStarted}>Comenzar</button>
            <button className="me-btn me-btn-ghost" onClick={() => window.scrollTo({top: 700, behavior: "smooth"})}>Ver características</button>
          </div>
        </div>
        <div className="me-hero-right">
          <div className="me-preview">
            <div className="me-preview-screen">
              <div className="me-vhs-frame">
                <div className="me-vhs-line" />
                <span className="me-vhs-label">Preview</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
