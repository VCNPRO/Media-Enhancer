import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnhancementPanel } from '../../components/EnhancementPanel';
import type { MediaFile, EnhancementResult } from '../../types';

export const GeminiEnhancement: React.FC = () => {
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const type = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('audio/')
      ? 'audio'
      : 'video';

    // Solo permitir imágenes y audio
    if (type === 'video') {
      alert('Este panel solo admite imágenes y audio. Para videos, usa el Editor de Video.');
      return;
    }

    setMediaFile({
      file,
      name: file.name,
      url,
      type,
    });
  };

  const handleEnhancementComplete = (result: EnhancementResult) => {
    console.log('Enhancement completed:', result);
    // Aquí se podría guardar en el historial
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
                <span className="text-3xl">✨</span>
                <div>
                  <h1 className="text-2xl font-bold">Mejora con IA</h1>
                  <p className="text-sm text-gray-400">
                    Mejora la calidad de tus imágenes y audios con Gemini AI
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {!mediaFile ? (
          <div className="bg-gray-800 p-8 rounded-xl border-2 border-dashed border-gray-600 text-center">
            <div className="text-6xl mb-4">🖼️</div>
            <h2 className="text-2xl font-bold mb-4">Selecciona un archivo</h2>
            <p className="text-gray-400 mb-6">
              Sube una imagen para mejorar su calidad o colorearla, o un audio para limpiarlo
            </p>
            <label className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition cursor-pointer">
              Seleccionar Imagen o Audio
              <input
                type="file"
                accept="image/*,audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <div className="mt-6 text-sm text-gray-500">
              <p>Formatos soportados:</p>
              <p>Imágenes: JPG, PNG, GIF, WebP</p>
              <p>Audio: MP3, WAV, OGG, M4A</p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Preview */}
            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Archivo Original</h3>
                  <button
                    onClick={() => setMediaFile(null)}
                    className="text-sm text-red-500 hover:text-red-400"
                  >
                    Cambiar
                  </button>
                </div>

                {mediaFile.type === 'image' && (
                  <img
                    src={mediaFile.url}
                    alt={mediaFile.name}
                    className="w-full rounded-lg"
                  />
                )}

                {mediaFile.type === 'audio' && (
                  <div className="py-8">
                    <div className="text-6xl text-center mb-4">🎵</div>
                    <audio src={mediaFile.url} controls className="w-full" />
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-400">
                  <p className="font-semibold text-gray-300">{mediaFile.name}</p>
                  <p className="capitalize">{mediaFile.type}</p>
                </div>
              </div>
            </div>

            {/* Enhancement Panel */}
            <div className="bg-gray-800 rounded-xl border border-gray-700">
              <EnhancementPanel
                mediaFile={mediaFile}
                onEnhancementComplete={handleEnhancementComplete}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
