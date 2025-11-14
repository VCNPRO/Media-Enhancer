import React, { useState, useRef, useEffect } from 'react';
import { useVideoEditor } from '../hooks/useVideoEditor';

// Force deployment trigger
interface VideoSegment {
  id: string;
  start: number;
  end: number;
  duration: number;
}

interface VideoEditorProps {
  url: string;
  type: string;
  fileName: string;
  file?: File;
  onRenderComplete?: (url: string) => void;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({ url, type, fileName, file, onRenderComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { rendering, progress: renderProgress, error: renderError, renderSegments } = useVideoEditor();
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startMark, setStartMark] = useState<number | null>(null);
  const [endMark, setEndMark] = useState<number | null>(null);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const setMarkStart = () => {
    setStartMark(currentTime);
  };

  const setMarkEnd = () => {
    setEndMark(currentTime);
  };

  const addSegment = () => {
    if (startMark === null || endMark === null) {
      alert('Por favor marca el inicio y fin del segmento');
      return;
    }

    if (startMark >= endMark) {
      alert('El inicio debe ser menor que el fin');
      return;
    }

    const newSegment: VideoSegment = {
      id: Date.now().toString(),
      start: startMark,
      end: endMark,
      duration: endMark - startMark,
    };

    setSegments([...segments, newSegment]);
    setStartMark(null);
    setEndMark(null);
  };

  const removeSegment = (id: string) => {
    setSegments(segments.filter(seg => seg.id !== id));
  };

  const clearMarks = () => {
    setStartMark(null);
    setEndMark(null);
  };

  const seekTo = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      // Subir audio a Cloud Storage
      try {
        const { uploadVideo } = await import('../services/api');
        console.log('📤 Subiendo archivo de audio...');
        const uploadedAudioUrl = await uploadVideo(file);
        setAudioUrl(uploadedAudioUrl);
        console.log('✅ Audio subido:', uploadedAudioUrl);
      } catch (err: any) {
        console.error('❌ Error subiendo audio:', err);
        alert(`Error subiendo audio: ${err.message}`);
      }
    }
  };

  const renderVideo = async () => {
    if (segments.length === 0) {
      alert('Agrega al menos un segmento para renderizar');
      return;
    }

    console.log('🎬 Renderizando segmentos:', segments);
    console.log('📝 Título:', title);
    console.log('🎵 Audio URL:', audioUrl);

    try {
      // Si tenemos un File, primero subirlo a Cloud Storage
      let videoUrlToRender = url;

      if (file && !url) {
        console.log('📤 Subiendo video a Cloud Storage antes de renderizar...');
        const { uploadVideo } = await import('../services/api');
        videoUrlToRender = await uploadVideo(file);
        console.log('✅ Video subido:', videoUrlToRender);
      }

      if (!videoUrlToRender) {
        throw new Error('No se pudo obtener la URL del video');
      }

      const resultUrl = await renderSegments(videoUrlToRender, segments, fileName, title || undefined, audioUrl || undefined);

      if (resultUrl) {
        console.log('✅ Video renderizado exitosamente:', resultUrl);
        setRenderedUrl(resultUrl);
        if (onRenderComplete) {
          onRenderComplete(resultUrl);
        }
        alert('¡Video renderizado exitosamente! Puedes descargarlo ahora.');
      } else {
        alert('Error al renderizar el video. Revisa la consola para más detalles.');
      }
    } catch (err: any) {
      console.error('❌ Error en renderizado:', err);
      alert(`Error al renderizar: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="bg-gray-950 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          controls
          className="w-full max-h-[400px] object-contain"
          src={url}
          crossOrigin="anonymous"
        >
          <source src={url} type={type === 'video' ? 'video/mp4' : 'audio/mpeg'} />
          Tu navegador no soporta el elemento de video.
        </video>
      </div>

      {/* Timeline */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Timeline</span>
          <span className="text-sm font-mono text-white">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Progress Bar with Markers */}
        <div className="relative h-12 bg-gray-700 rounded-lg overflow-hidden">
          {/* Current Progress */}
          <div
            className="absolute top-0 left-0 h-full bg-red-500/30"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />

          {/* Start Mark */}
          {startMark !== null && (
            <div
              className="absolute top-0 h-full w-1 bg-green-500"
              style={{ left: `${(startMark / duration) * 100}%` }}
            >
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-1 rounded">
                IN
              </div>
            </div>
          )}

          {/* End Mark */}
          {endMark !== null && (
            <div
              className="absolute top-0 h-full w-1 bg-red-600"
              style={{ left: `${(endMark / duration) * 100}%` }}
            >
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs px-1 rounded">
                OUT
              </div>
            </div>
          )}

          {/* Segments */}
          {segments.map(segment => (
            <div
              key={segment.id}
              className="absolute top-0 h-full bg-blue-500/40 border-l-2 border-r-2 border-blue-500"
              style={{
                left: `${(segment.start / duration) * 100}%`,
                width: `${((segment.end - segment.start) / duration) * 100}%`,
              }}
            />
          ))}

          {/* Current Time Indicator */}
          <div
            className="absolute top-0 h-full w-0.5 bg-white"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={setMarkStart}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <span>📍</span>
            Marcar Inicio
          </button>

          <button
            onClick={setMarkEnd}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <span>📍</span>
            Marcar Fin
          </button>

          <button
            onClick={addSegment}
            disabled={startMark === null || endMark === null}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <span>➕</span>
            Añadir Segmento
          </button>

          <button
            onClick={clearMarks}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition flex items-center justify-center gap-2"
          >
            <span>🗑️</span>
            Limpiar Marcas
          </button>
        </div>

        {/* Mark Info */}
        {(startMark !== null || endMark !== null) && (
          <div className="mt-3 p-3 bg-gray-700 rounded-lg text-sm">
            <div className="flex gap-4">
              {startMark !== null && (
                <span className="text-green-400">
                  ▶️ Inicio: {formatTime(startMark)}
                </span>
              )}
              {endMark !== null && (
                <span className="text-red-400">
                  ⏹️ Fin: {formatTime(endMark)}
                </span>
              )}
              {startMark !== null && endMark !== null && (
                <span className="text-blue-400">
                  ⏱️ Duración: {formatTime(endMark - startMark)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Segments List */}
      {segments.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span>📋</span>
            Segmentos a Mantener ({segments.length})
          </h4>
          <div className="space-y-2">
            {segments.map((segment, index) => (
              <div
                key={segment.id}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-blue-400">#{index + 1}</span>
                  <div className="text-sm">
                    <div>
                      {formatTime(segment.start)} → {formatTime(segment.end)}
                    </div>
                    <div className="text-gray-400">
                      Duración: {formatTime(segment.duration)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => seekTo(segment.start)}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm transition"
                  >
                    ▶️ Ver
                  </button>
                  <button
                    onClick={() => removeSegment(segment.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total Duration */}
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Duración Total del Video Final:</span>
              <span className="text-xl font-bold text-blue-400">
                {formatTime(segments.reduce((total, seg) => total + seg.duration, 0))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Additional Options */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <span>⚙️</span>
          Opciones Adicionales
        </h4>

        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              📝 Título del Video (opcional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Mi Video Editado"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              El título aparecerá superpuesto en la parte superior del video
            </p>
          </div>

          {/* Audio Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              🎵 Reemplazar Audio (opcional)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <div className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-center transition">
                  {audioFile ? (
                    <span className="text-green-400">✓ {audioFile.name}</span>
                  ) : (
                    <span className="text-gray-300">Seleccionar archivo de audio</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
              </label>
              {audioFile && (
                <button
                  onClick={() => {
                    setAudioFile(null);
                    setAudioUrl(null);
                  }}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                >
                  🗑️
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              El audio del video original será reemplazado por este archivo
            </p>
          </div>
        </div>
      </div>

      {/* Render Section */}
      <div className="bg-gradient-to-r from-red-900/50 to-pink-900/50 border-2 border-red-500/50 rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg mb-1">Renderizar Video</h4>
              <p className="text-sm text-gray-300">
                {segments.length === 0
                  ? 'Añade segmentos para renderizar el video editado'
                  : `Listo para renderizar ${segments.length} segmento${segments.length > 1 ? 's' : ''}`
                }
              </p>
            </div>
            <button
              onClick={renderVideo}
              disabled={segments.length === 0 || rendering}
              className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold transition flex items-center gap-2"
            >
              {rendering ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  Renderizando...
                </>
              ) : (
                <>
                  <span>🎬</span>
                  Renderizar Video
                </>
              )}
            </button>
          </div>

          {/* Render Progress */}
          {rendering && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Progreso de renderizado</span>
                <span className="text-sm text-gray-300">{renderProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Render Error */}
          {renderError && (
            <div className="p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-400 text-sm">
              ❌ Error: {renderError}
            </div>
          )}

          {/* Download Button */}
          {renderedUrl && !rendering && (
            <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-green-400 mb-1">
                    ✅ Video renderizado exitosamente
                  </div>
                  <p className="text-sm text-gray-300">
                    Tu video editado está listo para descargar
                  </p>
                </div>
                <a
                  href={renderedUrl}
                  download={`edited_${fileName}`}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition flex items-center gap-2"
                >
                  <span>⬇️</span>
                  Descargar Video
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
