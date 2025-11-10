import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { PLANS, formatBytes } from '../config/plans';

interface Project {
  id: string;
  name: string;
  thumbnail: string;
  duration: string;
  size: number;
  resolution: string;
  fps: number;
  createdAt: Date;
  lastModified: Date;
}

export const DashboardPro: React.FC = () => {
  const { user, usage } = useUserStore();
  const [activeTab, setActiveTab] = useState<'projects' | 'tools' | 'ai'>('projects');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const aiUpscalingAccess = useFeatureAccess('aiUpscaling');
  const aiSubtitlesAccess = useFeatureAccess('aiAutoSubtitles');

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Proyecto Corporativo.mp4',
      thumbnail: '',
      duration: '0:15:30',
      size: 2.1 * 1024 * 1024 * 1024,
      resolution: '1920x1080',
      fps: 30,
      createdAt: new Date('2024-01-20'),
      lastModified: new Date('2024-01-22'),
    },
    {
      id: '2',
      name: 'Tutorial Youtube.mp4',
      thumbnail: '',
      duration: '0:08:45',
      size: 1.3 * 1024 * 1024 * 1024,
      resolution: '2560x1440',
      fps: 60,
      createdAt: new Date('2024-01-18'),
      lastModified: new Date('2024-01-21'),
    },
  ]);

  const plan = PLANS[user?.planId || 'premium'];
  const storageUsed = usage?.storageUsed || 0;
  const storageLimit = plan.limits.storageLimit;
  const storagePercent = (storageUsed / storageLimit) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Professional Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo & Nav */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎬</span>
                <div>
                  <h1 className="text-xl font-bold">Media Enhancer Pro</h1>
                  <p className="text-xs text-gray-400">
                    {plan.name}
                    {user?.planId === 'premium' && (
                      <span className="ml-2 text-yellow-500">⭐</span>
                    )}
                    {user?.planId === 'professional' && (
                      <span className="ml-2 text-purple-500">🚀</span>
                    )}
                  </p>
                </div>
              </div>

              <nav className="flex gap-6">
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`text-sm font-semibold ${
                    activeTab === 'projects'
                      ? 'text-white border-b-2 border-red-500'
                      : 'text-gray-400 hover:text-white'
                  } pb-1 transition`}
                >
                  📁 Proyectos
                </button>
                <button
                  onClick={() => setActiveTab('tools')}
                  className={`text-sm font-semibold ${
                    activeTab === 'tools'
                      ? 'text-white border-b-2 border-red-500'
                      : 'text-gray-400 hover:text-white'
                  } pb-1 transition`}
                >
                  🎬 Herramientas
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`text-sm font-semibold ${
                    activeTab === 'ai'
                      ? 'text-white border-b-2 border-red-500'
                      : 'text-gray-400 hover:text-white'
                  } pb-1 transition relative`}
                >
                  🤖 IA
                  {user?.planId === 'premium' && (
                    <span className="absolute -top-1 -right-3 text-xs">🔒</span>
                  )}
                </button>
              </nav>
            </div>

            {/* User & Actions */}
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-red-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(storagePercent, 100)}%` }}
                    />
                  </div>
                  <span>{formatBytes(storageUsed)}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-400">Usuario</p>
                <p className="text-sm font-semibold">{user?.name || 'Pro User'}</p>
              </div>

              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-8 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Proyectos Activos</p>
            <p className="text-2xl font-bold">{usage?.projectsCount || projects.length}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Almacenamiento</p>
            <p className="text-2xl font-bold">{formatBytes(storageUsed)}</p>
            <p className="text-xs text-gray-500">de {formatBytes(storageLimit)}</p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Exports este mes</p>
            <p className="text-2xl font-bold">{usage?.exportsThisMonth || 0}</p>
            <p className="text-xs text-gray-500">
              de {plan.limits.maxExportsPerMonth === 999999 ? '∞' : plan.limits.maxExportsPerMonth}
            </p>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Procesando</p>
            <p className="text-2xl font-bold">{usage?.activeProcessingJobs || 0}</p>
            <p className="text-xs text-gray-500">videos en cola</p>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Actions Bar */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
              <div className="flex gap-3">
                <Link
                  to="/editor/new"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <span>+</span>
                  Nuevo Proyecto
                </Link>
                <Link
                  to="/cloud-upload"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <span>☁️</span>
                  Subir a Nube
                </Link>
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition">
                  📤 Importar
                </button>
              </div>

              <div className="flex gap-2 items-center">
                <input
                  type="search"
                  placeholder="Buscar proyectos..."
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-red-500 transition"
                />
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${
                    viewMode === 'grid' ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'
                  } transition`}
                >
                  ▦
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${
                    viewMode === 'list' ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'
                  } transition`}
                >
                  ☰
                </button>
              </div>
            </div>

            {/* Projects Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-red-500 transition group"
                  >
                    <div className="aspect-video bg-gray-900 flex items-center justify-center">
                      <span className="text-4xl">📽️</span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold truncate mb-2" title={project.name}>
                        {project.name}
                      </h3>
                      <div className="text-xs text-gray-400 space-y-1">
                        <div className="flex justify-between">
                          <span>{project.resolution}</span>
                          <span>{project.fps}fps</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{project.duration}</span>
                          <span>{formatBytes(project.size)}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Link
                          to={`/editor/${project.id}`}
                          className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 rounded text-center text-sm font-semibold transition"
                        >
                          Abrir
                        </Link>
                        <button className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded transition text-sm">
                          ⋮
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-900 border-b border-gray-700">
                    <tr className="text-left text-sm text-gray-400">
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Resolución</th>
                      <th className="p-3">Duración</th>
                      <th className="p-3">Tamaño</th>
                      <th className="p-3">Modificado</th>
                      <th className="p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr
                        key={project.id}
                        className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                      >
                        <td className="p-3 font-semibold">{project.name}</td>
                        <td className="p-3 text-sm text-gray-400">{project.resolution}</td>
                        <td className="p-3 text-sm text-gray-400">{project.duration}</td>
                        <td className="p-3 text-sm text-gray-400">{formatBytes(project.size)}</td>
                        <td className="p-3 text-sm text-gray-400">
                          {project.lastModified.toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <Link
                            to={`/editor/${project.id}`}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold transition"
                          >
                            Abrir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Tools disponibles */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-red-500 transition text-center group cursor-pointer">
              <div className="text-5xl mb-3 group-hover:scale-110 transition">🎞️</div>
              <h3 className="font-bold mb-2">Transiciones</h3>
              <p className="text-sm text-gray-400">Fade, Dissolve, Wipe, Slide</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-red-500 transition text-center group cursor-pointer">
              <div className="text-5xl mb-3 group-hover:scale-110 transition">🎨</div>
              <h3 className="font-bold mb-2">Filtros</h3>
              <p className="text-sm text-gray-400">B&N, Sepia, Vintage, más</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-red-500 transition text-center group cursor-pointer">
              <div className="text-5xl mb-3 group-hover:scale-110 transition">🎭</div>
              <h3 className="font-bold mb-2">Chroma Key</h3>
              <p className="text-sm text-gray-400">Pantalla verde</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-red-500 transition text-center group cursor-pointer">
              <div className="text-5xl mb-3 group-hover:scale-110 transition">📝</div>
              <h3 className="font-bold mb-2">Títulos Animados</h3>
              <p className="text-sm text-gray-400">Lower thirds, efectos</p>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div>
            {user?.planId === 'premium' && (
              <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🔒</span>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Funciones IA Bloqueadas</h3>
                    <p className="text-gray-300 mb-4">
                      Las funciones de IA están disponibles en el Plan Professional.
                      Actualiza tu plan para desbloquear upscaling 4K, auto-subtítulos, mejora de audio y más.
                    </p>
                    <Link
                      to="/pricing"
                      className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
                    >
                      Actualizar a Professional →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gemini Studio - App Completa */}
              <Link
                to="/gemini/studio"
                className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 p-6 rounded-xl border-2 border-purple-400 text-center group relative"
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition">🎬</div>
                <h3 className="font-bold mb-2">Gemini Studio</h3>
                <p className="text-sm text-purple-100">App completa de IA</p>
              </Link>

              {/* AI Tools */}
              <Link
                to="/gemini/analysis"
                className={`bg-gray-800 p-6 rounded-xl border ${
                  aiUpscalingAccess.isLocked
                    ? 'border-gray-700 opacity-60 cursor-not-allowed pointer-events-none'
                    : 'border-purple-500 hover:border-purple-400 cursor-pointer'
                } transition text-center group relative`}
              >
                {aiUpscalingAccess.isLocked && (
                  <div className="absolute top-2 right-2 text-2xl">🔒</div>
                )}
                <div className="text-5xl mb-3 group-hover:scale-110 transition">🤖</div>
                <h3 className="font-bold mb-2">Análisis con IA</h3>
                <p className="text-sm text-gray-400">Describe y analiza contenido</p>
                {aiUpscalingAccess.isLocked && (
                  <p className="text-xs text-yellow-500 mt-2">
                    Requiere: {aiUpscalingAccess.requiredPlan}
                  </p>
                )}
              </Link>

              <Link
                to="/gemini/enhancement"
                className={`bg-gray-800 p-6 rounded-xl border ${
                  aiSubtitlesAccess.isLocked
                    ? 'border-gray-700 opacity-60 cursor-not-allowed pointer-events-none'
                    : 'border-purple-500 hover:border-purple-400 cursor-pointer'
                } transition text-center group relative`}
              >
                {aiSubtitlesAccess.isLocked && (
                  <div className="absolute top-2 right-2 text-2xl">🔒</div>
                )}
                <div className="text-5xl mb-3 group-hover:scale-110 transition">✨</div>
                <h3 className="font-bold mb-2">Mejora con IA</h3>
                <p className="text-sm text-gray-400">Colorear y mejorar medios</p>
                {aiSubtitlesAccess.isLocked && (
                  <p className="text-xs text-yellow-500 mt-2">
                    Requiere: {aiSubtitlesAccess.requiredPlan}
                  </p>
                )}
              </Link>

              <Link
                to="/gemini/creative"
                className={`bg-gray-800 p-6 rounded-xl border ${
                  aiUpscalingAccess.isLocked
                    ? 'border-gray-700 opacity-60 cursor-not-allowed pointer-events-none'
                    : 'border-purple-500 hover:border-purple-400 cursor-pointer'
                } transition text-center group relative`}
              >
                {aiUpscalingAccess.isLocked && (
                  <div className="absolute top-2 right-2 text-2xl">🔒</div>
                )}
                <div className="text-5xl mb-3 group-hover:scale-110 transition">🎨</div>
                <h3 className="font-bold mb-2">Generación Creativa</h3>
                <p className="text-sm text-gray-400">Crea imágenes desde ideas</p>
                {aiUpscalingAccess.isLocked && (
                  <p className="text-xs text-yellow-500 mt-2">
                    Requiere: {aiUpscalingAccess.requiredPlan}
                  </p>
                )}
              </Link>
            </div>
          </div>
        )}

        {/* Upgrade Banner for Premium users */}
        {user?.planId === 'premium' && (
          <div className="mt-8 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-2 border-purple-500/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <span>🚀</span>
                  ¿Listo para el poder completo de la IA?
                </h3>
                <p className="text-gray-300">
                  Actualiza a Professional y desbloquea todas las funciones de IA, upscaling 4K/8K,
                  y procesamiento ilimitado.
                </p>
              </div>
              <Link
                to="/pricing"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition whitespace-nowrap"
              >
                Ver Professional →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
