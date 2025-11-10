import React from 'react';
import { Link } from 'react-router-dom';
import { FileUpload } from '../../frontend/src/components/FileUpload';

export const CloudUpload: React.FC = () => {
  const handleUploadSuccess = (data: any) => {
    console.log('Upload exitoso:', data);
    // TODO: Aquí podrías redirigir o mostrar el resultado
  };

  const handleUploadError = (error: Error) => {
    console.error('Error en upload:', error);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-gray-400 hover:text-white transition"
              >
                ← Volver
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-3xl">☁️</span>
                <div>
                  <h1 className="text-2xl font-bold">Procesamiento en la Nube</h1>
                  <p className="text-sm text-gray-400">
                    Sube videos grandes (hasta 6GB) para procesarlos en el servidor
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Info Banner */}
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <span className="text-4xl">ℹ️</span>
            <div>
              <h2 className="text-xl font-bold mb-2">Sistema de Procesamiento Híbrido</h2>
              <div className="text-gray-300 space-y-2">
                <p>
                  <strong className="text-white">Videos pequeños (&lt;50MB):</strong> Usa el{' '}
                  <Link to="/editor/new" className="text-blue-400 hover:underline">
                    Editor Básico
                  </Link>{' '}
                  para procesamiento instantáneo en tu navegador.
                </p>
                <p>
                  <strong className="text-white">Videos grandes (50MB - 6GB):</strong> Usa esta
                  página para subirlos al servidor y procesarlos en la nube con mayor capacidad.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="text-4xl mb-3">📤</div>
            <h3 className="text-lg font-bold mb-2">Upload Hasta 6GB</h3>
            <p className="text-gray-400 text-sm">
              Sube videos grandes sin limitaciones del navegador
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-bold mb-2">Procesamiento Potente</h3>
            <p className="text-gray-400 text-sm">
              Aprovecha la potencia de los servidores en la nube
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="text-lg font-bold mb-2">IA Avanzada</h3>
            <p className="text-gray-400 text-sm">
              Acceso a modelos de IA para análisis y mejora
            </p>
          </div>
        </div>

        {/* Upload Component */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            maxSizeMB={6144} // 6GB
            acceptedTypes={[
              'video/mp4',
              'video/mpeg',
              'video/quicktime',
              'video/x-msvideo',
              'audio/mpeg',
              'audio/wav',
              'image/jpeg',
              'image/png',
            ]}
          />
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-800/50 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Cómo funciona</h3>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start gap-3">
              <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                1
              </span>
              <span>Selecciona tu archivo de video (hasta 6GB)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                2
              </span>
              <span>El archivo se subirá de forma segura a nuestros servidores</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                3
              </span>
              <span>
                El video será procesado en la nube y recibirás una notificación cuando esté listo
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                4
              </span>
              <span>Descarga el resultado desde tu panel de proyectos</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
