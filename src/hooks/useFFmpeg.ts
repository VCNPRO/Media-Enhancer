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

    const MAX_RETRIES = 3;
    let currentAttempt = 0;

    const attemptLoad = async (): Promise<void> => {
      currentAttempt++;
      console.log(`🔄 Attempting to load FFmpeg.wasm (attempt ${currentAttempt}/${MAX_RETRIES})...`);

      try {
        const ffmpeg = new FFmpeg();

        // Configurar listeners
        ffmpeg.on('log', ({ message }) => {
          console.log('[FFmpeg]:', message);
        });

        ffmpeg.on('progress', ({ progress, time }) => {
          setProgress({ ratio: progress, time });
        });

        // Verificar headers necesarios para SharedArrayBuffer
        if (typeof SharedArrayBuffer === 'undefined') {
          throw new Error(
            'SharedArrayBuffer no está disponible. ' +
            'Tu navegador necesita estar en un contexto seguro (HTTPS) ' +
            'con los headers COOP y COEP configurados correctamente.'
          );
        }

        // Intentar múltiples CDNs para mayor confiabilidad
        const cdnOptions = [
          {
            name: 'unpkg (v0.12.6)',
            baseURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
          },
          {
            name: 'jsdelivr',
            baseURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd',
          },
        ];

        const cdn = cdnOptions[currentAttempt - 1] || cdnOptions[0];
        console.log(`📦 Loading from ${cdn.name}...`);

        // Timeout más largo para usuarios con conexión lenta
        const loadTimeout = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('FFmpeg load timeout - la descarga está tardando demasiado'));
          }, 60000); // 60 segundos
        });

        const loadPromise = ffmpeg.load({
          coreURL: await toBlobURL(`${cdn.baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${cdn.baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        await Promise.race([loadPromise, loadTimeout]);

        ffmpegRef.current = ffmpeg;
        setLoaded(true);
        setError(null);
        console.log('✅ FFmpeg.wasm loaded successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load FFmpeg';
        console.error(`❌ Error loading FFmpeg (attempt ${currentAttempt}):`, errorMessage);

        // Si no es el último intento, reintentar
        if (currentAttempt < MAX_RETRIES) {
          console.log(`⏳ Retrying in 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return attemptLoad();
        } else {
          // Último intento falló
          const detailedError =
            `No se pudo cargar FFmpeg.wasm después de ${MAX_RETRIES} intentos.\n\n` +
            `Error: ${errorMessage}\n\n` +
            `Posibles soluciones:\n` +
            `• Verifica tu conexión a internet\n` +
            `• Recarga la página (Ctrl+R)\n` +
            `• Prueba con otro navegador (Chrome, Firefox, Edge)\n` +
            `• Asegúrate de estar en HTTPS o localhost`;

          setError(detailedError);
          throw new Error(detailedError);
        }
      }
    };

    try {
      setLoading(true);
      setError(null);
      await attemptLoad();
    } catch (err) {
      // Error ya manejado en attemptLoad
      console.error('💥 Failed to load FFmpeg after all retries');
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
