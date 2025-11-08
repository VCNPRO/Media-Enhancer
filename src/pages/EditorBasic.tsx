import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileUploader, VideoMetadata } from '../components/FileUploader';
import { VideoPlayer } from '../components/VideoPlayer';
import { Timeline } from '../components/Timeline';
import { useModal } from '../components/Modal';
import { useFFmpeg, ffmpegUtils } from '../hooks/useFFmpeg';
import { formatBytes, formatDuration } from '../config/plans';
import { checkBrowserCompatibility, getBrowserRecommendations } from '../utils/browserCompatibility';

type EditorTab = 'trim' | 'volume' | 'rotate' | 'vhs';

interface VideoState {
  file: File;
  url: string;
  metadata: VideoMetadata;
}

export const EditorBasic: React.FC = () => {
  const navigate = useNavigate();
  const { loaded, loading, error: ffmpegError, progress: ffmpegProgress, load, executeCommand, writeFile, readFile, deleteFile } = useFFmpeg();
  const { showAlert, showConfirm, ModalComponent } = useModal();

  const [video, setVideo] = useState<VideoState | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('trim');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);

  // Trim state
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Volume state
  const [volumeMultiplier, setVolumeMultiplier] = useState(1);

  // Rotate state
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);

  // VHS enhancement state
  const [vhsEnhancement, setVhsEnhancement] = useState({
    reduceNoise: true,
    cropBlackBars: true,
    enhanceColors: false,
  });

  // Check browser compatibility on mount
  useEffect(() => {
    const compatibility = checkBrowserCompatibility();

    if (!compatibility.isSupported) {
      const recommendations = getBrowserRecommendations(compatibility);
      const message =
        `Tu navegador (${compatibility.browser}) no es totalmente compatible con esta aplicación.\n\n` +
        `Problemas detectados:\n${compatibility.issues.map(i => `• ${i}`).join('\n')}\n\n` +
        `Recomendaciones:\n${recommendations.map(r => `• ${r}`).join('\n')}`;

      showAlert('Navegador No Compatible', message, 'warning');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  // Load FFmpeg when component mounts
  useEffect(() => {
    if (!loaded && !loading) {
      load();
    }
  }, [loaded, loading, load]);

  // Sync FFmpeg progress with local state
  useEffect(() => {
    if (ffmpegProgress && processing) {
      // FFmpeg progress ratio is between 0 and 1
      const progressPercent = Math.round(ffmpegProgress.ratio * 100);
      // Durante el procesamiento FFmpeg, mostrar entre 20% y 90%
      // dejando 10% para lectura y preparación final
      const adjustedProgress = 20 + (progressPercent * 0.7);
      setProgress(Math.min(90, adjustedProgress));
    }
  }, [ffmpegProgress, processing]);

  const handleFileSelected = (file: File, metadata: VideoMetadata) => {
    const url = URL.createObjectURL(file);
    setVideo({ file, url, metadata });
    setStartTime(0);
    setEndTime(metadata.duration);
    setCurrentTime(0);
    setProcessedVideoUrl(null);

    // Show warning if file is large
    if (metadata.shouldUseServerProcessing) {
      showAlert(
        'Video Grande Detectado',
        `Este video es grande (${formatBytes(metadata.size)}). ` +
          `El procesamiento puede tardar varios minutos en el navegador.\n\n` +
          `Para videos muy grandes, considera usar el procesamiento en servidor (próximamente).`,
        'warning'
      );
    }

    // Auto-detect VHS and suggest enhancements
    if (metadata.isVHS) {
      showConfirm(
        'Video VHS Detectado',
        `Hemos detectado que este es un video VHS (720x576 PAL).\n\n` +
          `¿Quieres aplicar automáticamente mejoras para VHS?\n` +
          `• Reducción de ruido\n` +
          `• Recorte de bordes negros\n` +
          `• Mejora de colores`,
        () => {
          setActiveTab('vhs');
          setVhsEnhancement({
            reduceNoise: true,
            cropBlackBars: true,
            enhanceColors: true,
          });
        },
        'Sí, aplicar mejoras',
        'No, gracias'
      );
    }
  };

  const handleRangeChange = (start: number, end: number) => {
    setStartTime(start);
    setEndTime(end);
  };

  const handleTrimVideo = async () => {
    if (!video || !loaded) return;

    setProcessing(true);
    setProgress(0);
    setProcessingStage('Preparando archivo...');

    try {
      // Write input file to FFmpeg
      await writeFile('input.mp4', video.file);
      setProgress(10);
      setProcessingStage('Cortando video...');

      // Trim command (usando -c copy para no recodificar = más rápido)
      const command = [
        '-i',
        'input.mp4',
        '-ss',
        startTime.toString(),
        '-to',
        endTime.toString(),
        '-c',
        'copy', // Copy codec = no re-encoding = FAST
        'output.mp4',
      ];

      await executeCommand(command);
      setProgress(90);
      setProcessingStage('Finalizando...');

      // Read output
      const data = await readFile('output.mp4');
      const blob = ffmpegUtils.toBlobVideo(data);
      const url = URL.createObjectURL(blob);

      setProcessedVideoUrl(url);
      setProgress(100);
      setProcessingStage('¡Completado!');
    } catch (err) {
      console.error('Error trimming video:', err);
      showAlert('Error de Procesamiento', 'Error al cortar el video. Por favor, intenta de nuevo.', 'error');
    } finally {
      // Limpiar archivos temporales de FFmpeg para liberar memoria
      try {
        await deleteFile('input.mp4');
        await deleteFile('output.mp4');
      } catch (cleanupErr) {
        console.warn('Error cleaning up temporary files:', cleanupErr);
      }
      setProcessing(false);
      setProgress(0);
      setProcessingStage('');
    }
  };

  const handleAdjustVolume = async () => {
    if (!video || !loaded) return;

    setProcessing(true);
    setProgress(0);

    try {
      await writeFile('input.mp4', video.file);
      setProgress(20);

      // Volume adjustment command
      const command = [
        '-i',
        'input.mp4',
        '-af',
        `volume=${volumeMultiplier}`,
        '-c:v',
        'copy', // No re-encode video
        'output.mp4',
      ];

      await executeCommand(command);
      setProgress(80);

      const data = await readFile('output.mp4');
      const blob = ffmpegUtils.toBlobVideo(data);
      const url = URL.createObjectURL(blob);

      setProcessedVideoUrl(url);
      setProgress(100);
    } catch (err) {
      console.error('Error adjusting volume:', err);
      showAlert('Error de Procesamiento', 'Error al ajustar el volumen. Por favor, intenta de nuevo.', 'error');
    } finally {
      // Limpiar archivos temporales de FFmpeg para liberar memoria
      try {
        await deleteFile('input.mp4');
        await deleteFile('output.mp4');
      } catch (cleanupErr) {
        console.warn('Error cleaning up temporary files:', cleanupErr);
      }
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleRotateVideo = async () => {
    if (!video || !loaded) return;

    setProcessing(true);
    setProgress(0);

    try {
      await writeFile('input.mp4', video.file);
      setProgress(20);

      // Build filter string
      let filters: string[] = [];

      // Rotation
      if (rotation === 90) filters.push('transpose=1');
      if (rotation === 180) filters.push('transpose=1,transpose=1');
      if (rotation === 270) filters.push('transpose=2');

      // Flip
      if (flipHorizontal) filters.push('hflip');
      if (flipVertical) filters.push('vflip');

      const filterString = filters.join(',');

      const command = ['-i', 'input.mp4'];

      if (filterString) {
        command.push('-vf', filterString);
      }

      command.push('-c:a', 'copy'); // Keep audio as-is
      command.push('output.mp4');

      await executeCommand(command);
      setProgress(80);

      const data = await readFile('output.mp4');
      const blob = ffmpegUtils.toBlobVideo(data);
      const url = URL.createObjectURL(blob);

      setProcessedVideoUrl(url);
      setProgress(100);
    } catch (err) {
      console.error('Error rotating video:', err);
      showAlert('Error de Procesamiento', 'Error al rotar el video. Por favor, intenta de nuevo.', 'error');
    } finally {
      // Limpiar archivos temporales de FFmpeg para liberar memoria
      try {
        await deleteFile('input.mp4');
        await deleteFile('output.mp4');
      } catch (cleanupErr) {
        console.warn('Error cleaning up temporary files:', cleanupErr);
      }
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleVHSEnhancement = async () => {
    if (!video || !loaded) return;

    setProcessing(true);
    setProgress(0);

    try {
      await writeFile('input.mp4', video.file);
      setProgress(20);

      let filters: string[] = [];

      // Noise reduction
      if (vhsEnhancement.reduceNoise) {
        filters.push('hqdn3d=4:3:6:4.5'); // Denoise filter
      }

      // Crop black bars (typical VHS has black bars)
      // VHS PAL típicamente tiene bordes negros en top/bottom
      if (vhsEnhancement.cropBlackBars) {
        // Para VHS 720x576, usualmente hay ~18px de bordes arriba/abajo
        // crop=width:height:x:y donde x,y es la esquina superior izquierda
        filters.push('crop=720:540:0:18'); // Crop to 720x540, removing ~18px from top and bottom
      }

      // Color enhancement
      if (vhsEnhancement.enhanceColors) {
        filters.push('eq=saturation=1.2:contrast=1.1'); // Slight saturation and contrast boost
      }

      const command = ['-i', 'input.mp4'];

      if (filters.length > 0) {
        command.push('-vf', filters.join(','));
      }

      command.push('-c:a', 'copy');
      command.push('output.mp4');

      await executeCommand(command);
      setProgress(80);

      const data = await readFile('output.mp4');
      const blob = ffmpegUtils.toBlobVideo(data);
      const url = URL.createObjectURL(blob);

      setProcessedVideoUrl(url);
      setProgress(100);
    } catch (err) {
      console.error('Error enhancing VHS:', err);
      showAlert('Error de Procesamiento', 'Error al mejorar el video VHS. Por favor, intenta de nuevo.', 'error');
    } finally {
      // Limpiar archivos temporales de FFmpeg para liberar memoria
      try {
        await deleteFile('input.mp4');
        await deleteFile('output.mp4');
      } catch (cleanupErr) {
        console.warn('Error cleaning up temporary files:', cleanupErr);
      }
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (!processedVideoUrl) return;

    const a = document.createElement('a');
    a.href = processedVideoUrl;
    a.download = `editado_${video?.metadata.name || 'video.mp4'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetEditor = () => {
    if (video) {
      URL.revokeObjectURL(video.url);
    }
    if (processedVideoUrl) {
      URL.revokeObjectURL(processedVideoUrl);
    }
    setVideo(null);
    setProcessedVideoUrl(null);
    setStartTime(0);
    setEndTime(0);
    setVolumeMultiplier(1);
    setRotation(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
  };

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link to="/dashboard" className="flex items-center gap-2 hover:text-red-500 transition">
              <span>←</span>
              <span>Volver al Dashboard</span>
            </Link>
            <h1 className="text-xl font-bold">Editor Simple</h1>
            <div className="w-32"></div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Sube tu Video</h2>
            <p className="text-gray-400">
              Edita tus videos VHS y recuerdos familiares de forma sencilla
            </p>
          </div>

          {!loaded && !loading && (
            <div className="mb-8 p-4 bg-blue-900/50 border border-blue-500 rounded-lg text-center">
              <p className="mb-2">⚙️ Preparando el editor...</p>
              <button
                onClick={load}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
              >
                Cargar Editor
              </button>
            </div>
          )}

          {loading && (
            <div className="mb-8 p-6 bg-blue-900/50 border border-blue-500 rounded-lg">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <div className="text-left">
                  <p className="font-semibold">⏳ Cargando FFmpeg.wasm...</p>
                  <p className="text-sm text-blue-200">Esto puede tardar 30-60 segundos</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-blue-200 space-y-1">
                <p>• Descargando procesador de video (~30MB)</p>
                <p>• El sistema reintentará automáticamente si hay problemas</p>
                <p>• Por favor, mantén esta ventana abierta</p>
              </div>
            </div>
          )}

          {ffmpegError && (
            <div className="mb-8 p-6 bg-red-900/50 border border-red-500 rounded-lg">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-3xl">❌</span>
                <div className="flex-1">
                  <h3 className="font-bold text-xl mb-2">Error al cargar el editor</h3>
                  <p className="text-red-200 whitespace-pre-line">{ffmpegError}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  window.location.reload();
                }}
                className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
              >
                🔄 Recargar Página
              </button>
            </div>
          )}

          {loaded && <FileUploader onFileSelected={handleFileSelected} maxSize={10 * 1024 * 1024 * 1024} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={resetEditor} className="flex items-center gap-2 hover:text-red-500 transition">
            <span>←</span>
            <span>Cambiar Video</span>
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold truncate max-w-md" title={video.metadata.name}>
              {video.metadata.name}
            </h1>
            <p className="text-sm text-gray-400">
              {video.metadata.width}x{video.metadata.height} • {formatDuration(video.metadata.duration * 60)} •{' '}
              {formatBytes(video.metadata.size)}
              {video.metadata.isVHS && <span className="ml-2 text-yellow-500">📼 VHS</span>}
            </p>
          </div>
          <Link to="/dashboard" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
            Guardar y Salir
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 grid lg:grid-cols-[1fr,400px] gap-6">
        {/* Left: Preview */}
        <div className="space-y-6">
          <VideoPlayer
            src={processedVideoUrl || video.url}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
          />

          {activeTab === 'trim' && video.metadata.duration > 0 && (
            <Timeline
              duration={video.metadata.duration}
              startTime={startTime}
              endTime={endTime}
              onRangeChange={handleRangeChange}
              currentTime={currentTime}
            />
          )}

          {/* Processing Progress */}
          {processing && (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                  <span className="font-semibold">{processingStage || 'Procesando...'}</span>
                </div>
                <span className="text-sm text-gray-400 font-mono">{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full transition-all duration-300 shadow-lg"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {ffmpegProgress && ffmpegProgress.time > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  Tiempo procesado: {Math.floor(ffmpegProgress.time)}s
                </div>
              )}
            </div>
          )}

          {/* Result Actions */}
          {processedVideoUrl && (
            <div className="bg-green-900/30 border border-green-500 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-green-400 mb-1">✅ Video procesado correctamente</p>
                  <p className="text-sm text-gray-300">Puedes previsualizarlo arriba o descargarlo</p>
                </div>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition"
                >
                  💾 Descargar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Tools */}
        <div className="space-y-6">
          {/* Tabs */}
          <div className="bg-gray-800 rounded-lg p-1 grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab('trim')}
              className={`py-2 rounded font-semibold transition ${
                activeTab === 'trim' ? 'bg-red-600' : 'bg-transparent hover:bg-gray-700'
              }`}
            >
              ✂️ Cortar
            </button>
            <button
              onClick={() => setActiveTab('volume')}
              className={`py-2 rounded font-semibold transition ${
                activeTab === 'volume' ? 'bg-red-600' : 'bg-transparent hover:bg-gray-700'
              }`}
            >
              🔊 Volumen
            </button>
            <button
              onClick={() => setActiveTab('rotate')}
              className={`py-2 rounded font-semibold transition ${
                activeTab === 'rotate' ? 'bg-red-600' : 'bg-transparent hover:bg-gray-700'
              }`}
            >
              🔄 Rotar
            </button>
            <button
              onClick={() => setActiveTab('vhs')}
              className={`py-2 rounded font-semibold transition ${
                activeTab === 'vhs' ? 'bg-red-600' : 'bg-transparent hover:bg-gray-700'
              }`}
            >
              📼 VHS
            </button>
          </div>

          {/* Tool Panels */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            {activeTab === 'trim' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">Cortar Video</h3>
                <p className="text-sm text-gray-400">
                  Selecciona el rango que quieres conservar usando la línea de tiempo de abajo.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Inicio:</span>
                    <span className="font-mono text-green-400">{formatDuration(startTime * 60)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Final:</span>
                    <span className="font-mono text-red-400">{formatDuration(endTime * 60)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Duración final:</span>
                    <span className="font-mono text-yellow-400">{formatDuration((endTime - startTime) * 60)}</span>
                  </div>
                </div>
                <button
                  onClick={handleTrimVideo}
                  disabled={processing || !loaded}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold transition"
                >
                  {processing ? 'Procesando...' : '✂️ Aplicar Corte'}
                </button>
              </div>
            )}

            {activeTab === 'volume' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">Ajustar Volumen</h3>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Volumen:</span>
                    <span className="font-bold">{Math.round(volumeMultiplier * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={volumeMultiplier}
                    onChange={(e) => setVolumeMultiplier(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Silencio</span>
                    <span>Normal</span>
                    <span>3x</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVolumeMultiplier(0.5)}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded transition text-sm"
                  >
                    50%
                  </button>
                  <button
                    onClick={() => setVolumeMultiplier(1)}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded transition text-sm"
                  >
                    100%
                  </button>
                  <button
                    onClick={() => setVolumeMultiplier(1.5)}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded transition text-sm"
                  >
                    150%
                  </button>
                </div>
                <button
                  onClick={handleAdjustVolume}
                  disabled={processing || !loaded}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold transition"
                >
                  {processing ? 'Procesando...' : '🔊 Aplicar Volumen'}
                </button>
              </div>
            )}

            {activeTab === 'rotate' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">Rotar y Voltear</h3>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Rotación:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 90, 180, 270].map((deg) => (
                      <button
                        key={deg}
                        onClick={() => setRotation(deg as 0 | 90 | 180 | 270)}
                        className={`py-2 rounded font-semibold transition ${
                          rotation === deg ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flipHorizontal}
                      onChange={(e) => setFlipHorizontal(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span>Voltear Horizontalmente ↔️</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={flipVertical}
                      onChange={(e) => setFlipVertical(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span>Voltear Verticalmente ↕️</span>
                  </label>
                </div>

                <button
                  onClick={handleRotateVideo}
                  disabled={processing || !loaded || (rotation === 0 && !flipHorizontal && !flipVertical)}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold transition"
                >
                  {processing ? 'Procesando...' : '🔄 Aplicar Rotación'}
                </button>
              </div>
            )}

            {activeTab === 'vhs' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">📼 Mejoras para VHS</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Optimizaciones específicas para videos VHS digitalizados
                </p>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vhsEnhancement.reduceNoise}
                      onChange={(e) =>
                        setVhsEnhancement((prev) => ({ ...prev, reduceNoise: e.target.checked }))
                      }
                      className="mt-1 w-5 h-5"
                    />
                    <div>
                      <div className="font-semibold">Reducir Ruido</div>
                      <div className="text-xs text-gray-400">Elimina el típico "grano" del VHS</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vhsEnhancement.cropBlackBars}
                      onChange={(e) =>
                        setVhsEnhancement((prev) => ({ ...prev, cropBlackBars: e.target.checked }))
                      }
                      className="mt-1 w-5 h-5"
                    />
                    <div>
                      <div className="font-semibold">Recortar Bordes Negros</div>
                      <div className="text-xs text-gray-400">Detecta y elimina bordes automáticamente</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={vhsEnhancement.enhanceColors}
                      onChange={(e) =>
                        setVhsEnhancement((prev) => ({ ...prev, enhanceColors: e.target.checked }))
                      }
                      className="mt-1 w-5 h-5"
                    />
                    <div>
                      <div className="font-semibold">Mejorar Colores</div>
                      <div className="text-xs text-gray-400">Aumenta saturación y contraste levemente</div>
                    </div>
                  </label>
                </div>

                <button
                  onClick={handleVHSEnhancement}
                  disabled={
                    processing ||
                    !loaded ||
                    (!vhsEnhancement.reduceNoise && !vhsEnhancement.cropBlackBars && !vhsEnhancement.enhanceColors)
                  }
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold transition"
                >
                  {processing ? 'Procesando...' : '📼 Aplicar Mejoras VHS'}
                </button>

                {!video.metadata.isVHS && (
                  <div className="p-3 bg-yellow-900/30 border border-yellow-600 rounded text-sm">
                    <p className="text-yellow-200">
                      ℹ️ Este video no tiene las dimensiones típicas de VHS (720x576), pero puedes aplicar estas
                      mejoras de todos modos.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info Card */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-sm">
            <h4 className="font-bold mb-2">💡 Consejos</h4>
            <ul className="space-y-1 text-gray-400">
              <li>• Las ediciones se procesan en tu navegador</li>
              <li>• Videos pequeños (&lt;500MB) son instantáneos</li>
              <li>• Videos VHS grandes pueden tardar unos minutos</li>
              <li>• Puedes aplicar múltiples ediciones una tras otra</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal Component */}
      <ModalComponent />

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #ef4444;
          border-radius: 50%;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #ef4444;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};
