import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Test } from './Test';
import { Landing } from './pages/Landing';
import { DashboardBasic } from './pages/DashboardBasic';
import { DashboardPro } from './pages/DashboardPro';
import { EditorBasic } from './pages/EditorBasic';
import { Pricing } from './pages/Pricing';
import { EnhancePhoto } from './pages/EnhancePhoto';
import { GeminiAnalysis } from './pages/GeminiAnalysis';
import { GeminiEnhancement } from './pages/GeminiEnhancement';
import { GeminiCreative } from './pages/GeminiCreative';
import { GeminiStudio } from './pages/GeminiStudio';
import { CloudUpload } from './pages/CloudUpload';
import { useUserStore } from './store/userStore';
import { useDashboardType } from './hooks/useFeatureAccess';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Component para proteger rutas que requieren autenticación
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useUserStore((state) => state.user);

  if (!user) {
    // TODO: Redirigir a login cuando Clerk esté implementado
    // Por ahora, creamos un usuario demo
    return <Navigate to="/demo-setup" replace />;
  }

  return <>{children}</>;
};

// Component para redirigir al dashboard correcto según el plan
const DashboardRouter: React.FC = () => {
  const dashboardType = useDashboardType();

  // Redirigir al dashboard apropiado según el tipo
  if (dashboardType === 'basic') {
    return <DashboardBasic />;
  }

  return <DashboardPro />;
};

// Página temporal para setup de usuario demo (mientras implementamos Clerk)
const DemoSetup: React.FC = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const setUsage = useUserStore((state) => state.setUsage);

  const createDemoUser = (planId: 'basic' | 'premium' | 'professional') => {
    setUser({
      id: 'demo-user-' + planId,
      email: `demo-${planId}@example.com`,
      name: 'Usuario Demo',
      planId,
      subscriptionStatus: 'active',
    });

    setUsage({
      storageUsed: 7.5 * 1024 * 1024 * 1024, // 7.5 GB
      projectsCount: 3,
      exportsThisMonth: 5,
      activeProcessingJobs: 0,
    });

    // Redirigir al dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-2xl w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🎬 Media Enhancer</h1>
          <p className="text-gray-400">Selecciona un plan para acceder al demo</p>
        </div>

        <div className="grid gap-4">
          <button
            onClick={() => createDemoUser('basic')}
            className="bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 hover:border-red-500 p-6 rounded-xl text-left transition"
          >
            <h3 className="text-xl font-bold mb-2">Plan Basic (€9.99/mes)</h3>
            <p className="text-gray-400 mb-3">Dashboard Simple - Perfecto para VHS caseros</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ Editor simple e intuitivo</li>
              <li>✓ Videos hasta 3 horas (VHS completos)</li>
              <li>✓ 20 GB de almacenamiento</li>
            </ul>
          </button>

          <button
            onClick={() => createDemoUser('premium')}
            className="bg-gray-800 hover:bg-gray-700 border-2 border-red-500 p-6 rounded-xl text-left transition relative"
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 px-4 py-1 rounded-full text-sm font-bold">
              POPULAR
            </div>
            <h3 className="text-xl font-bold mb-2">Plan Premium (€24.99/mes)</h3>
            <p className="text-gray-400 mb-3">Dashboard Profesional - Creadores de contenido</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ Editor profesional multicapa</li>
              <li>✓ Transiciones, filtros, efectos</li>
              <li>✓ 100 GB de almacenamiento</li>
              <li className="text-yellow-500">🔒 Funciones IA bloqueadas</li>
            </ul>
          </button>

          <button
            onClick={() => createDemoUser('professional')}
            className="bg-gray-800 hover:bg-gray-700 border-2 border-purple-500 p-6 rounded-xl text-left transition"
          >
            <h3 className="text-xl font-bold mb-2">Plan Professional (€49.99/mes)</h3>
            <p className="text-gray-400 mb-3">Poder completo con IA - Sin límites</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ Todo del Plan Premium +</li>
              <li>✓ Todas las funciones IA desbloqueadas</li>
              <li>✓ Upscaling 4K/8K con IA</li>
              <li>✓ 500 GB de almacenamiento</li>
            </ul>
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const user = useUserStore((state) => state.user);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Página de prueba */}
          <Route path="/test" element={<Test />} />

          {/* Página pública */}
          <Route path="/" element={<Landing />} />

          {/* Demo setup (temporal) */}
          <Route path="/demo-setup" element={<DemoSetup />} />

          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          {/* Editor */}
          <Route
            path="/editor/new"
            element={
              <ProtectedRoute>
                <EditorBasic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/:id"
            element={
              <ProtectedRoute>
                <EditorBasic />
              </ProtectedRoute>
            }
          />

          {/* Páginas públicas adicionales */}
          <Route path="/pricing" element={<Pricing />} />

          {/* Herramientas adicionales */}
          <Route
            path="/enhance-photo"
            element={
              <ProtectedRoute>
                <EnhancePhoto />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/audio"
            element={
              <ProtectedRoute>
                <EditorBasic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/rotate"
            element={
              <ProtectedRoute>
                <EditorBasic />
              </ProtectedRoute>
            }
          />

          {/* Herramientas de Gemini AI */}
          <Route
            path="/gemini/analysis"
            element={
              <ProtectedRoute>
                <GeminiAnalysis />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gemini/enhancement"
            element={
              <ProtectedRoute>
                <GeminiEnhancement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gemini/creative"
            element={
              <ProtectedRoute>
                <GeminiCreative />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gemini/studio"
            element={
              <ProtectedRoute>
                <GeminiStudio />
              </ProtectedRoute>
            }
          />

          {/* Procesamiento en la Nube */}
          <Route
            path="/cloud-upload"
            element={
              <ProtectedRoute>
                <CloudUpload />
              </ProtectedRoute>
            }
          />

          {/* Redirigir rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
