import { useState, useCallback, useEffect, useRef } from 'react';
import { startRenderJob, getRenderJobStatus } from '../services/api';

interface ServerRenderResult {
  jobId: string | null;
  status: 'idle' | 'queued' | 'processing' | 'completed' | 'error';
  progress: number;
  finalUrl: string | null;
  error: string | null;
  startRendering: (videoUrl: string, segments: { start: number; end: number }[], title?: string, audioUrl?: string) => Promise<void>;
}

export const useServerRender = (): ServerRenderResult => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'queued' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ ARREGLO: Limpiar interval cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const startRendering = useCallback(async (videoUrl: string, segments: { start: number; end: number }[], title?: string, audioUrl?: string) => {
    try {
      // Limpiar interval previo si existe
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setStatus('queued');
      setError(null);
      const { jobId: newJobId } = await startRenderJob(videoUrl, segments, title, audioUrl);
      setJobId(newJobId);

      intervalRef.current = setInterval(async () => {
        try {
          const { status: newStatus, progress: newProgress, finalUrl: newFinalUrl } = await getRenderJobStatus(newJobId);
          setStatus(newStatus);
          setProgress(newProgress);

          if (newStatus === 'completed') {
            setFinalUrl(newFinalUrl);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          } else if (newStatus === 'error') {
            setError('Rendering job failed');
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        } catch (err: any) {
          setError(err.message || 'Failed to poll job status');
          setStatus('error');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Failed to start rendering job');
      setStatus('error');
    }
  }, []);

  return {
    jobId,
    status,
    progress,
    finalUrl,
    error,
    startRendering,
  };
};
