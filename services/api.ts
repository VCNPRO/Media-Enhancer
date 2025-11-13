const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

console.log(' Usando BACKEND_URL:', BACKEND_URL);

export const uploadVideo = async (file: File): Promise<string> => {
  console.log(' Subiendo archivo a Cloud Storage a través del backend...');

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BACKEND_URL}/api/media/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || 'Error al subir el video');
  }

  const { data } = await res.json();
  console.log(' Archivo subido exitosamente:', data.url);

  return data.url;
};

export const startRenderJob = async (videoUrl: string, segments: { start: number; end: number }[]): Promise<{ jobId: string }> => {
  const res = await fetch(`${BACKEND_URL}/api/media/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoUrl, segments }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || 'Error al iniciar el trabajo de renderizado');
  }

  const { data } = await res.json();
  return data;
};

export const getRenderJobStatus = async (jobId: string): Promise<{ status: string; progress: number; finalUrl: string | null }> => {
  const res = await fetch(`${BACKEND_URL}/api/media/render/status/${jobId}`);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || 'Error al obtener el estado del trabajo de renderizado');
  }

  const { data } = await res.json();
  return data;
};
