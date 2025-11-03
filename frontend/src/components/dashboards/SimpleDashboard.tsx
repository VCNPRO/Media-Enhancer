import React, { useState } from 'react';
import { Upload, Video, Download, Sparkles, Clock, FileVideo } from 'lucide-react';
import { useTierAccess } from '../../hooks/useTierAccess';

export function SimpleDashboard() {
  const { tier, getTierLimits } = useTierAccess();
  const limits = getTierLimits();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            ¡Bienvenido a Media Enhancer!
          </h1>
          <p className="text-gray-400 text-lg">
            Edita tus videos de forma simple y rápida
          </p>
        </div>

        {/* Plan Badge */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-6 mb-8 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-block bg-blue-500/20 text-blue-300 px-4 py-1 rounded-full text-sm font-semibold mb-2">
                Plan {tier === 'starter' ? 'Starter' : 'Creator'}
              </span>
              <p className="text-gray-300 mt-2">
                📹 Hasta {limits.maxVideoDuration / 60} min de video •
                🎬 Resolución {limits.maxResolution} •
                💾 {limits.storage / (1024 * 1024 * 1024)}GB de almacenamiento
              </p>
            </div>
            {tier !== 'professional' && (
              <button
                onClick={() => (window.location.href = '/pricing')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                ⚡ Mejorar Plan
              </button>
            )}
          </div>
        </div>

        {/* Main Upload Area */}
        <div className="bg-gray-800/50 rounded-2xl p-12 mb-8 border-2 border-dashed border-gray-600 hover:border-blue-500/50 transition-all">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-block p-6 bg-blue-600/20 rounded-full">
                <Upload className="w-12 h-12 text-blue-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Sube tu video</h2>
            <p className="text-gray-400 mb-6">
              Arrastra tu archivo aquí o haz clic para seleccionar
            </p>
            <label className="inline-block">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold cursor-pointer inline-block shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                📁 Seleccionar Video
              </span>
            </label>
            <p className="text-gray-500 text-sm mt-4">
              Formatos soportados: MP4, MOV, AVI • Máx: {limits.maxVideoDuration / 60} minutos
            </p>
          </div>
        </div>

        {/* Quick Actions - Simple Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Action 1: Cortar */}
          <div className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all cursor-pointer group border border-gray-700 hover:border-blue-500/50">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-600/20 rounded-lg group-hover:bg-blue-600/30 transition-all">
                <Video className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold ml-3">Cortar Video</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Recorta y ajusta tus videos de forma sencilla
            </p>
          </div>

          {/* Action 2: Mejorar */}
          <div className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all cursor-pointer group border border-gray-700 hover:border-purple-500/50">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-600/20 rounded-lg group-hover:bg-purple-600/30 transition-all">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold ml-3">Mejorar IA</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Mejora automática con inteligencia artificial
            </p>
          </div>

          {/* Action 3: Exportar */}
          <div className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all cursor-pointer group border border-gray-700 hover:border-green-500/50">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-600/20 rounded-lg group-hover:bg-green-600/30 transition-all">
                <Download className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold ml-3">Descargar</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Exporta tu video listo para compartir
            </p>
          </div>
        </div>

        {/* Recent Videos */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-400" />
              Videos Recientes
            </h3>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
              Ver todos →
            </button>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-gray-700/30 rounded-full mb-4">
              <FileVideo className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400">
              Aún no has subido ningún video
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Sube tu primer video para empezar
            </p>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-start">
            <span className="text-3xl mr-4">💡</span>
            <div>
              <h4 className="font-semibold text-lg mb-2">¿Primera vez usando Media Enhancer?</h4>
              <p className="text-gray-400 text-sm mb-3">
                Te ayudamos a empezar en 3 pasos simples:
              </p>
              <ol className="list-decimal list-inside text-gray-300 text-sm space-y-1">
                <li>Sube tu video desde tu ordenador</li>
                <li>Selecciona qué quieres hacer (cortar, mejorar, etc.)</li>
                <li>Descarga tu video editado</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
