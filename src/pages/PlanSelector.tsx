import React from 'react';
import { useNavigate } from 'react-router-dom';

const PlanSelector: React.FC = () => {
  const navigate = useNavigate();

  const selectPlan = (plan: 'basic' | 'premium' | 'professional') => {
    // Store selected plan in localStorage
    localStorage.setItem('selectedPlan', plan);

    // Navigate to appropriate dashboard
    if (plan === 'basic') {
      navigate('/dashboard/basic');
    } else {
      navigate('/dashboard/pro');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">🎬</span>
            <h1 className="text-3xl font-bold">Media Enhancer</h1>
          </div>
          <p className="text-gray-400 text-lg">Selecciona un plan para acceder al demo</p>
        </div>

        {/* Plans */}
        <div className="space-y-6">
          {/* Plan Basic */}
          <button
            onClick={() => selectPlan('basic')}
            className="w-full bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl p-8 text-left transition-all"
          >
            <h2 className="text-2xl font-bold mb-2">Plan Basic (€9.99/mes)</h2>
            <p className="text-gray-400 mb-4">Dashboard Simple - Perfecto para VHS caseros</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Editor simple e intuitivo
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Videos hasta 3 horas (VHS completos)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                20 GB de almacenamiento
              </li>
            </ul>
          </button>

          {/* Plan Premium */}
          <button
            onClick={() => selectPlan('premium')}
            className="w-full bg-gradient-to-br from-red-900 to-red-800 border-2 border-red-600 rounded-xl p-8 text-left relative transition-all hover:scale-[1.02]"
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-600 px-4 py-1 rounded-full text-sm font-bold">
              POPULAR
            </div>
            <h2 className="text-2xl font-bold mb-2">Plan Premium (€24.99/mes)</h2>
            <p className="text-gray-200 mb-4">
              Dashboard Profesional - Creadores de contenido
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Editor profesional multicapa
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                Transiciones, filtros, efectos
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                100 GB de almacenamiento
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-500">🔒</span>
                <span className="text-yellow-500">Funciones IA bloqueadas</span>
              </li>
            </ul>
          </button>

          {/* Plan Professional */}
          <button
            onClick={() => selectPlan('professional')}
            className="w-full bg-gray-800 border border-purple-700 hover:border-purple-600 rounded-xl p-8 text-left transition-all"
          >
            <h2 className="text-2xl font-bold mb-2">Plan Professional (€49.99/mes)</h2>
            <p className="text-gray-400 mb-4">Poder completo con IA - Sin límites</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Todo del Plan Premium +
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Todas las funciones IA desbloqueadas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Upscaling 4K/8K con IA
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                500 GB de almacenamiento
              </li>
            </ul>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanSelector;
