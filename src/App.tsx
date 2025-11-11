import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PlanSelector from './pages/PlanSelector';
import { DashboardBasic } from './pages/DashboardBasic';
import { DashboardPro } from './pages/DashboardPro';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Plan Selection */}
        <Route path="/plans" element={<PlanSelector />} />

        {/* Dashboard Basic (Plan Basic) */}
        <Route path="/dashboard/basic" element={<DashboardBasic />} />

        {/* Dashboard Pro (Plan Premium & Professional) */}
        <Route path="/dashboard/pro" element={<DashboardPro />} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
