import { useState, useEffect } from 'react';
import { Upload, Video, Download, Sparkles, Clock, FileVideo, Play, Trash2 } from 'lucide-react';
import { useTierAccess } from '../../hooks/useTierAccess';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

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
    if (!file.type.startsWith('video/')) {
      console.error('❌ Tipo de archivo inválido:', file.type);
      alert('Por favor selecciona un archivo de video válido (MP4, MOV, AVI)');
      return;
    }

    // Validar tamaño máximo (100MB por ahora para evitar problemas de memoria)
    const maxSizeMB = 100;
    const fileSizeMB = file.size / (1024 * 1024);

    console.log(`📊 Tamaño del archivo: ${fileSizeMB.toFixed(2)}MB / ${maxSizeMB}MB`);

    if (fileSizeMB > maxSizeMB) {
      console.error(`❌ Archivo muy grande: ${fileSizeMB.toFixed(2)}MB > ${maxSizeMB}MB`);
      alert(`El archivo es muy grande (${fileSizeMB.toFixed(0)}MB). Máximo: ${maxSizeMB}MB`);
      return;
    }

    if (!user) {
      console.error('❌ No hay usuario logueado');
      alert('Error: Debes estar logueado para subir videos');
      return;
    }

    console.log('✅ Validaciones pasadas, iniciando upload...');
    setUploading(true);

    // Pequeño delay para mostrar el estado de "subiendo"
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Crear nuevo proyecto de video SIN THUMBNAIL (por ahora)
      const newVideo: VideoProject = {
        id: Date.now().toString(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        file: URL.createObjectURL(file),
        thumbnail: '', // Sin thumbnail por ahora para evitar problemas
        size: formatFileSize(file.size),
        duration: '00:00',
        createdAt: new Date().toISOString(),
      };

      console.log('💾 GUARDANDO VIDEO:', {
        id: newVideo.id,
        name: newVideo.name,
        size: newVideo.size,
        userId: user.id
      });

      const updatedVideos = [newVideo, ...videos];

      console.log('📝 Videos antes de guardar:', videos.length);
      console.log('📝 Videos después de añadir:', updatedVideos.length);

      saveVideos(updatedVideos);

      console.log('✅✅✅ VIDEO GUARDADO EXITOSAMENTE ✅✅✅');

      // Scroll a la sección de videos recientes
      setTimeout(() => {
        const videosSection = document.querySelector('[data-videos-section]');
        if (videosSection) {
          videosSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 200);

      // Generar thumbnail en background (no bloquea)
      setTimeout(async () => {
        try {
          console.log('🖼️ Generando thumbnail en background...');
          const thumbnail = await createVideoThumbnail(file);

          // Actualizar el video con el thumbnail
          const videosWithThumb = updatedVideos.map(v =>
            v.id === newVideo.id ? { ...v, thumbnail } : v
          );
          saveVideos(videosWithThumb);
          console.log('✅ Thumbnail añadido');
        } catch (thumbError) {
          console.warn('⚠️ No se pudo generar thumbnail (no crítico):', thumbError);
        }
      }, 500);

      // Mejor mensaje de éxito
      alert(`✅ ¡Video "${newVideo.name}" subido exitosamente!\n\n📹 Aparece en "Videos Recientes" más abajo`);
    } catch (error) {
      console.error('❌❌❌ ERROR CRÍTICO:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setUploading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            ¡Bienvenido a Media Enhancer!
          </h1>
          <p className="text-gray-400 text-lg">
            Edita tus videos de forma simple y rápida
          </p>
        </div>

        {/* Plan Badge */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl p-6 mb-8 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-block bg-blue-500/20 text-blue-300 px-4 py-1 rounded-full text-sm font-semibold mb-2">
                Plan {tier === 'starter' ? 'Starter' : 'Creator'}
              </span>
              <p className="text-gray-300 mt-2">
                📹 Hasta {limits.maxVideoDuration / 60} min de video •
                🎬 Resolución {limits.maxResolution} •
                💾 {limits.storage / (1024 * 1024 * 1024)}GB de almacenamiento
              </p>
            </div>
            {tier !== 'professional' && (
              <button
                onClick={() => (window.location.href = '/pricing')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                ⚡ Mejorar Plan
              </button>
            )}
          </div>
        </div>

        {/* Main Upload Area */}
        <div
          className={`bg-gray-800/50 rounded-2xl p-12 mb-8 border-2 border-dashed transition-all ${
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
            <div className="mb-6">
              <div className="inline-block p-6 bg-blue-600/20 rounded-full">
                {uploading ? (
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
                ) : (
                  <Upload className="w-12 h-12 text-blue-400" />
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {uploading ? 'Procesando video...' : 'Sube tu video'}
            </h2>
            <p className="text-gray-400 mb-6">
              {uploading
                ? 'Esto puede tomar unos segundos'
                : 'Arrastra tu archivo aquí o haz clic para seleccionar'}
            </p>
            {!uploading && (
              <>
                <label className="inline-block">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold cursor-pointer inline-block shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                    📁 Seleccionar Video
                  </span>
                </label>
                <p className="text-gray-500 text-sm mt-4">
                  Formatos soportados: MP4, MOV, AVI • Máx: {limits.maxVideoDuration / 60} minutos
                </p>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions - Simple Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Action 1: Cortar */}
          <button
            onClick={() => openEditor(videos[0]?.id)}
            disabled={videos.length === 0}
            className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all cursor-pointer group border border-gray-700 hover:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-600/20 rounded-lg group-hover:bg-blue-600/30 transition-all">
                <Video className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold ml-3">Cortar Video</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Recorta y ajusta tus videos de forma sencilla
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
            className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all cursor-pointer group border border-gray-700 hover:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-left relative"
          >
            {tier === 'starter' && (
              <span className="absolute top-3 right-3 bg-purple-600 text-xs px-2 py-1 rounded-full font-semibold">
                PRO
              </span>
            )}
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-600/20 rounded-lg group-hover:bg-purple-600/30 transition-all">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold ml-3">Mejorar IA</h3>
            </div>
            <p className="text-gray-400 text-sm">
              {tier === 'starter'
                ? 'Mejora con IA disponible en Creator y Professional'
                : 'Mejora automática con inteligencia artificial'}
            </p>
          </button>

          {/* Action 3: Exportar */}
          <button
            onClick={() => videos.length > 0 && alert('Funcionalidad de descarga próximamente')}
            disabled={videos.length === 0}
            className="bg-gray-800/50 rounded-xl p-6 hover:bg-gray-800/70 transition-all cursor-pointer group border border-gray-700 hover:border-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-600/20 rounded-lg group-hover:bg-green-600/30 transition-all">
                <Download className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold ml-3">Descargar</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Exporta tu video listo para compartir
            </p>
          </button>
        </div>

        {/* Recent Videos */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700" data-videos-section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-400" />
              Videos Recientes ({videos.length})
            </h3>
            {videos.length > 0 && (
              <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
                Ver todos →
              </button>
            )}
          </div>

          {videos.length === 0 ? (
            /* Empty State */
            <div className="text-center py-12">
              <div className="inline-block p-4 bg-gray-700/30 rounded-full mb-4">
                <FileVideo className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400">Aún no has subido ningún video</p>
              <p className="text-gray-500 text-sm mt-1">
                Sube tu primer video para empezar
              </p>
            </div>
          ) : (
            /* Videos Grid */
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.slice(0, 6).map((video) => (
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

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-start">
            <span className="text-3xl mr-4">💡</span>
            <div>
              <h4 className="font-semibold text-lg mb-2">¿Primera vez usando Media Enhancer?</h4>
              <p className="text-gray-400 text-sm mb-3">
                Te ayudamos a empezar en 3 pasos simples:
              </p>
              <ol className="list-decimal list-inside text-gray-300 text-sm space-y-1">
                <li>Sube tu video desde tu ordenador</li>
                <li>Selecciona qué quieres hacer (cortar, mejorar, etc.)</li>
                <li>Descarga tu video editado</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
