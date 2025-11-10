import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// 🚀 Cargar manualmente variables del .env.development o .env
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  console.log('🌍 Variable cargada manualmente:', env.VITE_BACKEND_URL);

  return {
    plugins: [react()],
    define: {
      'process.env': env,
    },
    server: {
      port: 5173,
    },
  };
});