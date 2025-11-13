const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

console.log(' Usando BACKEND_URL:', BACKEND_URL);

export const uploadVideo = async (file: File): Promise<string> => {
  console.log(' Solicitando URL firmada para:', file.name);

  const res = await fetch(
    `${BACKEND_URL}/api/generate-upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName: file.name, contentType: file.type }),
    }
  );

  if (!res.ok) {
    throw new Error('Error obteniendo URL firmada');
  }

  const { uploadUrl, fileName: uniqueFileName } = await res.json();

  console.log(' Subiendo archivo directamente a Cloud Storage...');

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type
    },
    body: file
  });

  if (!uploadRes.ok) {
    throw new Error('Error subiendo archivo a Cloud Storage');
  }

  const publicUrl = `https://storage.googleapis.com/${import.meta.env.VITE_GOOGLE_CLOUD_BUCKET}/${uniqueFileName}`;

  console.log(' Archivo subido exitosamente:', publicUrl);

  return publicUrl;
};

export const startRenderJob = async (videoUrl: string, segments: { start: number; end: number }[]): Promise<{ jobId: string }> => {
  const res = await fetch(`${BACKEND_URL}/api/render`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ videoUrl, segments }),
  });

  if (!res.ok) {
    throw new Error('Error al iniciar el trabajo de renderizado');
  }

  return res.json();
};

export const getRenderJobStatus = async (jobId: string): Promise<{ status: string; progress: number; finalUrl: string | null }> => {
  const res = await fetch(`${BACKEND_URL}/api/render/status/${jobId}`);

  if (!res.ok) {
    throw new Error('Error al obtener el estado del trabajo de renderizado');
  }

  return res.json();
};
