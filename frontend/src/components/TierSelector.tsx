import { useState } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useUser } from '@clerk/clerk-react';
import { Settings, X } from 'lucide-react';

export function TierSelector() {
  const { tier, refreshSubscription } = useSubscription();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const changeTier = async (newTier: 'starter' | 'creator' | 'professional') => {
    if (!user) return;

    try {
      setLoading(true);

      // Guardar en localStorage (desarrollo)
      localStorage.setItem(`tier_${user.id}`, newTier);

      // Refrescar el contexto
      await refreshSubscription();

      setIsOpen(false);
    } catch (error) {
      console.error('Error changing tier:', error);
      alert('Error al cambiar el tier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg z-50 transition-all transform hover:scale-110"
        title="Cambiar Tier (Desarrollo)"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Selector de Tier</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              Tier actual: <span className="font-semibold text-blue-400">{tier}</span>
            </p>

            <p className="text-yellow-400 text-sm mb-6 bg-yellow-900/20 p-3 rounded">
              🔧 Modo de desarrollo: Cambia de tier para probar los diferentes dashboards (se guarda en tu navegador)
            </p>

            <div className="space-y-3">
              <button
                onClick={() => changeTier('starter')}
                disabled={loading || tier === 'starter'}
                className={`w-full p-4 rounded-lg font-semibold transition-all ${
                  tier === 'starter'
                    ? 'bg-blue-600 text-white border-2 border-blue-400'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                } disabled:opacity-50`}
              >
                <div className="text-left">
                  <div className="font-bold">Starter</div>
                  <div className="text-sm text-gray-300">Dashboard simple</div>
                </div>
              </button>

              <button
                onClick={() => changeTier('creator')}
                disabled={loading || tier === 'creator'}
                className={`w-full p-4 rounded-lg font-semibold transition-all ${
                  tier === 'creator'
                    ? 'bg-blue-600 text-white border-2 border-blue-400'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                } disabled:opacity-50`}
              >
                <div className="text-left">
                  <div className="font-bold">Creator</div>
                  <div className="text-sm text-gray-300">Dashboard simple con más funciones</div>
                </div>
              </button>

              <button
                onClick={() => changeTier('professional')}
                disabled={loading || tier === 'professional'}
                className={`w-full p-4 rounded-lg font-semibold transition-all ${
                  tier === 'professional'
                    ? 'bg-purple-600 text-white border-2 border-purple-400'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                } disabled:opacity-50`}
              >
                <div className="text-left">
                  <div className="font-bold flex items-center">
                    Professional
                    <span className="ml-2 text-xs bg-purple-500 px-2 py-0.5 rounded">PRO</span>
                  </div>
                  <div className="text-sm text-gray-300">Dashboard profesional completo</div>
                </div>
              </button>
            </div>

            {loading && (
              <div className="mt-4 text-center text-gray-400 text-sm">
                Cambiando tier...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
