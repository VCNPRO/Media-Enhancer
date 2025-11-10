import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface PhotoState {
  file: File;
  url: string;
  name: string;
  size: number;
  width: number;
  height: number;
}

type EnhancementType = 'colorize' | 'upscale' | 'denoise' | 'restore';

export const EnhancePhoto: React.FC = () => {
  const [photo, setPhoto] = useState<PhotoState | null>(null);
  const [activeEnhancement, setActiveEnhancement] = useState<EnhancementType>('colorize');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [enhancedPhotoUrl, setEnhancedPhotoUrl] = useState<string | null>(null);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      setPhoto({
        file,
        url,
        name: file.name,
        size: file.size,
        width: img.width,
        height: img.height,
      });
    };

    img.src = url;
  };

  const handleEnhance = async () => {
    if (!photo) return;

    setProcessing(true);
    setProgress(0);

    // Simulación de procesamiento (aquí iría la lógica real)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setProcessing(false);
          // Por ahora, usar la misma imagen
          setEnhancedPhotoUrl(photo.url);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleDownload = () => {
    if (!enhancedPhotoUrl) return;

    const a = document.createElement('a');
    a.href = enhancedPhotoUrl;
    a.download = `enhanced_${photo?.name || 'photo.jpg'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetEditor = () => {
    if (photo) {
      URL.revokeObjectURL(photo.url);
    }
    if (enhancedPhotoUrl && enhancedPhotoUrl !== photo?.url) {
      URL.revokeObjectURL(enhancedPhotoUrl);
    }
    setPhoto(null);
    setEnhancedPhotoUrl(null);
    setProgress(0);
  };

  if (!photo) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link to="/dashboard" className="flex items-center gap-2 hover:text-red-500 transition">
              <span>←</span>
              <span>Volver al Dashboard</span>
            </Link>
            <h1 className="text-xl font-bold">Mejorar Foto</h1>
            <div className="w-32"></div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Sube tu Foto</h2>
            <p className="text-gray-400">
              Colorea fotos antiguas en B&N, mejora la calidad, restaura fotos dañadas
            </p>
          </div>

          {/* File Upload */}
          <label className="block w-full cursor-pointer">
            <div className="border-2 border-dashed border-gray-600 hover:border-red-500 rounded-xl p-12 text-center transition-all bg-gray-800/50">
              <div className="text-6xl mb-4">🖼️</div>
              <p className="text-xl font-semibold mb-2">Arrastra tu foto aquí</p>
              <p className="text-gray-400 mb-4">o haz clic para seleccionar</p>
              <div className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition">
                Seleccionar Foto
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Formatos: JPG, PNG, BMP, TIFF • Máx: 50MB
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelected}
              className="hidden"
            />
          </label>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-bold mb-2">Colorización IA</h3>
              <p className="text-sm text-gray-400">
                Convierte fotos B&N en color automáticamente con inteligencia artificial
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="text-3xl mb-3">⬆️</div>
              <h3 className="font-bold mb-2">Upscaling</h3>
              <p className="text-sm text-gray-400">
                Aumenta la resolución sin perder calidad. SD → HD → 4K
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="font-bold mb-2">Reducción de Ruido</h3>
              <p className="text-sm text-gray-400">
                Elimina el grano y artefactos de fotos antiguas o escaneadas
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <div className="text-3xl mb-3">🔧</div>
              <h3 className="font-bold mb-2">Restauración</h3>
              <p className="text-sm text-gray-400">
                Repara fotos dañadas, rasguños, manchas y decoloración
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={resetEditor} className="flex items-center gap-2 hover:text-red-500 transition">
            <span>←</span>
            <span>Cambiar Foto</span>
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold truncate max-w-md" title={photo.name}>
              {photo.name}
            </h1>
            <p className="text-sm text-gray-400">
              {photo.width}x{photo.height} • {(photo.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Link to="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
            Guardar y Salir
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-[1fr,400px] gap-6">
        {/* Left: Preview */}
        <div className="space-y-6">
          {/* Comparison View */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Original */}
              <div className="relative group">
                <div className="absolute top-2 left-2 bg-gray-900/90 px-3 py-1 rounded text-sm font-semibold z-10">
                  Original
                </div>
                <img
                  src={photo.url}
                  alt="Original"
                  className="w-full h-auto max-h-[600px] object-contain bg-gray-900"
                />
              </div>

              {/* Enhanced */}
              <div className="relative group">
                <div className="absolute top-2 left-2 bg-red-600/90 px-3 py-1 rounded text-sm font-semibold z-10">
                  Mejorada
                </div>
                {enhancedPhotoUrl ? (
                  <img
                    src={enhancedPhotoUrl}
                    alt="Enhanced"
                    className="w-full h-auto max-h-[600px] object-contain bg-gray-900"
                  />
                ) : (
                  <div className="w-full h-[400px] flex items-center justify-center bg-gray-900 text-gray-600">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎨</div>
                      <p>Aplica una mejora para ver el resultado</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Processing Progress */}
          {processing && (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                  <span className="font-semibold">Procesando foto...</span>
                </div>
                <span className="text-sm text-gray-400">{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Result Actions */}
          {enhancedPhotoUrl && !processing && (
            <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-400 mb-1">✅ Foto mejorada correctamente</p>
                  <p className="text-sm text-gray-300">Puedes descargarla o aplicar más mejoras</p>
                </div>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition"
                >
                  💾 Descargar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Tools */}
        <div className="space-y-6">
          {/* Enhancement Options */}
          <div className="bg-gray-800 rounded-lg p-1 grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveEnhancement('colorize')}
              className={`py-2 rounded font-semibold transition ${
                activeEnhancement === 'colorize' ? 'bg-red-600' : 'bg-transparent hover:bg-gray-700'
              }`}
            >
              🎨 Colorear
            </button>
            <button
              onClick={() => setActiveEnhancement('upscale')}
              className={`py-2 rounded font-semibold transition ${
                activeEnhancement === 'upscale' ? 'bg-red-600' : 'bg-transparent hover:bg-gray-700'
              }`}
            >
              ⬆️ Upscale
            </button>
            <button
              onClick={() => setActiveEnhancement('denoise')}
              className={`py-2 rounded font-semibold transition ${
                activeEnhancement === 'denoise' ? 'bg-red-600' : 'bg-transparent hover:bg-gray-700'
              }`}
            >
              ✨ Denoise
            </button>
            <button
              onClick={() => setActiveEnhancement('restore')}
              className={`py-2 rounded font-semibold transition ${
                activeEnhancement === 'restore' ? 'bg-red-600' : 'bg-transparent hover:bg-gray-700'
              }`}
            >
              🔧 Restaurar
            </button>
          </div>

          {/* Tool Panel */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            {activeEnhancement === 'colorize' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">🎨 Colorización Automática</h3>
                <p className="text-sm text-gray-400">
                  Convierte fotos en blanco y negro a color usando inteligencia artificial.
                  Perfecto para fotos antiguas y recuerdos familiares.
                </p>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <p className="text-sm mb-2">⚙️ Configuración:</p>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Detección automática de B&N</li>
                    <li>• Colores naturales y realistas</li>
                    <li>• Procesamiento con IA</li>
                  </ul>
                </div>
                <button
                  onClick={handleEnhance}
                  disabled={processing}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold transition"
                >
                  {processing ? 'Procesando...' : '🎨 Colorear Foto'}
                </button>
              </div>
            )}

            {activeEnhancement === 'upscale' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">⬆️ Upscaling con IA</h3>
                <p className="text-sm text-gray-400">
                  Aumenta la resolución de tu foto sin perder calidad usando inteligencia artificial.
                </p>
                <div className="space-y-2">
                  <label className="block">
                    <span className="text-sm text-gray-400">Factor de escala:</span>
                    <select className="w-full mt-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg">
                      <option>2x (Recomendado)</option>
                      <option>4x (Alta calidad)</option>
                      <option>8x (Máxima calidad)</option>
                    </select>
                  </label>
                </div>
                <button
                  onClick={handleEnhance}
                  disabled={processing}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold transition"
                >
                  {processing ? 'Procesando...' : '⬆️ Aumentar Resolución'}
                </button>
              </div>
            )}

            {activeEnhancement === 'denoise' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">✨ Reducción de Ruido</h3>
                <p className="text-sm text-gray-400">
                  Elimina el grano, ruido y artefactos de compresión de tus fotos.
                </p>
                <div className="space-y-2">
                  <label className="block">
                    <span className="text-sm text-gray-400">Intensidad:</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="50"
                      className="w-full mt-1"
                    />
                  </label>
                </div>
                <button
                  onClick={handleEnhance}
                  disabled={processing}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold transition"
                >
                  {processing ? 'Procesando...' : '✨ Reducir Ruido'}
                </button>
              </div>
            )}

            {activeEnhancement === 'restore' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">🔧 Restauración</h3>
                <p className="text-sm text-gray-400">
                  Repara fotos dañadas, elimina rasguños, manchas y decoloración.
                </p>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                    <span>Reparar rasguños</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                    <span>Eliminar manchas</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5" />
                    <span>Corregir decoloración</span>
                  </label>
                </div>
                <button
                  onClick={handleEnhance}
                  disabled={processing}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold transition"
                >
                  {processing ? 'Procesando...' : '🔧 Restaurar Foto'}
                </button>
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-sm">
            <h4 className="font-bold mb-2">💡 Consejos</h4>
            <ul className="space-y-1 text-gray-400">
              <li>• Usa imágenes de alta calidad para mejores resultados</li>
              <li>• El procesamiento puede tardar 30-60 segundos</li>
              <li>• Prueba diferentes mejoras para comparar</li>
              <li>• La IA funciona mejor con fotos de rostros</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
