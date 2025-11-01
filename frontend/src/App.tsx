import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PricingPage from './pages/PricingPage';
import EditorPage from './pages/EditorPage';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <>
            <SignedIn>
              <Dashboard />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />
      <Route
        path="/editor/:projectId?"
        element={
          <>
            <SignedIn>
              <EditorPage />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
