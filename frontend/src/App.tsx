import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import LandingPage from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import PricingPage from './pages/PricingPage';
import EditorPage from './pages/EditorPage';

function App() {
  return (
    <SubscriptionProvider>
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
                <DashboardPage />
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
    </SubscriptionProvider>
  );
}

export default App;
