import React from 'react';
import { Link } from 'react-router-dom';
import { PLANS } from '../config/plans';

export const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 hover:text-red-500 transition">
              <span className="text-2xl">🎬</span>
              <h1 className="text-2xl font-bold">Media Enhancer</h1>
            </Link>
            <div className="flex gap-4">
              <Link
                to="/dashboard"
                className="px-4 py-2 text-gray-300 hover:text-white transition"
              >
                Dashboard
              </Link>
              <Link
                to="/demo-setup"
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
              >
                Empezar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          Elige el Plan{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
            Perfecto para Ti
          </span>
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Desde usuarios domésticos digitalizando VHS hasta profesionales con funciones IA avanzadas
        </p>

        {/* Toggle anual/mensual (placeholder) */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className="text-gray-400">Mensual</span>
          <button className="relative w-14 h-7 bg-gray-700 rounded-full transition">
            <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition"></div>
          </button>
          <span className="text-gray-400">
            Anual <span className="text-green-500 font-semibold">(Ahorra 20%)</span>
          </span>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Plan Basic */}
          <div className="bg-gray-800 rounded-2xl border-2 border-gray-700 hover:border-gray-600 transition-all hover:scale-105 transform">
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">📼</div>
                <h3 className="text-2xl font-bold mb-2">{PLANS.basic.name}</h3>
                <div className="text-4xl font-bold mb-2">
                  €{PLANS.basic.price}
                  <span className="text-lg text-gray-400">/mes</span>
                </div>
                <p className="text-gray-400">{PLANS.basic.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Videos hasta 3 horas (VHS completos)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>20 GB de almacenamiento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>5 proyectos simultáneos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Editor simple y fácil</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Cortar, volumen, rotar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Mejoras VHS automáticas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>20 exports/mes</span>
                </li>
              </ul>

              <Link
                to="/demo-setup"
                className="block w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold text-center transition"
              >
                Empezar Basic
              </Link>
            </div>
          </div>

          {/* Plan Premium - DESTACADO */}
          <div className="bg-gradient-to-br from-red-900/50 to-pink-900/50 rounded-2xl border-2 border-red-500 relative transform scale-110 shadow-2xl shadow-red-500/20">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-500 px-6 py-1 rounded-full text-sm font-bold">
              ⭐ MÁS POPULAR
            </div>

            <div className="p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🎬</div>
                <h3 className="text-2xl font-bold mb-2">{PLANS.premium.name}</h3>
                <div className="text-4xl font-bold mb-2">
                  €{PLANS.premium.price}
                  <span className="text-lg text-gray-400">/mes</span>
                </div>
                <p className="text-gray-300">{PLANS.premium.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="font-semibold">Todo del Plan Basic +</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Videos hasta 5 horas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>100 GB almacenamiento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>50 proyectos simultáneos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="font-semibold">Editor profesional multicapa</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Transiciones y filtros avanzados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Chroma key (pantalla verde)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>Títulos animados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-xl">✓</span>
                  <span>100 exports/mes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 text-xl">🔒</span>
                  <span className="text-gray-400">Funciones IA (Professional)</span>
                </li>
              </ul>

              <Link
                to="/demo-setup"
                className="block w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold text-center transition shadow-lg"
              >
                Empezar Premium
              </Link>
            </div>
          </div>

          {/* Plan Professional */}
          <div className="bg-gray-800 rounded-2xl border-2 border-purple-500 hover:border-purple-400 transition-all hover:scale-105 transform">
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="text-2xl font-bold mb-2">{PLANS.professional.name}</h3>
                <div className="text-4xl font-bold mb-2">
                  €{PLANS.professional.price}
                  <span className="text-lg text-gray-400">/mes</span>
                </div>
                <p className="text-gray-300">{PLANS.professional.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 text-xl">✓</span>
                  <span className="font-semibold">Todo del Plan Premium +</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 text-xl">✓</span>
                  <span>Videos hasta 10 horas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 text-xl">✓</span>
                  <span>500 GB almacenamiento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 text-xl">✓</span>
                  <span>Proyectos ilimitados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 text-xl">✓</span>
                  <span className="font-bold">🤖 TODAS las funciones IA:</span>
                </li>
                <li className="flex items-start gap-2 ml-6">
                  <span className="text-purple-400 text-xl">•</span>
                  <span>Upscaling 4K/8K con IA</span>
                </li>
                <li className="flex items-start gap-2 ml-6">
                  <span className="text-purple-400 text-xl">•</span>
                  <span>Auto-subtítulos + traducción</span>
                </li>
                <li className="flex items-start gap-2 ml-6">
                  <span className="text-purple-400 text-xl">•</span>
                  <span>Mejora de audio con IA</span>
                </li>
                <li className="flex items-start gap-2 ml-6">
                  <span className="text-purple-400 text-xl">•</span>
                  <span>Estabilización inteligente</span>
                </li>
                <li className="flex items-start gap-2 ml-6">
                  <span className="text-purple-400 text-xl">•</span>
                  <span>Corrección de color automática</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-500 text-xl">✓</span>
                  <span>Exports ilimitados</span>
                </li>
              </ul>

              <Link
                to="/demo-setup"
                className="block w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold text-center transition"
              >
                Empezar Professional
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h3 className="text-3xl font-bold text-center mb-12">Comparación Detallada</h3>

        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="text-left p-4 font-bold">Característica</th>
                <th className="text-center p-4 font-bold">Basic</th>
                <th className="text-center p-4 font-bold text-red-400">Premium</th>
                <th className="text-center p-4 font-bold text-purple-400">Professional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr>
                <td className="p-4">Duración máxima video</td>
                <td className="text-center p-4">3 horas</td>
                <td className="text-center p-4">5 horas</td>
                <td className="text-center p-4">10 horas</td>
              </tr>
              <tr className="bg-gray-700/30">
                <td className="p-4">Almacenamiento</td>
                <td className="text-center p-4">20 GB</td>
                <td className="text-center p-4">100 GB</td>
                <td className="text-center p-4">500 GB</td>
              </tr>
              <tr>
                <td className="p-4">Proyectos simultáneos</td>
                <td className="text-center p-4">5</td>
                <td className="text-center p-4">50</td>
                <td className="text-center p-4">Ilimitados</td>
              </tr>
              <tr className="bg-gray-700/30">
                <td className="p-4">Editor multicapa</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4 text-green-500">✓</td>
                <td className="text-center p-4 text-green-500">✓</td>
              </tr>
              <tr>
                <td className="p-4">Transiciones y filtros</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4 text-green-500">✓</td>
                <td className="text-center p-4 text-green-500">✓</td>
              </tr>
              <tr className="bg-gray-700/30">
                <td className="p-4">Funciones IA</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4">❌</td>
                <td className="text-center p-4 text-purple-500 font-bold">✓ Todas</td>
              </tr>
              <tr>
                <td className="p-4">Exports mensuales</td>
                <td className="text-center p-4">20</td>
                <td className="text-center p-4">100</td>
                <td className="text-center p-4">Ilimitados</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h3 className="text-3xl font-bold text-center mb-12">Preguntas Frecuentes</h3>

        <div className="space-y-4">
          <details className="bg-gray-800 rounded-lg border border-gray-700 p-6 group">
            <summary className="font-bold cursor-pointer flex justify-between items-center">
              ¿Puedo cambiar de plan después?
              <span className="text-2xl group-open:rotate-180 transition-transform">›</span>
            </summary>
            <p className="mt-4 text-gray-300">
              Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplicarán
              inmediatamente y se prorratearán en tu próxima factura.
            </p>
          </details>

          <details className="bg-gray-800 rounded-lg border border-gray-700 p-6 group">
            <summary className="font-bold cursor-pointer flex justify-between items-center">
              ¿Cómo funciona el procesamiento en el navegador?
              <span className="text-2xl group-open:rotate-180 transition-transform">›</span>
            </summary>
            <p className="mt-4 text-gray-300">
              Usamos FFmpeg.wasm para procesar videos pequeños directamente en tu navegador.
              Esto significa que tus videos nunca salen de tu computadora, garantizando 100% privacidad.
            </p>
          </details>

          <details className="bg-gray-800 rounded-lg border border-gray-700 p-6 group">
            <summary className="font-bold cursor-pointer flex justify-between items-center">
              ¿Qué pasa con mis videos si cancelo?
              <span className="text-2xl group-open:rotate-180 transition-transform">›</span>
            </summary>
            <p className="mt-4 text-gray-300">
              Tendrás 30 días para descargar todos tus proyectos antes de que se eliminen.
              Siempre podrás exportar tus videos antes de cancelar.
            </p>
          </details>

          <details className="bg-gray-800 rounded-lg border border-gray-700 p-6 group">
            <summary className="font-bold cursor-pointer flex justify-between items-center">
              ¿Hay descuento anual?
              <span className="text-2xl group-open:rotate-180 transition-transform">›</span>
            </summary>
            <p className="mt-4 text-gray-300">
              Sí, al pagar anualmente obtienes un 20% de descuento automático en todos los planes.
            </p>
          </details>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-r from-red-900/50 to-pink-900/50 border-y border-red-500/50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold mb-4">
            ¿Listo para Empezar?
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            Únete a miles de usuarios digitalizando sus recuerdos VHS
          </p>
          <Link
            to="/demo-setup"
            className="inline-block px-8 py-4 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-lg transition shadow-lg hover:scale-105 transform"
          >
            Empezar Ahora - Es Gratis
          </Link>
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
