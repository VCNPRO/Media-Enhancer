const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

console.log(' Usando BACKEND_URL:', BACKEND_URL);

export const uploadVideo = async (file: File): Promise<string> => {
  console.log(' Solicitando URL firmada para:', file.name);

  const res = await fetch(
    BACKEND_URL + '/signed-url?fileName=' + encodeURIComponent(file.name) + '&contentType=' + encodeURIComponent(file.type)
  );

  if (!res.ok) {
    throw new Error('Error obteniendo URL firmada');
  }

  const { uploadUrl, publicUrl } = await res.json();

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

  console.log(' Archivo subido exitosamente:', publicUrl);

  return publicUrl;
};
