import { useTierAccess } from '../hooks/useTierAccess';
import { SimpleDashboard } from '../components/dashboards/SimpleDashboard';
import { ProDashboard } from '../components/dashboards/ProDashboard';
import { TierSelector } from '../components/TierSelector';

export function DashboardPage() {
  const { tier, loading } = useTierAccess();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Show ProDashboard for professional users */}
      {tier === 'professional' ? <ProDashboard /> : <SimpleDashboard />}

      {/* Tier selector (development only) */}
      <TierSelector />
    </>
  );
}
