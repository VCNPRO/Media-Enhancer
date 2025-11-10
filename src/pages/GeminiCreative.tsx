import React from 'react';
import { Link } from 'react-router-dom';
import { CreativeToolsPanel } from '../../components/CreativeToolsPanel';

export const GeminiCreative: React.FC = () => {
  const handleGenerationComplete = (prompt: string, resultUrl: string) => {
    console.log('Image generated:', { prompt, resultUrl });
    // Aquí se podría guardar en el historial
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-gray-400 hover:text-white transition"
              >
                ← Volver
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎨</span>
                <div>
                  <h1 className="text-2xl font-bold">Generación Creativa con IA</h1>
                  <p className="text-sm text-gray-400">
                    Crea imágenes únicas desde tus ideas con Gemini AI
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-8 border-b border-gray-700">
            <h2 className="text-3xl font-bold mb-3">
              Da vida a tu imaginación
            </h2>
            <p className="text-gray-300 text-lg">
              Describe lo que quieres ver y nuestra IA lo creará para ti.
              Desde fotorrealismo hasta arte abstracto, las posibilidades son infinitas.
            </p>
          </div>

          {/* Creative Tools Panel */}
          <CreativeToolsPanel onGenerationComplete={handleGenerationComplete} />

          {/* Examples Section */}
          <div className="p-8 bg-gray-900/50 border-t border-gray-700">
            <h3 className="text-xl font-bold mb-4">Ejemplos de prompts</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Fotorrealista</p>
                <p className="text-gray-300">
                  "Un astronauta flotando en el espacio, con la Tierra de fondo,
                  iluminación cinematográfica, ultra detallado, fotografía profesional"
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Arte Digital</p>
                <p className="text-gray-300">
                  "Un dragón de cristal volando sobre una ciudad cyberpunk al atardecer,
                  estilo digital art, colores vibrantes, 4K"
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Paisaje</p>
                <p className="text-gray-300">
                  "Valle montañoso con lago cristalino al amanecer, niebla suave,
                  fotografía de paisaje, gran angular"
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Retrato</p>
                <p className="text-gray-300">
                  "Retrato de una mujer elegante de los años 20, vestido de gala,
                  estilo art deco, iluminación suave, blanco y negro"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
