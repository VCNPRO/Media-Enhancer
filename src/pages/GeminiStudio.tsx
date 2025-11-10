import React from 'react';
import GeminiApp from '../../App';

/**
 * GeminiStudio - Página que integra la aplicación original de Gemini AI
 *
 * Esta página usa el App.tsx del directorio root, que es la aplicación
 * standalone de Gemini que funcionaba perfectamente.
 *
 * Características:
 * - Upload de archivos (imagen, video, audio)
 * - Análisis con Gemini AI
 * - Mejora de medios (colorear imágenes, limpiar audio)
 * - Generación creativa de imágenes
 * - Historial de operaciones
 */
export const GeminiStudio: React.FC = () => {
  return <GeminiApp />;
};
