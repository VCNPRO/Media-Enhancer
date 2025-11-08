import React, { useCallback, useState } from 'react';
import { ffmpegUtils } from '../hooks/useFFmpeg';
import { formatBytes, formatDuration } from '../config/plans';

interface FileUploaderProps {
  onFileSelected: (file: File, metadata: VideoMetadata) => void;
  accept?: string;
  maxSize?: number; // bytes
}

export interface VideoMetadata {
  name: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  isVHS: boolean;
  shouldUseServerProcessing: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelected,
  accept = 'video/*',
  maxSize,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeVideo = async (file: File): Promise<VideoMetadata> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        const metadata: VideoMetadata = {
          name: file.name,
          size: file.size,
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
          isVHS: video.videoWidth === 720 && video.videoHeight === 576,
          shouldUseServerProcessing: ffmpegUtils.shouldUseServerProcessing(file.size),
        };

        window.URL.revokeObjectURL(video.src);
        resolve(metadata);
      };

      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        reject(new Error('No se pudo analizar el video'));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsAnalyzing(true);

      try {
        // Validar tipo de archivo
        if (!file.type.startsWith('video/')) {
          throw new Error('Por favor, selecciona un archivo de video válido');
        }

        // Validar tamaño máximo
        if (maxSize && file.size > maxSize) {
          throw new Error(
            `El archivo es demasiado grande. Máximo: ${formatBytes(maxSize)}`
          );
        }

        // Analizar metadata del video
        const metadata = await analyzeVideo(file);

        // Callback con el archivo y metadata
        onFileSelected(file, metadata);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al procesar el archivo';
        setError(errorMessage);
        console.error('Error processing file:', err);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [onFileSelected, maxSize]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all
          ${
            isDragging
              ? 'border-red-500 bg-red-500/10 scale-105'
              : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
          }
          ${isAnalyzing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isAnalyzing}
        />

        {isAnalyzing ? (
          <div className="space-y-4">
            <div className="text-6xl animate-bounce">📹</div>
            <p className="text-xl font-semibold">Analizando video...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-6xl">
              {isDragging ? '📥' : '📼'}
            </div>
            <div>
              <p className="text-xl font-semibold mb-2">
                {isDragging ? '¡Suelta el archivo aquí!' : 'Arrastra tu video aquí'}
              </p>
              <p className="text-gray-400 mb-4">o haz clic para seleccionar</p>
              <div className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition">
                Seleccionar Video
              </div>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Formatos soportados: MP4, AVI, MOV, MKV, WebM</p>
              {maxSize && <p>Tamaño máximo: {formatBytes(maxSize)}</p>}
              <p className="text-yellow-500 font-semibold">
                📼 Optimizado para videos VHS (720x576 PAL)
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <p className="text-red-200 flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </p>
        </div>
      )}
    </div>
  );
};
