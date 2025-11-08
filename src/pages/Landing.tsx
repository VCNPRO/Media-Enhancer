import React from 'react';
import { Link } from 'react-router-dom';
import { PLANS } from '../config/plans';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎬</span>
              <h1 className="text-2xl font-bold">Media Enhancer</h1>
            </div>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-300 hover:text-white transition"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
              >
                Empezar Gratis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6">
          <h2 className="text-5xl md:text-6xl font-bold leading-tight">
            Edita tus Videos VHS
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
              Como un Profesional
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Digitaliza y mejora tus recuerdos familiares en VHS. Editor simple para usuarios domésticos
            o herramientas profesionales con IA para creadores de contenido.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-lg transition shadow-lg shadow-red-500/50"
            >
              Empezar Ahora
            </Link>
            <Link
              to="#features"
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-lg transition"
            >
              Ver Funciones
            </Link>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mt-16 rounded-2xl bg-gray-800 p-8 border border-gray-700">
          <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl">📼</span>
              <p className="mt-4 text-gray-400">Preview del Editor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-800/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-center mb-12">
            Funciones Principales
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="text-4xl mb-4">✂️</div>
              <h4 className="text-xl font-bold mb-2">Editor Simple</h4>
              <p className="text-gray-300">
                Corta escenas, añade títulos y cambia audio. Perfecto para videos VHS de hasta 3 horas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="text-4xl mb-4">🎨</div>
              <h4 className="text-xl font-bold mb-2">Mejora de Imágenes</h4>
              <p className="text-gray-300">
                Colorea fotos antiguas en B&N y mejora la calidad de tus recuerdos familiares.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="text-4xl mb-4">🤖</div>
              <h4 className="text-xl font-bold mb-2">IA Profesional</h4>
              <p className="text-gray-300">
                Upscaling a 4K, auto-subtítulos, mejora de audio y mucho más con inteligencia artificial.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="text-4xl mb-4">📼</div>
              <h4 className="text-xl font-bold mb-2">Optimizado para VHS</h4>
              <p className="text-gray-300">
                Detecta automáticamente videos VHS (720x576 PAL) y aplica mejoras específicas.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="text-xl font-bold mb-2">Procesamiento Rápido</h4>
              <p className="text-gray-300">
                Videos pequeños se procesan en tu navegador. Videos grandes en servidores potentes.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="text-4xl mb-4">💾</div>
              <h4 className="text-xl font-bold mb-2">Exportación Moderna</h4>
              <p className="text-gray-300">
                Convierte tus VHS antiguos a MP4 moderno optimizado para compartir y almacenar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-center mb-4">
            Planes para Todos
          </h3>
          <p className="text-center text-gray-300 mb-12">
            Desde usuarios domésticos hasta profesionales
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Plan Basic */}
            <div className="bg-gray-800 p-8 rounded-2xl border-2 border-gray-700 hover:border-gray-600 transition">
              <div className="text-center">
                <h4 className="text-2xl font-bold mb-2">{PLANS.basic.name}</h4>
                <div className="text-4xl font-bold mb-4">
                  €{PLANS.basic.price}
                  <span className="text-lg text-gray-400">/mes</span>
                </div>
                <p className="text-gray-300 mb-6">{PLANS.basic.description}</p>

                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Videos hasta 3 horas (VHS completos)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>20 GB de almacenamiento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Editor simple y fácil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Mejora de fotos B&N</span>
                  </li>
                </ul>

                <button className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition">
                  Empezar
                </button>
              </div>
            </div>

            {/* Plan Premium */}
            <div className="bg-gradient-to-br from-red-900/50 to-pink-900/50 p-8 rounded-2xl border-2 border-red-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-500 px-4 py-1 rounded-full text-sm font-bold">
                POPULAR
              </div>
              <div className="text-center">
                <h4 className="text-2xl font-bold mb-2">{PLANS.premium.name}</h4>
                <div className="text-4xl font-bold mb-4">
                  €{PLANS.premium.price}
                  <span className="text-lg text-gray-400">/mes</span>
                </div>
                <p className="text-gray-300 mb-6">{PLANS.premium.description}</p>

                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Todo del Plan Basic +</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Videos hasta 5 horas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>100 GB almacenamiento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Editor profesional multicapa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span>Transiciones, filtros, efectos</span>
                  </li>
                </ul>

                <button className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition">
                  Empezar Prueba
                </button>
              </div>
            </div>

            {/* Plan Professional */}
            <div className="bg-gray-800 p-8 rounded-2xl border-2 border-purple-500">
              <div className="text-center">
                <h4 className="text-2xl font-bold mb-2">{PLANS.professional.name}</h4>
                <div className="text-4xl font-bold mb-4">
                  €{PLANS.professional.price}
                  <span className="text-lg text-gray-400">/mes</span>
                </div>
                <p className="text-gray-300 mb-6">{PLANS.professional.description}</p>

                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Todo del Plan Premium +</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Videos hasta 10 horas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>500 GB almacenamiento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span className="font-bold">Todas las funciones IA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>Upscaling 4K/8K con IA</span>
                  </li>
                </ul>

                <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition">
                  Empezar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>&copy; 2024 Media Enhancer. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};
