import { useState, useEffect } from 'react';
import { Upload, Video, Download, Sparkles, Clock, FileVideo, Play, Trash2 } from 'lucide-react';
import { useTierAccess } from '../../hooks/useTierAccess';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '../../services/api';

interface VideoProject {
  id: string;
  name: string;
  file: string; // base64 or URL
  thumbnail: string;
  size: string;
  duration: string;
  createdAt: string;
}

export function SimpleDashboard() {
  const { tier, getTierLimits } = useTierAccess();
  const { user } = useUser();
  const navigate = useNavigate();
  const limits = getTierLimits();
  const [videos, setVideos] = useState<VideoProject[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Cargar videos desde localStorage
  useEffect(() => {
    console.log('👤 Usuario:', user?.id, '| Tier:', tier);
    if (user) {
      const key = `videos_${user.id}`;
      const savedVideos = localStorage.getItem(key);
      console.log(`📦 Cargando videos de localStorage (${key}):`, savedVideos ? 'encontrado' : 'vacío');
      if (savedVideos) {
        try {
          const parsedVideos = JSON.parse(savedVideos);
          setVideos(parsedVideos);
          console.log(`✅ Videos cargados:`, parsedVideos.length, 'videos');
        } catch (error) {
          console.error('❌ Error parseando videos:', error);
        }
      }
    }
  }, [user]);

  // Guardar videos en localStorage
  const saveVideos = (newVideos: VideoProject[]) => {
    if (!user) {
      console.error('❌ No hay usuario para guardar videos');
      alert('Error: Usuario no identificado');
      return;
    }

    try {
      const key = `videos_${user.id}`;
      const data = JSON.stringify(newVideos);
      localStorage.setItem(key, data);
      setVideos(newVideos);
      console.log(`✅ Videos guardados en localStorage (${key}):`, newVideos.length, 'videos');
    } catch (error) {
      console.error('❌ Error guardando en localStorage:', error);
      alert('Error al guardar el video. Tu navegador puede tener el almacenamiento lleno.');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processVideoFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      await processVideoFile(file);
    } else {
      alert('Por favor, arrastra un archivo de video válido');
    }
  };

  const processVideoFile = async (file: File) => {
    console.log('🎬 INICIANDO - Procesando video:', file.name, 'Tamaño:', formatFileSize(file.size), 'Tipo:', file.type);

    // Validar que sea un video
    if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      setUploadError('Por favor selecciona un archivo de video o audio válido');
      return;
    }

    // Validar tamaño máximo (100MB)
    const maxSizeMB = 100;
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > maxSizeMB) {
      setUploadError(`El archivo es muy grande (${fileSizeMB.toFixed(0)}MB). Máximo: ${maxSizeMB}MB`);
      return;
    }

    if (!user) {
      setUploadError('Error: Debes estar logueado para subir archivos');
      return;
    }

    console.log('✅ Validaciones pasadas, subiendo al servidor...');
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    try {
      // Subir archivo al backend con progreso
      const response = await uploadFile(file, (progress) => {
        console.log(`📊 Progreso: ${progress}%`);
        setUploadProgress(progress);
      });

      console.log('✅✅✅ VIDEO SUBIDO AL SERVIDOR:', response);

      // Crear entrada local (temporal hasta que tengamos listado desde BD)
      const newVideo: VideoProject = {
        id: response.data.fileId,
        name: file.name.replace(/\.[^/.]+$/, ''),
        file: URL.createObjectURL(file),
        thumbnail: '',
        size: formatFileSize(file.size),
        duration: '00:00',
        createdAt: new Date().toISOString(),
      };

      const updatedVideos = [newVideo, ...videos];
      saveVideos(updatedVideos);

      // Mostrar mensaje de éxito
      setUploadError(null);
      alert(`✅ ¡Archivo "${file.name}" subido exitosamente al servidor!\n\n📹 Aparece en "Videos Recientes" más abajo`);

      // Scroll a la sección de videos
      setTimeout(() => {
        const videosSection = document.querySelector('[data-videos-section]');
        if (videosSection) {
          videosSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);

      // Generar thumbnail en background
      setTimeout(async () => {
        try {
          const thumbnail = await createVideoThumbnail(file);
          const videosWithThumb = updatedVideos.map(v =>
            v.id === newVideo.id ? { ...v, thumbnail } : v
          );
          saveVideos(videosWithThumb);
        } catch (thumbError) {
          console.warn('⚠️ No se pudo generar thumbnail (no crítico):', thumbError);
        }
      }, 500);

    } catch (error: any) {
      console.error('❌ ERROR SUBIENDO:', error);

      // Mostrar mensaje específico del error
      const errorMessage = error.message || 'Error al subir el archivo. Por favor, intenta de nuevo.';
      setUploadError(errorMessage);

      // Mostrar alert con el error
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      console.log('🏁 Proceso de upload finalizado');
    }
  };

  const createVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const objectUrl = URL.createObjectURL(file);

      // Timeout de 10 segundos para generar thumbnail
      const timeout = setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Timeout generando thumbnail'));
      }, 10000);

      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.src = objectUrl;

      video.onloadedmetadata = () => {
        // Buscar frame en 0.5 segundos (más seguro que el segundo 1)
        video.currentTime = Math.min(0.5, video.duration / 2);
      };

      video.onseeked = () => {
        try {
          clearTimeout(timeout);
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          URL.revokeObjectURL(objectUrl);
          resolve(dataUrl);
        } catch (error) {
          URL.revokeObjectURL(objectUrl);
          reject(error);
        }
      };

      video.onerror = () => {
        clearTimeout(timeout);
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Error cargando video'));
      };

      // Intentar cargar
      video.load();
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  };

  const deleteVideo = (videoId: string) => {
    if (confirm('¿Estás seguro de eliminar este video?')) {
      const updatedVideos = videos.filter((v) => v.id !== videoId);
      saveVideos(updatedVideos);
    }
  };

  const openEditor = (videoId?: string) => {
    if (videoId) {
      navigate(`/editor/${videoId}`);
    } else {
      alert('Por favor, sube un video primero');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-[1600px] mx-auto">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Media Enhancer
            </h1>
            <p className="text-sm text-gray-400">
              Plan {tier === 'starter' ? 'Starter' : 'Creator'} • {limits.maxVideoDuration / 60} min • {limits.maxResolution}
            </p>
          </div>
          {tier !== 'professional' && (
            <button
              onClick={() => (window.location.href = '/pricing')}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            >
              ⚡ Mejorar Plan
            </button>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-4 mb-4">
          {/* Left: Upload Area */}
          <div
            className={`bg-gray-800/50 rounded-xl p-6 border-2 border-dashed transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 hover:border-blue-500/50'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-block p-4 bg-blue-600/20 rounded-full">
                  {uploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
                  ) : (
                    <Upload className="w-8 h-8 text-blue-400" />
                  )}
                </div>
              </div>
              <h2 className="text-lg font-bold mb-1">
                {uploading ? 'Subiendo al servidor...' : 'Sube tu video'}
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                {uploading
                  ? 'No cierres esta ventana'
                  : 'Arrastra aquí o selecciona'}
              </p>

              {/* Progress Bar */}
              {uploading && uploadProgress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-gray-300">Progreso</span>
                    <span className="text-xs font-semibold text-blue-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {uploadError && (
                <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-md">
                  <p className="text-sm text-red-200">{uploadError}</p>
                </div>
              )}

              {!uploading && (
                <>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept="video/*,audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <span className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-sm font-semibold cursor-pointer inline-block transition-all">
                      📁 Seleccionar Archivo
                    </span>
                  </label>
                  <p className="text-gray-500 text-xs mt-3">
                    Video/Audio • Máx 100MB • {limits.maxVideoDuration / 60} min
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            {/* Action 1: Cortar */}
            <button
              onClick={() => openEditor(videos[0]?.id)}
              disabled={videos.length === 0}
              className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all cursor-pointer group border border-gray-700 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-center"
            >
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-blue-600/20 rounded-lg group-hover:bg-blue-600/30 transition-all">
                  <Video className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <h3 className="text-sm font-semibold mb-1">Cortar</h3>
              <p className="text-gray-400 text-xs">
                Recorta videos
              </p>
            </button>

            {/* Action 2: Mejorar */}
            <button
              onClick={() =>
                tier === 'starter'
                  ? (window.location.href = '/pricing')
                  : openEditor(videos[0]?.id)
              }
              disabled={videos.length === 0 && tier !== 'starter'}
              className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all cursor-pointer group border border-gray-700 hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-center relative"
            >
              {tier === 'starter' && (
                <span className="absolute top-2 right-2 bg-purple-600 text-xs px-1.5 py-0.5 rounded font-semibold">
                  PRO
                </span>
              )}
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-purple-600/20 rounded-lg group-hover:bg-purple-600/30 transition-all">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <h3 className="text-sm font-semibold mb-1">Mejorar IA</h3>
              <p className="text-gray-400 text-xs">
                {tier === 'starter' ? 'Upgrade' : 'Mejora con IA'}
              </p>
            </button>

            {/* Action 3: Exportar */}
            <button
              onClick={() => videos.length > 0 && alert('Funcionalidad de descarga próximamente')}
              disabled={videos.length === 0}
              className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all cursor-pointer group border border-gray-700 hover:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-center"
            >
              <div className="flex justify-center mb-2">
                <div className="p-2 bg-green-600/20 rounded-lg group-hover:bg-green-600/30 transition-all">
                  <Download className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <h3 className="text-sm font-semibold mb-1">Descargar</h3>
              <p className="text-gray-400 text-xs">
                Exportar video
              </p>
            </button>
          </div>
        </div>

        {/* Recent Videos */}
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700" data-videos-section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              Videos ({videos.length})
            </h3>
            {videos.length > 0 && (
              <button className="text-blue-400 hover:text-blue-300 text-xs font-semibold">
                Ver todos →
              </button>
            )}
          </div>

          {videos.length === 0 ? (
            /* Empty State */
            <div className="text-center py-8">
              <div className="inline-block p-3 bg-gray-700/30 rounded-full mb-3">
                <FileVideo className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm">Aún no has subido videos</p>
            </div>
          ) : (
            /* Videos Grid */
            <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {videos.slice(0, 12).map((video) => (
                <div
                  key={video.id}
                  className="bg-gray-700/50 rounded-lg overflow-hidden border border-gray-600 hover:border-blue-500/50 transition-all group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <FileVideo className="w-16 h-16 text-blue-500 mb-2" />
                        <span className="text-xs text-gray-500">Procesando...</span>
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openEditor(video.id);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 rounded-full p-4 transform transition-transform group-hover:scale-110 shadow-lg"
                      >
                        <Play className="w-8 h-8 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-sm text-white truncate flex-1">
                        {video.name}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteVideo(video.id);
                        }}
                        className="text-gray-400 hover:text-red-400 ml-2"
                        title="Eliminar video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{video.size}</span>
                      <span>
                        {new Date(video.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help Section - Compact */}
        <div className="mt-4 bg-blue-900/10 rounded-lg p-3 border border-blue-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-xl mr-2">💡</span>
              <p className="text-gray-400 text-xs">
                <strong className="text-white">Nuevo aquí?</strong> Sube video → Edita → Descarga
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/pricing'}
              className="text-blue-400 hover:text-blue-300 text-xs font-semibold"
            >
              Ver planes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
