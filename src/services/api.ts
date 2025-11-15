const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

console.log('🌐 Usando BACKEND_URL:', BACKEND_URL);

export const uploadVideo = async (file: File): Promise<string> => {
  console.log('📤 Solicitando URL firmada para:', file.name);

  // Solicitar URL firmada al backend (endpoint de R2)
  const res = await fetch(`${BACKEND_URL}/api/media/generate-upload-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Error obteniendo URL firmada');
  }

  const data = await res.json();
  const { uploadUrl, publicUrl } = data.data;

  console.log('☁️ Subiendo archivo directamente a R2 Storage...');

  // Subir archivo directamente a R2 usando la URL firmada
  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error('Error subiendo archivo a R2 Storage');
  }

  console.log('✅ Archivo subido exitosamente:', publicUrl);

  return publicUrl;
};

// --- Funciones de Renderizado ---

export const startRenderJob = async (
  videoUrl: string,
  segments: { start: number; end: number }[],
  title?: string,
  audioUrl?: string
): Promise<{ jobId: string }> => {
  console.log('🎬 Iniciando trabajo de renderizado:', { videoUrl, segments, title, audioUrl });

  const res = await fetch(`${BACKEND_URL}/api/media/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoUrl, segments, title, audioUrl }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Error iniciando trabajo de renderizado');
  }

  const data = await res.json();
  console.log('✅ Trabajo de renderizado iniciado:', data.data.jobId);

  return { jobId: data.data.jobId };
};

export const getRenderJobStatus = async (
  jobId: string
): Promise<{
  status: 'idle' | 'queued' | 'processing' | 'completed' | 'error';
  progress: number;
  finalUrl: string | null;
  error?: string;
}> => {
  const res = await fetch(`${BACKEND_URL}/api/media/render/status/${jobId}`);

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Trabajo de renderizado no encontrado');
    }
    throw new Error('Error consultando estado del trabajo');
  }

  const data = await res.json();
  return {
    status: data.data.status,
    progress: data.data.progress,
    finalUrl: data.data.finalUrl,
    error: data.data.error,
  };
};
