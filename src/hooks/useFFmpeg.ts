import { useState, useRef, useCallback } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

interface FFmpegProgress {
  ratio: number;
  time: number;
}

interface UseFFmpegReturn {
  loaded: boolean;
  loading: boolean;
  error: string | null;
  progress: FFmpegProgress | null;
  load: () => Promise<void>;
  executeCommand: (command: string[]) => Promise<Uint8Array | null>;
  writeFile: (name: string, data: File | Blob | Uint8Array | string) => Promise<void>;
  readFile: (name: string) => Promise<Uint8Array>;
  deleteFile: (name: string) => Promise<void>;
  listFiles: () => Promise<string[]>;
}

export const useFFmpeg = (): UseFFmpegReturn => {
  const ffmpegRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<FFmpegProgress | null>(null);

  const load = useCallback(async () => {
    if (loaded || loading) {
      console.log('⚠️ FFmpeg ya está cargado o cargándose, saltando...');
      return;
    }

    // Variable para el timeout debe estar fuera del try
    let loadTimeout: ReturnType<typeof setTimeout> | null = null;

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Iniciando carga de FFmpeg.wasm...');
      console.log('📦 Versión: @ffmpeg/ffmpeg@0.10.1 + @ffmpeg/core@0.10.0');

      // Timeout para evitar bucles infinitos (60 segundos)
      loadTimeout = setTimeout(() => {
        setError('Tiempo de carga agotado. Intenta recargar la página.');
        setLoading(false);
        console.error('❌ Timeout: Carga de FFmpeg excedió 60 segundos');
      }, 60000);

      // API v0.10: createFFmpeg con corePath y workerPath
      const ffmpeg = createFFmpeg({
        log: true,
        corePath: '/ffmpeg/ffmpeg-core.js',
        workerPath: '/ffmpeg/ffmpeg-core.worker.js',
        progress: ({ ratio }) => {
          setProgress({ ratio, time: 0 });
          console.log(`📊 Progreso: ${Math.round(ratio * 100)}%`);
        },
      });

      console.log('⚙️ Iniciando FFmpeg v0.10 (multi-threaded)...');

      await ffmpeg.load();

      console.log('✅ ffmpeg.load() completado exitosamente');

      // Limpiar timeout si la carga fue exitosa
      if (loadTimeout) clearTimeout(loadTimeout);

      ffmpegRef.current = ffmpeg;
      setLoaded(true);
      console.log('✅ FFmpeg.wasm loaded successfully');
    } catch (err) {
      // Limpiar timeout en caso de error
      if (loadTimeout) clearTimeout(loadTimeout);

      console.error('❌ Error capturado en load():', err);
      let errorMessage = 'Failed to load FFmpeg';

      if (err instanceof Error) {
        errorMessage = err.message;

        // Mensajes de error más amigables
        if (err.message.includes('SharedArrayBuffer')) {
          errorMessage = 'Tu navegador no soporta SharedArrayBuffer. Prueba con Chrome o Edge actualizado.';
        } else if (err.message.includes('CORS')) {
          errorMessage = 'Error de CORS. Recarga la página (Ctrl+F5).';
        } else if (err.message.includes('network')) {
          errorMessage = 'Error de red. Verifica tu conexión a internet.';
        }
      }

      setError(errorMessage);
      console.error('❌ Error loading FFmpeg:', err);
    } finally {
      setLoading(false);
    }
  }, [loaded, loading]);

  const executeCommand = useCallback(
    async (command: string[]): Promise<Uint8Array | null> => {
      if (!ffmpegRef.current || !loaded) {
        throw new Error('FFmpeg is not loaded. Call load() first.');
      }

      try {
        setProgress(null);
        // API v0.11: usa run() en lugar de exec()
        await ffmpegRef.current.run(...command);
        return null;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'FFmpeg command failed';
        setError(errorMessage);
        throw err;
      }
    },
    [loaded]
  );

  const writeFile = useCallback(
    async (name: string, data: File | Blob | Uint8Array | string) => {
      if (!ffmpegRef.current || !loaded) {
        throw new Error('FFmpeg is not loaded');
      }

      try {
        let fileData: Uint8Array;

        if (typeof data === 'string') {
          // URL or base64
          fileData = await fetchFile(data);
        } else if (data instanceof Uint8Array) {
          fileData = data;
        } else {
          // File or Blob
          fileData = await fetchFile(data);
        }

        // API v0.11: usa FS('writeFile')
        ffmpegRef.current.FS('writeFile', name, fileData);
      } catch (err) {
        console.error('Error writing file:', err);
        throw err;
      }
    },
    [loaded]
  );

  const readFile = useCallback(
    async (name: string): Promise<Uint8Array> => {
      if (!ffmpegRef.current || !loaded) {
        throw new Error('FFmpeg is not loaded');
      }

      try {
        // API v0.11: usa FS('readFile')
        const data = ffmpegRef.current.FS('readFile', name);
        return data as Uint8Array;
      } catch (err) {
        console.error('Error reading file:', err);
        throw err;
      }
    },
    [loaded]
  );

  const deleteFile = useCallback(
    async (name: string) => {
      if (!ffmpegRef.current || !loaded) {
        throw new Error('FFmpeg is not loaded');
      }

      try {
        // API v0.11: usa FS('unlink')
        ffmpegRef.current.FS('unlink', name);
      } catch (err) {
        // Ignorar errores si el archivo no existe
        console.warn('Error deleting file:', err);
      }
    },
    [loaded]
  );

  const listFiles = useCallback(async (): Promise<string[]> => {
    if (!ffmpegRef.current || !loaded) {
      throw new Error('FFmpeg is not loaded');
    }

    // FFmpeg.wasm no tiene método directo para listar archivos
    // Esta es una implementación placeholder
    return [];
  }, [loaded]);

  return {
    loaded,
    loading,
    error,
    progress,
    load,
    executeCommand,
    writeFile,
    readFile,
    deleteFile,
    listFiles,
  };
};

// Utilidades para operaciones comunes
export const ffmpegUtils = {
  // Convertir Uint8Array a Blob
  toBlobVideo: (data: Uint8Array, mimeType = 'video/mp4'): Blob => {
    return new Blob([data.buffer], { type: mimeType });
  },

  // Convertir Uint8Array a URL descargable
  toObjectURL: (data: Uint8Array, mimeType = 'video/mp4'): string => {
    const blob = new Blob([data.buffer], { type: mimeType });
    return URL.createObjectURL(blob);
  },

  // Detectar si el archivo es grande para procesamiento en navegador
  shouldUseServerProcessing: (fileSizeBytes: number): boolean => {
    const MAX_CLIENT_SIZE = 500 * 1024 * 1024; // 500 MB
    return fileSizeBytes > MAX_CLIENT_SIZE;
  },

  // Estimar duración de video desde metadatos
  getVideoDuration: async (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };

      video.onerror = () => {
        reject(new Error('Failed to load video metadata'));
      };

      video.src = URL.createObjectURL(file);
    });
  },

  // Detectar si es video VHS (PAL 720x576)
  isVHSFormat: async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const isVHS = video.videoWidth === 720 && video.videoHeight === 576;
        resolve(isVHS);
      };

      video.onerror = () => resolve(false);
      video.src = URL.createObjectURL(file);
    });
  },
};
