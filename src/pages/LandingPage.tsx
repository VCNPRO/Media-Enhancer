import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🎬</span>
            <span className="text-xl font-bold">Media Enhancer</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-300 hover:text-white transition-colors">
              Iniciar Sesión
            </button>
            <button
              onClick={() => navigate('/plans')}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Empezar Gratis
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-block mb-8 px-4 py-2 border border-red-900 bg-red-900/20 rounded-full text-sm">
          ✨ Editor de Video en tu Navegador
        </div>

        <h1 className="text-6xl font-bold mb-6">
          Edita tus Videos VHS{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
            Como un Profesional
          </span>
        </h1>

        <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
          Digitaliza y mejora tus recuerdos familiares en VHS. Editor simple para usuarios
          domésticos o herramientas profesionales con IA para creadores de contenido.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/plans')}
            className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-lg font-bold text-lg transition-colors flex items-center gap-2"
          >
            Empezar Ahora →
          </button>
          <button className="border border-gray-700 hover:border-gray-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
            Ver Funciones
          </button>
        </div>
      </section>

      {/* Preview Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-12 border border-gray-700">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-6">📼</div>
            <h3 className="text-2xl font-semibold mb-2">Preview del Editor</h3>
            <p className="text-gray-400">Procesamiento en tiempo real en tu navegador</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold mb-2 text-orange-500">100%</div>
            <div className="text-gray-400">En el Navegador</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2 text-pink-500">0€</div>
            <div className="text-gray-400">Plan Gratis</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2 text-purple-500">Privado</div>
            <div className="text-gray-400">Tus videos no se suben</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2 text-blue-500">Rápido</div>
            <div className="text-gray-400">Sin esperas</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Funciones Principales</h2>

        <div className="grid grid-cols-3 gap-8 mb-12">
          {/* Editor Simple */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <div className="text-5xl mb-6">✂️</div>
            <h3 className="text-2xl font-bold mb-4">Editor Simple</h3>
            <p className="text-gray-400">
              Corta escenas, ajusta volumen y rota videos. Perfecto para videos VHS de hasta 3
              horas.
            </p>
          </div>

          {/* Mejora de Imágenes */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <div className="text-5xl mb-6">🎨</div>
            <h3 className="text-2xl font-bold mb-4">Mejora de Imágenes</h3>
            <p className="text-gray-400">
              Colorea fotos antiguas en B&N y mejora la calidad de tus recuerdos familiares.
            </p>
          </div>

          {/* IA Profesional */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <div className="text-5xl mb-6">🤖</div>
            <h3 className="text-2xl font-bold mb-4">IA Profesional</h3>
            <p className="text-gray-400">
              Upscaling a 4K, autosubtítulos, mejora de audio y mucho más con inteligencia
              artificial.
            </p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-3 gap-8">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <div className="text-4xl mb-4">📼</div>
            <h3 className="text-xl font-bold mb-2">Optimizado para VHS</h3>
            <p className="text-gray-400 text-sm">
              Detecta automáticamente videos VHS (720×576 PAL) y aplica mejoras específicas.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Procesamiento Rápido</h3>
            <p className="text-gray-400 text-sm">
              Videos pequeños se procesan en tu navegador. Sin esperas ni uploads.
            </p>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <div className="text-4xl mb-4">💾</div>
            <h3 className="text-xl font-bold mb-2">Exportación Moderna</h3>
            <p className="text-gray-400 text-sm">
              Convierte tus VHS antiguos a MP4 moderno optimizado para compartir y almacenar.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">Planes para Todos</h2>
        <p className="text-gray-400 text-center mb-16">
          Desde usuarios domésticos hasta profesionales
        </p>

        <div className="grid grid-cols-3 gap-8">
          {/* Plan Basic */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-2">Plan Basic</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">€9.99</span>
              <span className="text-gray-400">/mes</span>
            </div>
            <p className="text-gray-400 mb-6">
              Perfecto para usuarios domésticos que quieren editar videos VHS y recuerdos
              familiares
            </p>
            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Videos hasta 3 horas (VHS completos)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                20 GB de almacenamiento
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Editor simple y fácil
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Mejora de fotos B&N
              </li>
            </ul>
            <button className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-lg font-semibold transition-colors">
              Empezar
            </button>
          </div>

          {/* Plan Premium */}
          <div className="bg-gradient-to-br from-red-900 to-red-800 border-2 border-red-600 rounded-xl p-8 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 px-4 py-1 rounded-full text-sm font-bold">
              POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2">Plan Premium</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">€24.99</span>
              <span className="text-gray-300">/mes</span>
            </div>
            <p className="text-gray-200 mb-6">
              Para creadores de contenido que necesitan funciones profesionales
            </p>
            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Todo del Plan Basic +
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Videos hasta 5 horas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                100 GB almacenamiento
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Editor profesional multicapa
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Transiciones, filtros, efectos
              </li>
            </ul>
            <button className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold transition-colors">
              Empezar Prueba
            </button>
          </div>

          {/* Plan Professional */}
          <div className="bg-gray-800 border border-purple-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-2">Plan Professional</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">€49.99</span>
              <span className="text-gray-400">/mes</span>
            </div>
            <p className="text-gray-400 mb-6">
              Poder completo con todas las funciones IA y sin límites
            </p>
            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Todo del Plan Premium +
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Videos hasta 10 horas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                500 GB almacenamiento
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Todas las funciones IA
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Upscaling 4K/8K con IA
              </li>
            </ul>
            <button className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition-colors">
              Empezar
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎬</span>
                <span className="text-lg font-bold">Media Enhancer</span>
              </div>
              <p className="text-gray-400 text-sm">
                Editor de video profesional en tu navegador. Digitaliza y mejora tus recuerdos VHS.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Funciones</li>
                <li>Empezar</li>
                <li>Precios</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Tecnología</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>✓ FFmpeg.wasm</li>
                <li>✓ Procesamiento Client-Side</li>
                <li>✓ 100% Privado</li>
                <li>✓ Sin Registro Requerido</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
            © 2024 Media Enhancer. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
