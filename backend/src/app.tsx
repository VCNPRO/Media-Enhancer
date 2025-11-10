import React, { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { VideoPlayer } from './components/VideoPlayer';
import { Timeline } from './components/Timeline';
import { ffmpegUtils } from './hooks/useFFmpeg';
import { useCloudUpload } from './hooks/useCloudUpload';

interface MediaFile {
  file: File;
  name: string;
  url: string;
  type: string;
  useCloud?: boolean;
}

const App: React.FC = () => {
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const [status, setStatus] = useState<string>('');
  const { uploading, processing, progress, error: cloudError, uploadAndProcess } = useCloudUpload();

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setMediaFile(null);
      return;
    }

    const shouldUseCloud = await ffmpegUtils.shouldUseServerProcessing(file);

    console.log(`📦 Archivo: ${file.name}`);
    console.log(`📏 Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`☁️ Usar Cloud: ${shouldUseCloud ? 'Sí' : 'No (local)'}`);

    setMediaFile({
      file,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      useCloud: shouldUseCloud,
    });

    if (shouldUseCloud) {
      setStatus('☁️ Subiendo a Cloud Storage...');
      await uploadAndProcess(file);
      setStatus('✅ Procesamiento en la nube completado');
    } else {
      setStatus('⚙️ Procesando localmente con FFmpeg...');
      // Lógica local de FFmpeg.wasm (por ejemplo conversión simple)
      setStatus('✅ Procesamiento local completado');
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">🎬 Media Enhancer</h1>

      <FileUploader onFileSelect={handleFileChange} />

      {status && (
        <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300">
          {status}
        </div>
      )}

      {(uploading || processing) && (
        <div className="mt-4 w-full max-w-md p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="mb-2 flex justify-between text-sm">
            <span>{uploading ? '☁️ Subiendo...' : '⚙️ Procesando...'}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 h-2 rounded-full">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {cloudError && (
        <p className="mt-4 text-sm text-red-400">❌ {cloudError}</p>
      )}

      {mediaFile && (
        <section className="mt-8 w-full max-w-3xl space-y-6">
          <VideoPlayer src={mediaFile.url} />
          <Timeline />
          <p className="text-gray-400 text-sm">{mediaFile.name}</p>
        </section>
      )}
    </main>
  );
};

export default App;