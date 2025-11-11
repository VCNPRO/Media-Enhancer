import { useState, useRef, useCallback } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import type { FFmpeg } from '@ffmpeg/ffmpeg';

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
    if (loaded || loading) {
      console.log('✅ FFmpeg ya está cargado');
      return;
    }

    let loadTimeout: ReturnType<typeof setTimeout> | null = null;

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Cargando FFmpeg.wasm desde archivos locales...');

      loadTimeout = setTimeout(() => {
        setError('⏱️ Timeout cargando FFmpeg. Recarga la página.');
        setLoading(false);
        console.error('❌ Timeout: FFmpeg excedió 60 segundos');
      }, 60000);

      // API v0.10: createFFmpeg con corePath
      const ffmpeg = createFFmpeg({
        log: true,
        corePath: '/ffmpeg/ffmpeg-core.js',
        progress: ({ ratio }) => {
          setProgress({ ratio, time: 0 });
          console.log(`📊 Progreso: ${Math.round(ratio * 100)}%`);
        },
      });

      await ffmpeg.load();

      ffmpegRef.current = ffmpeg;

      if (loadTimeout) {
        clearTimeout(loadTimeout);
      }

      setLoaded(true);
      setLoading(false);
      console.log('✅ FFmpeg.wasm cargado exitosamente');
    } catch (err: any) {
      if (loadTimeout) {
        clearTimeout(loadTimeout);
      }
      console.error('❌ Error cargando FFmpeg:', err);
      setError(err.message || 'Error desconocido cargando FFmpeg');
      setLoading(false);
    }
  }, [loaded, loading]);

  const executeCommand = useCallback(async (command: string[]): Promise<Uint8Array | null> => {
    if (!ffmpegRef.current || !loaded) {
      throw new Error('FFmpeg no está cargado');
    }

    try {
      console.log('⚙️ Ejecutando comando FFmpeg:', command.join(' '));
      // API v0.10: run() en lugar de exec()
      await ffmpegRef.current.run(...command);
      return null;
    } catch (err: any) {
      console.error('❌ Error ejecutando comando:', err);
      throw err;
    }
  }, [loaded]);

  const writeFile = useCallback(async (name: string, data: File | Blob | Uint8Array | string) => {
    if (!ffmpegRef.current || !loaded) {
      throw new Error('FFmpeg no está cargado');
    }

    try {
      let fileData: Uint8Array;

      if (typeof data === 'string') {
        fileData = new TextEncoder().encode(data);
      } else if (data instanceof Uint8Array) {
        fileData = data;
      } else {
        fileData = await fetchFile(data);
      }

      // API v0.10: FS método
      ffmpegRef.current.FS('writeFile', name, fileData);
      console.log(`📝 Archivo escrito: ${name}`);
    } catch (err: any) {
      console.error(`❌ Error escribiendo archivo ${name}:`, err);
      throw err;
    }
  }, [loaded]);

  const readFile = useCallback(async (name: string): Promise<Uint8Array> => {
    if (!ffmpegRef.current || !loaded) {
      throw new Error('FFmpeg no está cargado');
    }

    try {
      // API v0.10: FS método
      const data = ffmpegRef.current.FS('readFile', name);
      console.log(`📖 Archivo leído: ${name}`);
      return data as Uint8Array;
    } catch (err: any) {
      console.error(`❌ Error leyendo archivo ${name}:`, err);
      throw err;
    }
  }, [loaded]);

  const deleteFile = useCallback(async (name: string) => {
    if (!ffmpegRef.current || !loaded) {
      throw new Error('FFmpeg no está cargado');
    }

    try {
      // API v0.10: FS método
      ffmpegRef.current.FS('unlink', name);
      console.log(`🗑️ Archivo eliminado: ${name}`);
    } catch (err: any) {
      console.error(`❌ Error eliminando archivo ${name}:`, err);
      throw err;
    }
  }, [loaded]);

  const listFiles = useCallback(async (): Promise<string[]> => {
    if (!ffmpegRef.current || !loaded) {
      throw new Error('FFmpeg is not loaded');
    }
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

export const ffmpegUtils = {
  toBlobVideo: (data: Uint8Array, mimeType = 'video/mp4'): Blob => {
    return new Blob([data.buffer], { type: mimeType });
  },

  toObjectURL: (data: Uint8Array, mimeType = 'video/mp4'): string => {
    const blob = new Blob([data.buffer], { type: mimeType });
    return URL.createObjectURL(blob);
  },

  shouldUseServerProcessing: async (file: File): Promise<boolean> => {
    const MAX_CLIENT_SIZE = 30 * 1024 * 1024;

    if (file.size > MAX_CLIENT_SIZE) {
      return true;
    }
    
    if (file.type && file.type.startsWith('video/')) {
      try {
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        const isHD = await new Promise<boolean>((resolve) => {
          video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            const isHighRes = video.videoHeight >= 1080 || video.videoWidth >= 1920;
            console.log(`Resolution: ${video.videoWidth}x${video.videoHeight} - HD: ${isHighRes}`);
            resolve(isHighRes);
          };
          
          video.onerror = () => {
            resolve(false);
          };
          
          video.src = URL.createObjectURL(file);
        });
        
        return isHD;
      } catch (err) {
        console.error('Error detecting resolution:', err);
        return false;
      }
    }
    
    return false;
  },

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