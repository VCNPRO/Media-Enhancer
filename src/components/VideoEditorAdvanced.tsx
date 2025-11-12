import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useVideoEditor } from '../hooks/useVideoEditor';
import { useCloudUpload } from '../hooks/useCloudUpload';
import { ffmpegUtils } from '../hooks/useFFmpeg';
import type { MediaFile } from '../../types';
import { FileUpload } from './FileUpload';

// ... (interfaces remain the same)

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
  id:string;
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
          const cloudUrl = await uploadAndProcess(file);
          if (cloudUrl) {
            setMediaFile(prev => prev ? { ...prev, url: cloudUrl } : null);
            URL.revokeObjectURL(localUrl);
          }
        } catch (error) {
          console.error('❌ Error al subir archivo:', error);
        }
      }
    } else {
      setMediaFile(null);
      setDuration(0);
      setCurrentTime(0);
      setSegments([]);
      setAudioTracks([]);
      setTitles([]);
      setStartMark(null);
      setEndMark(null);
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
    if (isNaN(seconds) || seconds < 0) seconds = 0;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const setMarkStart = () => setStartMark(currentTime);
  const setMarkEnd = () => setEndMark(currentTime);

  const addSegment = () => {
    if (startMark === null || endMark === null) return alert('Por favor marca el inicio y fin del segmento');
    if (startMark >= endMark) return alert('El inicio debe ser menor que el fin');
    const newSegment: VideoSegment = { id: Date.now().toString(), start: startMark, end: endMark, duration: endMark - startMark };
    setSegments([...segments, newSegment]);
    setStartMark(null);
    setEndMark(null);
  };

  const removeSegment = (id: string) => setSegments(segments.filter((seg) => seg.id !== id));
  const clearMarks = () => { setStartMark(null); setEndMark(null); };
  const seekTo = (time: number) => { if (videoRef.current) videoRef.current.currentTime = time; };

  const handleAudioFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('audio/')) return alert('Por favor selecciona un archivo de audio');
    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio(audioUrl);
    audio.onloadedmetadata = () => {
      const newAudioTrack: AudioTrack = { id: Date.now().toString(), file, url: audioUrl, name: file.name, start: currentTime, duration: audio.duration, volume: 1.0 };
      setAudioTracks([...audioTracks, newAudioTrack]);
    };
  };

  const removeAudioTrack = (id: string) => setAudioTracks(audioTracks.filter((track) => track.id !== id));

  const openTitleEditor = () => {
    setCurrentTitle({ id: Date.now().toString(), text: '', start: currentTime, duration: 3, fontSize: 48, color: '#FFFFFF', position: 'bottom', backgroundColor: 'rgba(0,0,0,0.7)' });
    setShowTitleEditor(true);
  };

  const addTitle = () => {
    if (!currentTitle.text.trim()) return alert('Escribe un texto para el título');
    setTitles([...titles, currentTitle]);
    setShowTitleEditor(false);
  };

  const removeTitle = (id: string) => setTitles(titles.filter((title) => title.id !== id));

  const renderVideo = async () => {
    if (!mediaFile) return alert('Por favor, carga un archivo de video primero.');

    let segmentsToRender = segments;
    if (segments.length === 0) {
      // If no segments are defined, render the entire video
      segmentsToRender = [{
        id: 'full-video',
        start: 0,
        end: duration,
        duration: duration,
      }];
      alert('No se detectaron segmentos. Se renderizará el video completo.');
    }

    const videoSource = mediaFile.file || mediaFile.url;
    try {
      const resultUrl = await renderSegments(videoSource, segmentsToRender, mediaFile.name);
      if (resultUrl) {
        setRenderedUrl(resultUrl);
        if (onRenderComplete) onRenderComplete(resultUrl);
        alert('¡Video renderizado exitosamente! Puedes descargarlo ahora.');
      } else {
        alert('Error al renderizar el video.');
      }
    } catch (err: any) {
      alert(`Error al renderizar: ${err.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-950 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
            {!mediaFile ? (
              <div className="w-full p-4">
                <FileUpload onFileChange={handleFileChange} />
              </div>
            ) : (
              <video
                ref={videoRef}
                controls
                className="w-full h-full object-contain"
                src={mediaFile.url}
                crossOrigin="anonymous"
              >
                <source src={mediaFile.url} type={mediaFile.type === 'video' ? 'video/mp4' : 'audio/mpeg'} />
                Tu navegador no soporta el elemento de video.
              </video>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">Timeline</span>
              <span className="text-xs font-mono text-white">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="mb-2">
              <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">🎥 Video</div>
              <div className="relative h-10 bg-gray-700 rounded-lg overflow-hidden">
                {duration > 0 && (
                  <>
                    <div className="absolute top-0 left-0 h-full bg-red-500/30" style={{ width: `${(currentTime / duration) * 100}%` }} />
                    {startMark !== null && <div className="absolute top-0 h-full w-1 bg-green-500 z-10" style={{ left: `${(startMark / duration) * 100}%` }}><div className="absolute -top-1 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-[10px] px-1 rounded">IN</div></div>}
                    {endMark !== null && <div className="absolute top-0 h-full w-1 bg-red-600 z-10" style={{ left: `${(endMark / duration) * 100}%` }}><div className="absolute -top-1 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-[10px] px-1 rounded">OUT</div></div>}
                    {segments.map((segment) => <div key={segment.id} className="absolute top-0 h-full bg-blue-500/50 border-l-2 border-r-2 border-blue-500" style={{ left: `${(segment.start / duration) * 100}%`, width: `${((segment.end - segment.start) / duration) * 100}%` }} />)}
                    <div className="absolute top-0 h-full w-0.5 bg-white z-20" style={{ left: `${(currentTime / duration) * 100}%` }} />
                  </>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">🔊 Audio</div>
              <div className="relative h-8 bg-gray-700 rounded-lg overflow-hidden">
                {duration > 0 && <div className="absolute top-0 left-0 h-full w-full bg-green-500/20" />}
                {audioTracks.map((track) => <div key={track.id} className="absolute top-0 h-full bg-yellow-500/50 border-l-2 border-r-2 border-yellow-500" style={{ left: `${(track.start / duration) * 100}%`, width: `${(track.duration / duration) * 100}%` }} title={track.name} />)}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="flex border-b border-gray-700">
              <button onClick={() => setActiveTab('cut')} className={`flex-1 px-2 py-2 text-xs transition ${activeTab === 'cut' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>✂️ Cortar</button>
              <button onClick={() => setActiveTab('audio')} className={`flex-1 px-2 py-2 text-xs transition ${activeTab === 'audio' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>🎵 Audio</button>
              <button onClick={() => setActiveTab('titles')} className={`flex-1 px-2 py-2 text-xs transition ${activeTab === 'titles' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>📝 Títulos</button>
            </div>
            <div className="p-3">
              {activeTab === 'cut' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <button onClick={setMarkStart} disabled={!mediaFile} className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs transition flex items-center justify-center gap-1.5 disabled:bg-gray-600 disabled:cursor-not-allowed"><span>📍</span> Inicio</button>
                    <button onClick={setMarkEnd} disabled={!mediaFile} className="w-full px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-xs transition flex items-center justify-center gap-1.5 disabled:bg-gray-600 disabled:cursor-not-allowed"><span>📍</span> Fin</button>
                    <button onClick={addSegment} disabled={startMark === null || endMark === null} className="w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-xs transition flex items-center justify-center gap-1.5"><span>➕</span> Añadir</button>
                    <button onClick={clearMarks} disabled={!mediaFile} className="w-full px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"><span>🗑️</span> Limpiar</button>
                  </div>
                  {segments.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold mb-2">Segmentos ({segments.length})</h4>
                      <div className="space-y-1.5">
                        {segments.map((segment, index) => (
                          <div key={segment.id} className="flex items-center justify-between p-2 bg-gray-700 rounded text-xs">
                            <div className="flex items-center gap-2"><span className="font-bold text-blue-400">#{index + 1}</span><div>{formatTime(segment.start)} → {formatTime(segment.end)}</div></div>
                            <div className="flex gap-1">
                              <button onClick={() => seekTo(segment.start)} className="px-2 py-0.5 bg-gray-600 hover:bg-gray-500 rounded text-xs">▶️</button>
                              <button onClick={() => removeSegment(segment.id)} className="px-2 py-0.5 bg-red-600 hover:bg-red-700 rounded text-xs">🗑️</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'audio' && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Añade audio desde la posición actual</p>
                    <input ref={audioFileInputRef} type="file" accept="audio/*" onChange={handleAudioFileSelect} className="hidden" />
                    <button onClick={() => audioFileInputRef.current?.click()} disabled={!mediaFile} className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs transition flex items-center justify-center gap-1.5 disabled:bg-gray-600 disabled:cursor-not-allowed"><span>➕</span> Subir Audio</button>
                  </div>
                  {audioTracks.length > 0 && (
                     <div>
                       <h4 className="text-xs font-semibold mb-2">Audios ({audioTracks.length})</h4>
                       {/* ... audio track list ... */}
                     </div>
                  )}
                </div>
              )}
              {activeTab === 'titles' && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Añade texto desde la posición actual</p>
                    <button onClick={openTitleEditor} disabled={!mediaFile} className="w-full px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-xs transition flex items-center justify-center gap-1.5 disabled:bg-gray-600 disabled:cursor-not-allowed"><span>➕</span> Crear Título</button>
                  </div>
                  {titles.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold mb-2">Títulos ({titles.length})</h4>
                      {/* ... title list ... */}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-900/50 to-pink-900/50 border-2 border-red-500/50 rounded-lg p-3">
            <div className="space-y-2">
              <div>
                <h4 className="text-xs font-bold mb-1">Renderizar</h4>
                            <button onClick={renderVideo} disabled={rendering || !mediaFile} className="w-full px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-xs transition flex items-center justify-center gap-1.5">
                              {rendering ? '⚙️ Renderizando...' : '🎬 Renderizar'}
                            </button>              </div>
              {renderedUrl && !rendering && (
                <div className="p-2 bg-green-900/20 border border-green-500 rounded">
                  <a href={renderedUrl} download={mediaFile ? `edited_${mediaFile.name}`: 'edited_video.mp4'} className="w-full px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded text-xs transition flex items-center justify-center gap-1.5"><span>⬇️</span> Descargar</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
