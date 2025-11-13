import React, { useState } from 'react';
import { FileUploader, VideoMetadata } from './components/FileUploader';
import { VideoPlayer } from './components/VideoPlayer';
import { Timeline } from './components/Timeline';
import { useCloudUpload } from './hooks/useCloudUpload';

interface MediaFile {
  file: File;
  name: string;
  url: string;
  type: string;
  metadata: VideoMetadata;
}

const App: React.FC = () => {
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const [status, setStatus] = useState<string>('');
  const { uploading, processing, progress, error: cloudError, uploadAndProcess } = useCloudUpload();

  const handleFileSelect = async (file: File, metadata: VideoMetadata) => {
    console.log(`File: ${file.name}`);
    console.log(`Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Type: ${file.type}`);
    console.log(`Resolution: ${metadata.width}x${metadata.height}`);
    console.log(`Duration: ${metadata.duration.toFixed(2)}s`);
    console.log(`Is VHS: ${metadata.isVHS}`);
    console.log(`Use Cloud: ${metadata.shouldUseServerProcessing ? 'Yes' : 'No (local)'}`);

    setMediaFile({
      file,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      metadata,
    });

    if (metadata.shouldUseServerProcessing) {
      setStatus('Uploading to Cloud Storage...');
      try {
        await uploadAndProcess(file);
        setStatus('Cloud processing completed');
      } catch (err: any) {
        setStatus(`Error: ${err.message}`);
      }
    } else {
      setStatus('Processing locally with FFmpeg...');
      // Aquí puedes agregar lógica de procesamiento local
      setStatus('Local processing completed');
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Media Enhancer</h1>

      <FileUploader onFileSelected={handleFileSelect} maxSize={6 * 1024 * 1024 * 1024} />

      {status && (
        <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300">
          {status}
        </div>
      )}

      {(uploading || processing) && (
        <div className="mt-4 w-full max-w-md p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="mb-2 flex justify-between text-sm">
            <span>{uploading ? 'Uploading...' : 'Processing...'}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 h-2 rounded-full">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {cloudError && (
        <p className="mt-4 text-sm text-red-400">Error: {cloudError}</p>
      )}

      {mediaFile && (
        <section className="mt-8 w-full max-w-3xl space-y-6">
          <VideoPlayer src={mediaFile.url} />
          <Timeline />
          <div className="text-gray-400 text-sm space-y-1">
            <p><strong>File:</strong> {mediaFile.name}</p>
            <p><strong>Size:</strong> {(mediaFile.file.size / 1024 / 1024).toFixed(2)} MB</p>
            <p><strong>Resolution:</strong> {mediaFile.metadata.width}x{mediaFile.metadata.height}</p>
            <p><strong>Duration:</strong> {mediaFile.metadata.duration.toFixed(2)}s</p>
            <p><strong>Processing:</strong> {mediaFile.metadata.shouldUseServerProcessing ? 'Cloud ☁️' : 'Local 💻'}</p>
          </div>
        </section>
      )}
    </main>
  );
};

export default App;