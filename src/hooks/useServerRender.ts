import { useState, useCallback } from 'react';
import { startRenderJob, getRenderJobStatus } from '../services/api';

interface ServerRenderResult {
  jobId: string | null;
  status: 'idle' | 'queued' | 'processing' | 'completed' | 'error';
  progress: number;
  finalUrl: string | null;
  error: string | null;
  startRendering: (videoUrl: string, segments: { start: number; end: number }[]) => Promise<void>;
}

export const useServerRender = (): ServerRenderResult => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'queued' | 'processing' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startRendering = useCallback(async (videoUrl: string, segments: { start: number; end: number }[]) => {
    try {
      setStatus('queued');
      setError(null);
      const { jobId: newJobId } = await startRenderJob(videoUrl, segments);
      setJobId(newJobId);
      
      const interval = setInterval(async () => {
        try {
          const { status: newStatus, progress: newProgress, finalUrl: newFinalUrl } = await getRenderJobStatus(newJobId);
          setStatus(newStatus);
          setProgress(newProgress);
  
          if (newStatus === 'completed') {
            setFinalUrl(newFinalUrl);
            clearInterval(interval);
          } else if (newStatus === 'error') {
            setError('Rendering job failed');
            clearInterval(interval);
          }
        } catch (err: any) {
          setError(err.message || 'Failed to poll job status');
          setStatus('error');
          clearInterval(interval);
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
