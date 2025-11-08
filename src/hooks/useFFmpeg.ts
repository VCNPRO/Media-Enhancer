import { useState, useRef, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

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
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<FFmpegProgress | null>(null);

  const load = useCallback(async () => {
    if (loaded || loading) return;

    try {
      setLoading(true);
      setError(null);

      const ffmpeg = new FFmpeg();

      // Configurar listeners
      ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]:', message);
      });

      ffmpeg.on('progress', ({ progress, time }) => {
        setProgress({ ratio: progress, time });
      });

      // Cargar FFmpeg desde CDN
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });

      ffmpegRef.current = ffmpeg;
      setLoaded(true);
      console.log('✅ FFmpeg.wasm loaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load FFmpeg';
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
        await ffmpegRef.current.exec(command);
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

        await ffmpegRef.current.writeFile(name, fileData);
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
        const data = await ffmpegRef.current.readFile(name);
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
        await ffmpegRef.current.deleteFile(name);
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
