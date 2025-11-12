import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useVideoEditor } from '../hooks/useVideoEditor';
import { useCloudUpload } from '../hooks/useCloudUpload';
import { ffmpegUtils } from '../hooks/useFFmpeg';
import type { MediaFile } from '../../types';
import { FileUpload } from './FileUpload';

interface VideoSegment {
  id: string;
  start: number;
  end: number;
  duration: number;
}

interface AudioTrack {
  id: string;
  file: File | null;
  url: string | null;
  name: string;
  start: number;
  duration: number;
  volume: number;
}

interface TitleOverlay {
  id: string;
  text: string;
  start: number;
  duration: number;
  fontSize: number;
  color: string;
  position: 'top' | 'center' | 'bottom';
  backgroundColor: string;
}

interface VideoEditorAdvancedProps {
  onRenderComplete?: (url: string) => void;
}

const getMediaType = (file: File): 'image' | 'video' | 'audio' => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'video';
};

export const VideoEditorAdvanced: React.FC<VideoEditorAdvancedProps> = ({
  onRenderComplete,
}) => {
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const { uploading, processing, progress, error: cloudError, uploadAndProcess } = useCloudUpload();

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const { rendering, progress: renderProgress, error: renderError, renderSegments } = useVideoEditor();

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [startMark, setStartMark] = useState<number | null>(null);
  const [endMark, setEndMark] = useState<number | null>(null);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [titles, setTitles] = useState<TitleOverlay[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cut' | 'audio' | 'titles'>('cut');

  // Title editor state
  const [showTitleEditor, setShowTitleEditor] = useState(false);
  const [currentTitle, setCurrentTitle] = useState<TitleOverlay>({
    id: '',
    text: '',
    start: 0,
    duration: 3,
    fontSize: 48,
    color: '#FFFFFF',
    position: 'bottom',
    backgroundColor: 'rgba(0,0,0,0.7)',
  });

  const handleFileChange = async (file: File | null) => {
    if (file) {
      const mediaType = getMediaType(file);
      const shouldUseCloud = ffmpegUtils.shouldUseServerProcessing(file.size);

      console.log(`📦 Archivo: ${file.name}`);
      console.log(`📏 Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`☁️ Usar Cloud: ${shouldUseCloud ? 'Sí' : 'No (local)'}`);

      const localUrl = URL.createObjectURL(file);

      setMediaFile({
        file,
        name: file.name,
        url: localUrl,
        type: mediaType,
        useCloud: shouldUseCloud,
      });

      if (shouldUseCloud) {
        try {
          console.log('🚀 Subiendo archivo a la nube...');
          const cloudUrl = await uploadAndProcess(file);

          if (cloudUrl) {
            console.log('✅ Archivo subido y procesado en la nube');
            console.log('🔗 URL de la nube:', cloudUrl);

            setMediaFile(prev => prev ? {
              ...prev,
              url: cloudUrl
            } : null);

            URL.revokeObjectURL(localUrl);
          }
        } catch (error) {
          console.error('❌ Error al subir archivo:', error);
        }
      }
    } else {
      setMediaFile(null);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
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
  }, [mediaFile]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const setMarkStart = () => setStartMark(currentTime);
  const setMarkEnd = () => setEndMark(currentTime);

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

  const removeSegment = (id: string) => setSegments(segments.filter((seg) => seg.id !== id));
  const clearMarks = () => {
    setStartMark(null);
    setEndMark(null);
  };

  const seekTo = (time: number) => {
    if (videoRef.current) videoRef.current.currentTime = time;
  };

  const handleAudioFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      alert('Por favor selecciona un archivo de audio');
      return;
    }
    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio(audioUrl);
    audio.onloadedmetadata = () => {
      const newAudioTrack: AudioTrack = {
        id: Date.now().toString(),
        file: file,
        url: audioUrl,
        name: file.name,
        start: currentTime,
        duration: audio.duration,
        volume: 1.0,
      };
      setAudioTracks([...audioTracks, newAudioTrack]);
    };
  };

  const removeAudioTrack = (id: string) => setAudioTracks(audioTracks.filter((track) => track.id !== id));

  const openTitleEditor = () => {
    setCurrentTitle({
      id: Date.now().toString(),
      text: '',
      start: currentTime,
      duration: 3,
      fontSize: 48,
      color: '#FFFFFF',
      position: 'bottom',
      backgroundColor: 'rgba(0,0,0,0.7)',
    });
    setShowTitleEditor(true);
  };

  const addTitle = () => {
    if (!currentTitle.text.trim()) {
      alert('Escribe un texto para el título');
      return;
    }
    setTitles([...titles, currentTitle]);
    setShowTitleEditor(false);
  };

  const removeTitle = (id: string) => setTitles(titles.filter((title) => title.id !== id));

  const renderVideo = async () => {
    if (!mediaFile || segments.length === 0) {
      alert('Agrega al menos un segmento para renderizar');
      return;
    }
    console.log('🎬 Renderizando con:');
    console.log('- Segmentos:', segments);
    console.log('- Audio tracks:', audioTracks);
    console.log('- Títulos:', titles);
    const videoSource = mediaFile.file || mediaFile.url;
    try {
      const resultUrl = await renderSegments(videoSource, segments, mediaFile.name);
      if (resultUrl) {
        console.log('✅ Video renderizado exitosamente:', resultUrl);
        setRenderedUrl(resultUrl);
        if (onRenderComplete) onRenderComplete(resultUrl);
        alert('¡Video renderizado exitosamente! Puedes descargarlo ahora.');
      } else {
        alert('Error al renderizar el video. Revisa la consola para más detalles.');
      }
    } catch (err: any) {
      console.error('❌ Error en renderizado:', err);
      alert(`Error al renderizar: ${err.message}`);
    }
  };

  if (!mediaFile) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Sube tu video</h2>
          <p className="text-gray-400 mb-6">
            Archivos hasta 30 MB se procesan localmente. Videos más grandes se suben a la nube.
          </p>
          <FileUpload onFileChange={handleFileChange} />
        </div>
        {(uploading || processing) && (
          <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="mb-3 flex justify-between items-center">
              <span className="font-semibold">
                {uploading ? '📤 Subiendo a la nube...' : '⚙️ Procesando...'}
              </span>
              <span className="text-sm text-gray-400">{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        {cloudError && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
            ❌ Error: {cloudError}
          </div>
        )}
        <div className="mt-12 bg-gray-800 rounded-lg p-8 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">💡 Consejos para mejores resultados</h3>
          <ul className="space-y-2 text-gray-400">
            <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span><span>Videos hasta 30 MB se procesan localmente en tu navegador</span></li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span><span>Videos mayores a 30 MB se suben a la nube automáticamente</span></li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span><span>Formatos soportados: MP4, AVI, MOV, MKV, WebM</span></li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span><span>Optimizado para videos VHS (720x576 PAL)</span></li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-1">✓</span><span>Análisis con IA incluido: descripciones, transcripciones y más</span></li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">Editor de Video</h3>
            <button
                onClick={() => handleFileChange(null)}
                className="text-sm text-gray-400 hover:text-white transition-colors"
            >
                Cambiar archivo
            </button>
        </div>
      {/* Main Layout: Player Left, Controls Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Video Player (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Player */}
          <div className="bg-gray-950 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              controls
              className="w-full max-h-[300px] object-contain"
              src={mediaFile.url}
              crossOrigin="anonymous"
            >
              <source src={mediaFile.url} type={mediaFile.type === 'video' ? 'video/mp4' : 'audio/mpeg'} />
              Tu navegador no soporta el elemento de video.
            </video>
          </div>

          {/* Timeline with Video and Audio tracks */}
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Timeline</span>
          <span className="text-xs font-mono text-white">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Video Track */}
        <div className="mb-2">
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">
            <span>🎥</span>
            <span>Video</span>
          </div>
          <div className="relative h-10 bg-gray-700 rounded-lg overflow-hidden">
            {/* Current Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-red-500/30"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />

            {/* Start/End Marks */}
            {startMark !== null && (
              <div
                className="absolute top-0 h-full w-1 bg-green-500 z-10"
                style={{ left: `${(startMark / duration) * 100}%` }}
              >
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-[10px] px-1 rounded">
                  IN
                </div>
              </div>
            )}

            {endMark !== null && (
              <div
                className="absolute top-0 h-full w-1 bg-red-600 z-10"
                style={{ left: `${(endMark / duration) * 100}%` }}
              >
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-[10px] px-1 rounded">
                  OUT
                </div>
              </div>
            )}

            {/* Segments */}
            {segments.map((segment) => (
              <div
                key={segment.id}
                className="absolute top-0 h-full bg-blue-500/50 border-l-2 border-r-2 border-blue-500"
                style={{
                  left: `${(segment.start / duration) * 100}%`,
                  width: `${((segment.end - segment.start) / duration) * 100}%`,
                }}
              />
            ))}

            {/* Current Time Indicator */}
            <div
              className="absolute top-0 h-full w-0.5 bg-white z-20"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>

        {/* Audio Track */}
        <div>
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">
            <span>🔊</span>
            <span>Audio</span>
          </div>
          <div className="relative h-8 bg-gray-700 rounded-lg overflow-hidden">
            {/* Original Audio */}
            <div className="absolute top-0 left-0 h-full w-full bg-green-500/20" />

            {/* Additional Audio Tracks */}
            {audioTracks.map((track) => (
              <div
                key={track.id}
                className="absolute top-0 h-full bg-yellow-500/50 border-l-2 border-r-2 border-yellow-500"
                style={{
                  left: `${(track.start / duration) * 100}%`,
                  width: `${(track.duration / duration) * 100}%`,
                }}
                title={track.name}
              />
            ))}
          </div>
        </div>
      </div>
        </div>

        {/* Right: Controls (1/3) */}
        <div className="lg:col-span-1 space-y-4">
          {/* Tabs */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('cut')}
            className={`flex-1 px-2 py-2 text-xs transition ${
              activeTab === 'cut'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            ✂️ Cortar
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 px-2 py-2 text-xs transition ${
              activeTab === 'audio'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            🎵 Audio
          </button>
          <button
            onClick={() => setActiveTab('titles')}
            className={`flex-1 px-2 py-2 text-xs transition ${
              activeTab === 'titles'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            📝 Títulos
          </button>
        </div>

        <div className="p-3">
          {/* Cut Tab */}
          {activeTab === 'cut' && (
            <div className="space-y-3">
              <div className="space-y-2">
                <button
                  onClick={setMarkStart}
                  className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>📍</span>
                  Inicio
                </button>

                <button
                  onClick={setMarkEnd}
                  className="w-full px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>📍</span>
                  Fin
                </button>

                <button
                  onClick={addSegment}
                  disabled={startMark === null || endMark === null}
                  className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>➕</span>
                  Añadir
                </button>

                <button
                  onClick={clearMarks}
                  className="w-full px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>🗑️</span>
                  Limpiar
                </button>
              </div>

              {(startMark !== null || endMark !== null) && (
                <div className="p-2 bg-gray-700 rounded text-xs">
                  <div className="space-y-1">
                    {startMark !== null && (
                      <div className="text-green-400">▶️ {formatTime(startMark)}</div>
                    )}
                    {endMark !== null && (
                      <div className="text-red-400">⏹️ {formatTime(endMark)}</div>
                    )}
                    {startMark !== null && endMark !== null && (
                      <div className="text-blue-400">
                        ⏱️ {formatTime(endMark - startMark)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {segments.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold mb-2">Segmentos ({segments.length})</h4>
                  <div className="space-y-1.5">
                    {segments.map((segment, index) => (
                      <div
                        key={segment.id}
                        className="flex items-center justify-between p-2 bg-gray-700 rounded text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-400">#{index + 1}</span>
                          <div>
                            {formatTime(segment.start)} → {formatTime(segment.end)}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => seekTo(segment.start)}
                            className="px-2 py-0.5 bg-gray-600 hover:bg-gray-500 rounded text-xs"
                          >
                            ▶️
                          </button>
                          <button
                            onClick={() => removeSegment(segment.id)}
                            className="px-2 py-0.5 bg-red-600 hover:bg-red-700 rounded text-xs"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Audio Tab */}
          {activeTab === 'audio' && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-2">
                  Añade audio desde la posición actual
                </p>
                <input
                  ref={audioFileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => audioFileInputRef.current?.click()}
                  className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>➕</span>
                  Subir Audio
                </button>
              </div>

              {audioTracks.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold mb-2">Audios ({audioTracks.length})</h4>
                  <div className="space-y-1.5">
                    {audioTracks.map((track, index) => (
                      <div
                        key={track.id}
                        className="flex items-center justify-between p-2 bg-gray-700 rounded text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{track.name}</div>
                          <div className="text-[10px] text-gray-400">
                            {formatTime(track.start)} • {formatTime(track.duration)}
                          </div>
                        </div>
                        <button
                          onClick={() => removeAudioTrack(track.id)}
                          className="px-2 py-0.5 bg-red-600 hover:bg-red-700 rounded text-xs ml-2"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-2 bg-yellow-900/20 border border-yellow-500 rounded text-[10px] text-yellow-400">
                ⚠️ El audio requiere recodificación
              </div>
            </div>
          )}

          {/* Titles Tab */}
          {activeTab === 'titles' && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-2">
                  Añade texto desde la posición actual
                </p>
                <button
                  onClick={openTitleEditor}
                  className="w-full px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>➕</span>
                  Crear Título
                </button>
              </div>

              {titles.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold mb-2">Títulos ({titles.length})</h4>
                  <div className="space-y-1.5">
                    {titles.map((title, index) => (
                      <div
                        key={title.id}
                        className="flex items-center justify-between p-2 bg-gray-700 rounded text-xs"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{title.text}</div>
                          <div className="text-[10px] text-gray-400">
                            {formatTime(title.start)} • {formatTime(title.duration)} • {title.position}
                          </div>
                        </div>
                        <button
                          onClick={() => removeTitle(title.id)}
                          className="px-2 py-0.5 bg-red-600 hover:bg-red-700 rounded text-xs ml-2"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Title Editor Modal */}
              {showTitleEditor && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full border border-gray-700">
                    <h3 className="text-xl font-bold mb-4">Editor de Títulos</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Texto</label>
                        <input
                          type="text"
                          value={currentTitle.text}
                          onChange={(e) =>
                            setCurrentTitle({ ...currentTitle, text: e.target.value })
                          }
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                          placeholder="Escribe tu título aquí"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Inicio (seg)</label>
                          <input
                            type="number"
                            value={currentTitle.start}
                            onChange={(e) =>
                              setCurrentTitle({
                                ...currentTitle,
                                start: parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                            step="0.1"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Duración (seg)
                          </label>
                          <input
                            type="number"
                            value={currentTitle.duration}
                            onChange={(e) =>
                              setCurrentTitle({
                                ...currentTitle,
                                duration: parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                            step="0.1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Posición</label>
                        <select
                          value={currentTitle.position}
                          onChange={(e) =>
                            setCurrentTitle({
                              ...currentTitle,
                              position: e.target.value as any,
                            })
                          }
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                        >
                          <option value="top">Arriba</option>
                          <option value="center">Centro</option>
                          <option value="bottom">Abajo</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Tamaño de Fuente
                          </label>
                          <input
                            type="number"
                            value={currentTitle.fontSize}
                            onChange={(e) =>
                              setCurrentTitle({
                                ...currentTitle,
                                fontSize: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Color</label>
                          <input
                            type="color"
                            value={currentTitle.color}
                            onChange={(e) =>
                              setCurrentTitle({ ...currentTitle, color: e.target.value })
                            }
                            className="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={addTitle}
                          className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold"
                        >
                          Añadir Título
                        </button>
                        <button
                          onClick={() => setShowTitleEditor(false)}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Render Section */}
      <div className="bg-gradient-to-r from-red-900/50 to-pink-900/50 border-2 border-red-500/50 rounded-lg p-3">
        <div className="space-y-2">
          <div>
            <h4 className="text-xs font-bold mb-1">Renderizar</h4>
            <p className="text-[10px] text-gray-300 mb-2">
              {segments.length === 0
                ? 'Añade segmentos primero'
                : `${segments.length} seg • ${audioTracks.length} aud • ${titles.length} tít`}
            </p>
            <button
              onClick={renderVideo}
              disabled={segments.length === 0 || rendering}
              className="w-full px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-xs transition flex items-center justify-center gap-1.5"
            >
              {rendering ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  Renderizando...
                </>
              ) : (
                <>
                  <span>🎬</span>
                  Renderizar
                </>
              )}
            </button>
          </div>

          {rendering && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px]">Progreso</span>
                <span className="text-[10px] text-gray-300">{renderProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${renderProgress}%` }}
                />
              </div>
            </div>
          )}

          {renderError && (
            <div className="p-2 bg-red-900/30 border border-red-500 rounded text-red-400 text-[10px]">
              ❌ {renderError}
            </div>
          )}

          {renderedUrl && !rendering && (
            <div className="p-2 bg-green-900/20 border border-green-500 rounded">
              <div className="text-[10px] text-green-400 mb-2">
                ✅ Listo para descargar
              </div>
              <a
                href={renderedUrl}
                download={mediaFile ? `edited_${mediaFile.name}`: 'edited_video.mp4'}
                className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>⬇️</span>
                Descargar
              </a>
            </div>
          )}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
};
