import { useState } from 'react';
import { uploadVideo } from '../../services/api';

interface UseCloudUploadResult {
  uploading: boolean;
  processing: boolean;
  progress: number;
  error: string | null;
  uploadAndProcess: (file: File, options?: any) => Promise<string | null>;
}

export const useCloudUpload = (): UseCloudUploadResult => {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadAndProcess = async (
    file: File,
    options?: {
      format?: string;
      quality?: string;
      resolution?: string;
    }
  ): Promise<string | null> => {
    try {
      setError(null);
      setUploading(true);
      setProgress(10);

      console.log(' Subiendo archivo a Cloud Storage...');
      
      const publicUrl = await uploadVideo(file);
      
      setProgress(100);
      setUploading(false);
      setProcessing(false);

      console.log(' Archivo subido exitosamente:', publicUrl);

      return publicUrl;
    } catch (err: any) {
      console.error(' Error al subir el video:', err);
      setError(err.message || 'Error al procesar el video');
      setUploading(false);
      setProcessing(false);
      return null;
    }
  };

  return {
    uploading,
    processing,
    progress,
    error,
    uploadAndProcess,
  };
};
