import { Link } from 'react-router-dom';
import { Check, Video } from 'lucide-react';
import { SignUpButton, SignedIn, SignedOut } from '@clerk/clerk-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    interval: 'mes',
    description: 'Perfecto para probar Media Enhancer',
    features: [
      '5GB de Almacenamiento',
      '10 Proyectos',
      '50 Exportaciones/mes',
      'Videos de hasta 5 min',
      'Herramientas básicas de edición',
      'Marca de agua en exportaciones',
    ],
    cta: 'Comenzar Gratis',
    highlighted: false,
  },
  {
    id: 'creator',
    name: 'Creator',
    price: 14.99,
    interval: 'mes',
    description: 'Para creadores de contenido y equipos pequeños',
    features: [
      '50GB de Almacenamiento',
      '100 Proyectos',
      '500 Exportaciones/mes',
      'Videos de hasta 30 min',
      'Mejoras con IA',
      'Sin marca de agua',
      'Renderizado prioritario',
    ],
    cta: 'Comenzar Prueba Gratis',
    highlighted: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 49.99,
    interval: 'mes',
    description: 'Para profesionales y agencias',
    features: [
      '500GB de Almacenamiento',
      'Proyectos Ilimitados',
      'Exportaciones Ilimitadas',
      'Videos de hasta 2 horas',
      'Funciones IA Avanzadas',
      'Sin marca de agua',
      'Soporte prioritario',
      'Colaboración en equipo',
      'Acceso API',
    ],
    cta: 'Comenzar Prueba Gratis',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <Video className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold">Media Enhancer</h1>
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/" className="hover:text-blue-400 transition">
            Inicio
          </Link>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                Comenzar
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link to="/dashboard" className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
              Panel
            </Link>
          </SignedIn>
        </nav>
      </header>

      {/* Pricing Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4">Precios Simples y Transparentes</h2>
          <p className="text-xl text-gray-300">
            Elige el plan que se adapte a tus necesidades. Actualiza o cambia en cualquier momento.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-blue-600 to-blue-700 transform scale-105 shadow-2xl'
                  : 'bg-gray-800'
              }`}
            >
              {plan.highlighted && (
                <div className="text-center mb-4">
                  <span className="bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                    MÁS POPULAR
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-300 mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">${plan.price}</span>
                <span className="text-gray-300">/{plan.interval}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      plan.highlighted
                        ? 'bg-white text-blue-600 hover:bg-gray-100'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  to="/dashboard"
                  className={`block w-full py-3 rounded-lg font-semibold text-center transition ${
                    plan.highlighted
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {plan.id === 'starter' ? 'Plan Actual' : 'Actualizar Ahora'}
                </Link>
              </SignedIn>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 mt-20">
        <p>&copy; 2024 Media Enhancer. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
