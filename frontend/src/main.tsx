import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Componente de error si falta la Clerk Key
function MissingEnvError() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#111827',
      color: '#fff',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
        backgroundColor: '#1f2937',
        padding: '3rem',
        borderRadius: '1rem',
        border: '2px solid #ef4444'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ef4444' }}>
          ⚠️ Configuración Requerida
        </h1>
        <p style={{ fontSize: '1.125rem', marginBottom: '1.5rem', color: '#d1d5db' }}>
          Falta configurar la variable de entorno:
        </p>
        <code style={{
          display: 'block',
          backgroundColor: '#111827',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: '#60a5fa'
        }}>
          VITE_CLERK_PUBLISHABLE_KEY
        </code>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
          Configura esta variable en tu dashboard de Vercel para habilitar la autenticación.
        </p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {!CLERK_PUBLISHABLE_KEY ? (
      <MissingEnvError />
    ) : (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ClerkProvider>
    )}
  </React.StrictMode>
);
