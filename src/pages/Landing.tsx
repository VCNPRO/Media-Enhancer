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
                to="/demo-setup"
                className="px-4 py-2 text-gray-300 hover:text-white transition"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/demo-setup"
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
        <div className="text-center space-y-6 animate-fadeInUp">
          <div className="inline-block px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-sm font-semibold mb-4 animate-pulse">
            ✨ Editor de Video en tu Navegador
          </div>
          <h2 className="text-5xl md:text-7xl font-bold leading-tight">
            Edita tus Videos VHS
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 animate-gradient">
              Como un Profesional
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Digitaliza y mejora tus recuerdos familiares en VHS. Editor simple para usuarios domésticos
            o herramientas profesionales con IA para creadores de contenido.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              to="/demo-setup"
              className="group px-8 py-4 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-500/50 hover:shadow-red-500/70 hover:scale-105 transform"
            >
              <span className="flex items-center justify-center gap-2">
                Empezar Ahora
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-xl font-bold text-lg transition-all hover:scale-105 transform backdrop-blur-sm"
            >
              Ver Funciones
            </a>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mt-20 rounded-2xl bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 p-8 border border-gray-700 shadow-2xl animate-fadeInUp animation-delay-200 hover:border-gray-600 transition-all">
          <div className="aspect-video bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-xl flex items-center justify-center relative overflow-hidden group">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="text-center relative z-10">
              <span className="text-8xl animate-bounce-slow inline-block">📼</span>
              <p className="mt-6 text-xl text-gray-300 font-semibold">Preview del Editor</p>
              <p className="mt-2 text-sm text-gray-500">Procesamiento en tiempo real en tu navegador</p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center animate-fadeInUp animation-delay-400">
          <div>
            <div className="text-3xl font-bold text-red-500">100%</div>
            <div className="text-sm text-gray-400 mt-1">En el Navegador</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-pink-500">0€</div>
            <div className="text-sm text-gray-400 mt-1">Plan Gratis</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-500">Privado</div>
            <div className="text-sm text-gray-400 mt-1">Tus videos no se suben</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-500">Rápido</div>
            <div className="text-sm text-gray-400 mt-1">Sin esperas</div>
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
            <div className="group bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-red-500 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/20 hover:-translate-y-2 transform">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">✂️</div>
              <h4 className="text-xl font-bold mb-3 group-hover:text-red-400 transition-colors">Editor Simple</h4>
              <p className="text-gray-300 leading-relaxed">
                Corta escenas, ajusta volumen y rota videos. Perfecto para videos VHS de hasta 3 horas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-pink-500 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/20 hover:-translate-y-2 transform">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🎨</div>
              <h4 className="text-xl font-bold mb-3 group-hover:text-pink-400 transition-colors">Mejora de Imágenes</h4>
              <p className="text-gray-300 leading-relaxed">
                Colorea fotos antiguas en B&N y mejora la calidad de tus recuerdos familiares.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-2 transform">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🤖</div>
              <h4 className="text-xl font-bold mb-3 group-hover:text-purple-400 transition-colors">IA Profesional</h4>
              <p className="text-gray-300 leading-relaxed">
                Upscaling a 4K, auto-subtítulos, mejora de audio y mucho más con inteligencia artificial.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-yellow-500 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/20 hover:-translate-y-2 transform">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📼</div>
              <h4 className="text-xl font-bold mb-3 group-hover:text-yellow-400 transition-colors">Optimizado para VHS</h4>
              <p className="text-gray-300 leading-relaxed">
                Detecta automáticamente videos VHS (720x576 PAL) y aplica mejoras específicas.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-2 transform">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
              <h4 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">Procesamiento Rápido</h4>
              <p className="text-gray-300 leading-relaxed">
                Videos pequeños se procesan en tu navegador. Sin esperas ni uploads.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-green-500 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/20 hover:-translate-y-2 transform">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">💾</div>
              <h4 className="text-xl font-bold mb-3 group-hover:text-green-400 transition-colors">Exportación Moderna</h4>
              <p className="text-gray-300 leading-relaxed">
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
      <footer className="border-t border-gray-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">🎬</span>
                <h3 className="text-xl font-bold">Media Enhancer</h3>
              </div>
              <p className="text-gray-400">
                Editor de video profesional en tu navegador. Digitaliza y mejora tus recuerdos VHS.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Funciones</a></li>
                <li><Link to="/demo-setup" className="hover:text-white transition">Empezar</Link></li>
                <li><a href="#pricing" className="hover:text-white transition">Precios</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Tecnología</h4>
              <ul className="space-y-2 text-gray-400">
                <li>✓ FFmpeg.wasm</li>
                <li>✓ Procesamiento Client-Side</li>
                <li>✓ 100% Privado</li>
                <li>✓ Sin Registro Requerido</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Media Enhancer. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
          animation-fill-mode: both;
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% 200%;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
