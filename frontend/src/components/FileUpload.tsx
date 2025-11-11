import React, { useState, useRef } from 'react';
import { uploadFile } from '../services/api';

interface FileUploadProps {
  onUploadSuccess?: (data: any) => void;
  onUploadError?: (error: Error) => void;
  acceptedTypes?: string[];
  maxSizeMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  acceptedTypes = [
    'video/mp4',
    'video/mpeg',
    'audio/mpeg',
    'audio/wav',
    'image/jpeg',
    'image/png',
  ],
  maxSizeMB = 100,
}) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Validar tipo de archivo
    if (!acceptedTypes.includes(file.type)) {
      setError(
        `Tipo de archivo no soportado: ${file.type}. Por favor, selecciona un archivo válido.`
      );
      return false;
    }

    // Validar tamaño
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(
        `El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo permitido: ${maxSizeMB}MB.`
      );
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor, selecciona un archivo primero.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const data = await uploadFile(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      console.log('Upload successful:', data);
      onUploadSuccess?.(data);

      // Reset
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      const errorMessage = err.message || 'Error al subir el archivo. Por favor, intenta de nuevo.';
      setError(errorMessage);
      onUploadError?.(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4">Subir Archivo</h2>

      {/* File Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Seleccionar archivo
        </label>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          disabled={isUploading}
          accept={acceptedTypes.join(',')}
          className="block w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-600 file:text-white
            hover:file:bg-blue-700
            file:cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-400">
          Máximo {maxSizeMB}MB. Formatos soportados: video, audio, imagen.
        </p>
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="mb-4 p-3 bg-gray-700 rounded-md">
          <p className="text-sm text-white font-medium">{selectedFile.name}</p>
          <p className="text-xs text-gray-400">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {isUploading && (
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-white">Subiendo...</span>
            <span className="text-sm font-medium text-white">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600
            disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md
            transition-colors duration-200"
        >
          {isUploading ? 'Subiendo...' : 'Subir'}
        </button>
        {selectedFile && !isUploading && (
          <button
            onClick={handleCancel}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium
              py-2 px-4 rounded-md transition-colors duration-200"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};
