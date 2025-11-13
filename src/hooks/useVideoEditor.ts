import { useState, useEffect } from 'react';
import { useServerRender } from './useServerRender';

interface VideoSegment {
  id: string;
  start: number;
  end: number;
  duration: number;
}

interface UseVideoEditorReturn {
  rendering: boolean;
  progress: number;
  error: string | null;
  renderSegments: (
    videoUrl: string, // Ahora siempre esperamos una URL
    segments: VideoSegment[],
    fileName: string
  ) => Promise<string | null>;
}

export const useVideoEditor = (): UseVideoEditorReturn => {
  const { startRendering, status: serverRenderStatus, progress: serverRenderProgress, finalUrl: serverRenderFinalUrl, error: serverRenderError } = useServerRender();
  
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRendering(serverRenderStatus === 'queued' || serverRenderStatus === 'processing');
    setProgress(serverRenderProgress);
    setError(serverRenderError);
  }, [serverRenderStatus, serverRenderProgress, serverRenderError]);

  const renderSegments = async (
    videoUrl: string,
    segments: VideoSegment[],
    fileName: string
  ): Promise<string | null> => {
    if (segments.length === 0) {
      setError('No hay segmentos para renderizar');
      return null;
    }

    try {
      setError(null);
      await startRendering(videoUrl, segments);
      return serverRenderFinalUrl; // Esto se actualizará asincrónicamente
    } catch (err: any) {
      console.error('❌ Error al iniciar el renderizado en el servidor:', err);
      setError(err.message || 'Error desconocido al iniciar el renderizado');
      return null;
    }
  };

  return {
    rendering,
    progress,
    error,
    renderSegments,
  };
};
