import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload';
import { VideoEditor } from '../components/VideoEditor';
import { AnalysisPanel } from '../components/AnalysisPanel';
import { EnhancementPanel } from '../components/EnhancementPanel';
import { CreativeToolsPanel } from '../components/CreativeToolsPanel';
import { Tabs } from '../components/Tabs';
import { useCloudUpload } from '../hooks/useCloudUpload';
import { ffmpegUtils } from '../hooks/useFFmpeg';
import type { MediaFile, AnalysisResult, EnhancementResult, CreativeResult, StoryboardFrame } from '../../types';

const getMediaType = (file: File): 'image' | 'video' | 'audio' => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'video';
};

const EditorBasicPage: React.FC = () => {
  const navigate = useNavigate();
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const [activeTab, setActiveTab] = useState('analysis');

  // Hook para procesamiento en la nube
  const { uploading, processing, progress, error: cloudError, uploadAndProcess } = useCloudUpload();

  const handleFileChange = async (file: File | null) => {
    if (file) {
      const mediaType = getMediaType(file);
      const shouldUseCloud = ffmpegUtils.shouldUseServerProcessing(file.size);

      console.log(`📦 Archivo: ${file.name}`);
      console.log(`📏 Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`☁️ Usar Cloud: ${shouldUseCloud ? 'Sí' : 'No (local)'}`);

      // Crear URL temporal local primero
      const localUrl = URL.createObjectURL(file);

      setMediaFile({
        file,
        name: file.name,
        url: localUrl,
        type: mediaType,
        useCloud: shouldUseCloud,
      });

      // Si es archivo grande, subir a la nube
      if (shouldUseCloud) {
        try {
          console.log('🚀 Subiendo archivo a la nube...');
          const cloudUrl = await uploadAndProcess(file);

          if (cloudUrl) {
            console.log('✅ Archivo subido y procesado en la nube');
            console.log('🔗 URL de la nube:', cloudUrl);

            // Actualizar el mediaFile con la URL de la nube
            setMediaFile(prev => prev ? {
              ...prev,
              url: cloudUrl // Usar URL de Cloud Storage en lugar de blob local
            } : null);

            // Liberar la URL local del blob
            URL.revokeObjectURL(localUrl);
          }
        } catch (error) {
          console.error('❌ Error al subir archivo:', error);
        }
      }
    } else {
      setMediaFile(null);
    }
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    console.log('✅ Análisis completado:', result);
  };

  const handleStoryboardComplete = (result: StoryboardFrame[]) => {
    console.log('✅ Storyboard generado:', result);
  };

  const handleEnhancementComplete = (result: EnhancementResult) => {
    console.log('✅ Mejora completada:', result);
  };

  const handleCreativeComplete = (result: CreativeResult) => {
    console.log('✅ Creativo completado:', result);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/basic')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Volver
            </button>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🎬</span>
              <div>
                <span className="text-xl font-bold">Media Enhancer</span>
                <div className="text-xs text-gray-400">Editor Básico</div>
              </div>
            </div>
          </div>

          {mediaFile && (
            <div className="text-sm text-gray-400">
              <span className="font-semibold text-white">{mediaFile.name}</span>
              <span className="mx-2">•</span>
              <span>{(mediaFile.file.size / 1024 / 1024).toFixed(2)} MB</span>
              {mediaFile.useCloud && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-blue-400">☁️ Procesamiento en nube</span>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* File Upload Section */}
        {!mediaFile && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Sube tu video</h2>
            <p className="text-gray-400 mb-6">
              Archivos hasta 6 GB. Videos grandes se procesarán automáticamente en la nube.
            </p>
            <FileUpload onFileChange={handleFileChange} />
          </div>
        )}

        {/* Uploading Progress */}
        {(uploading || processing) && (
          <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="mb-3 flex justify-between items-center">
              <span className="font-semibold">
                {uploading ? '📤 Subiendo a la nube...' : '⚙️ Procesando...'}
              </span>
              <span className="text-sm text-gray-400">{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Display */}
        {cloudError && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
            ❌ Error: {cloudError}
          </div>
        )}

        {/* Media Preview and Tools */}
        {mediaFile && (
          <div className="space-y-6">
            {/* Video Editor */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Editor de Video</h3>
                <button
                  onClick={() => handleFileChange(null)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Cambiar archivo
                </button>
              </div>
              <VideoEditor
                url={mediaFile.url}
                type={mediaFile.type}
                fileName={mediaFile.name}
                file={mediaFile.file}
              />
            </div>

            {/* Tools Tabs */}
            <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <Tabs
                tabs={[
                  { id: 'analysis', label: '📊 Análisis' },
                  { id: 'enhancement', label: '✨ Mejoras' },
                  { id: 'creative', label: '🎨 Creativas' }
                ]}
                activeTab={activeTab}
                onTabClick={setActiveTab}
              />

              <div className="p-6">
                {activeTab === 'analysis' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Análisis con IA</h3>
                    <p className="text-gray-400 mb-4">
                      Analiza tu video con inteligencia artificial de Gemini para obtener descripciones, transcripciones y más.
                    </p>
                    <AnalysisPanel
                      mediaFile={mediaFile}
                      onAnalysisComplete={handleAnalysisComplete}
                      onStoryboardComplete={handleStoryboardComplete}
                    />
                  </div>
                )}

                {activeTab === 'enhancement' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Mejoras</h3>
                    <p className="text-gray-400 mb-4">
                      Mejora la calidad de tus videos e imágenes con herramientas de IA.
                    </p>
                    <EnhancementPanel
                      mediaFile={mediaFile}
                      onEnhancementComplete={handleEnhancementComplete}
                    />
                  </div>
                )}

                {activeTab === 'creative' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Herramientas Creativas</h3>
                    <p className="text-gray-400 mb-4">
                      Genera contenido creativo a partir de tus videos con IA.
                    </p>
                    <CreativeToolsPanel
                      mediaFile={mediaFile}
                      onCreativeComplete={handleCreativeComplete}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!mediaFile && (
          <div className="mt-12 bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">💡 Consejos para mejores resultados</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Videos de hasta 6 GB se procesan automáticamente en la nube</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Formatos soportados: MP4, AVI, MOV, MKV, WebM</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Optimizado para videos VHS (720x576 PAL)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span>Análisis con IA incluido: descripciones, transcripciones y más</span>
              </li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};

export default EditorBasicPage;
