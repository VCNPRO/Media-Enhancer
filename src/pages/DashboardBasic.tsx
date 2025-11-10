import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { PLANS, formatBytes } from '../config/plans';

interface Project {
  id: string;
  name: string;
  thumbnail: string;
  duration: string;
  size: number;
  createdAt: Date;
}

export const DashboardBasic: React.FC = () => {
  const { user, usage } = useUserStore();
  const [projects, setProjects] = useState<Project[]>([
    // Proyectos de ejemplo
    {
      id: '1',
      name: 'Boda 1995.mp4',
      thumbnail: '',
      duration: '2:35:00',
      size: 4.5 * 1024 * 1024 * 1024,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      name: 'Vacaciones verano 1998.mp4',
      thumbnail: '',
      duration: '1:45:30',
      size: 3.2 * 1024 * 1024 * 1024,
      createdAt: new Date('2024-01-10'),
    },
  ]);

  const plan = PLANS[user?.planId || 'basic'];
  const storageUsed = usage?.storageUsed || 0;
  const storageLimit = plan.limits.storageLimit;
  const storagePercent = (storageUsed / storageLimit) * 100;

  const projectsCount = usage?.projectsCount || projects.length;
  const maxProjects = plan.limits.maxProjects;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Simple */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎬</span>
              <div>
                <h1 className="text-2xl font-bold">Media Enhancer</h1>
                <p className="text-sm text-gray-400">Editor Simple</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Hola,</p>
                <p className="font-semibold">{user?.name || 'Usuario'}</p>
              </div>
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition">
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Storage Card */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-400">Almacenamiento</p>
                <p className="text-2xl font-bold">
                  {formatBytes(storageUsed)}
                </p>
              </div>
              <span className="text-3xl">💾</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(storagePercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {formatBytes(storageLimit)} disponibles
            </p>
          </div>

          {/* Projects Card */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-400">Proyectos</p>
                <p className="text-2xl font-bold">
                  {projectsCount} / {maxProjects}
                </p>
              </div>
              <span className="text-3xl">📁</span>
            </div>
            <p className="text-sm text-gray-300">
              {maxProjects - projectsCount} proyectos disponibles
            </p>
          </div>

          {/* Plan Card */}
          <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 p-6 rounded-xl border-2 border-red-500/50">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-400">Tu Plan</p>
                <p className="text-2xl font-bold">{plan.name}</p>
              </div>
              <span className="text-3xl">⭐</span>
            </div>
            <Link
              to="/pricing"
              className="inline-block text-sm text-red-400 hover:text-red-300 font-semibold"
            >
              Mejorar Plan →
            </Link>
          </div>
        </div>

        {/* Main Actions */}
        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">
            ¿Qué quieres hacer hoy?
          </h2>

          <div className="grid md:grid-cols-5 gap-4">
            {/* Nuevo Video */}
            <Link
              to="/editor/new"
              className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 p-6 rounded-xl text-center transition group"
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition">
                ✂️
              </div>
              <h3 className="font-bold text-lg">Editar Video</h3>
              <p className="text-sm text-red-100 mt-2">
                Cortar, añadir títulos y audio
              </p>
            </Link>

            {/* Cloud Upload */}
            <Link
              to="/cloud-upload"
              className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 p-6 rounded-xl text-center transition group"
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition">
                ☁️
              </div>
              <h3 className="font-bold text-lg">Subir a Nube</h3>
              <p className="text-sm text-blue-100 mt-2">
                Videos grandes hasta 6GB
              </p>
            </Link>

            {/* Mejorar Foto */}
            <Link
              to="/enhance-photo"
              className="bg-gray-700 hover:bg-gray-600 p-6 rounded-xl text-center transition group"
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition">
                🖼️
              </div>
              <h3 className="font-bold text-lg">Mejorar Foto</h3>
              <p className="text-sm text-gray-300 mt-2">
                Colorear fotos antiguas
              </p>
            </Link>

            {/* Cambiar Audio */}
            <Link
              to="/editor/audio"
              className="bg-gray-700 hover:bg-gray-600 p-6 rounded-xl text-center transition group"
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition">
                🎵
              </div>
              <h3 className="font-bold text-lg">Cambiar Audio</h3>
              <p className="text-sm text-gray-300 mt-2">
                Añadir o reemplazar sonido
              </p>
            </Link>

            {/* Rotar Video */}
            <Link
              to="/editor/rotate"
              className="bg-gray-700 hover:bg-gray-600 p-6 rounded-xl text-center transition group"
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition">
                🔄
              </div>
              <h3 className="font-bold text-lg">Rotar Video</h3>
              <p className="text-sm text-gray-300 mt-2">
                90°, 180° o voltear
              </p>
            </Link>
          </div>
        </div>

        {/* Herramientas IA */}
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-8 rounded-xl border border-purple-500/30 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">
              🤖 Herramientas de Inteligencia Artificial
            </h2>
            <p className="text-gray-400">
              Potencia tus medios con la tecnología de Gemini AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Gemini Studio - App Completa */}
            <Link
              to="/gemini/studio"
              className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 p-6 rounded-xl text-center transition group border-2 border-purple-400"
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition">
                🎬
              </div>
              <h3 className="font-bold text-lg">Gemini Studio</h3>
              <p className="text-sm text-purple-100 mt-2">
                App completa de IA
              </p>
            </Link>

            {/* Análisis IA */}
            <Link
              to="/gemini/analysis"
              className="bg-gray-800/80 hover:bg-gray-700/80 p-6 rounded-xl text-center transition group border border-purple-500/20"
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition">
                🤖
              </div>
              <h3 className="font-bold text-lg">Análisis con IA</h3>
              <p className="text-sm text-gray-300 mt-2">
                Describe y analiza tus archivos
              </p>
            </Link>

            {/* Mejora IA */}
            <Link
              to="/gemini/enhancement"
              className="bg-gray-800/80 hover:bg-gray-700/80 p-6 rounded-xl text-center transition group border border-purple-500/20"
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition">
                ✨
              </div>
              <h3 className="font-bold text-lg">Mejora con IA</h3>
              <p className="text-sm text-gray-300 mt-2">
                Colorear y mejorar calidad
              </p>
            </Link>

            {/* Creación IA */}
            <Link
              to="/gemini/creative"
              className="bg-gray-800/80 hover:bg-gray-700/80 p-6 rounded-xl text-center transition group border border-purple-500/20"
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition">
                🎨
              </div>
              <h3 className="font-bold text-lg">Generación Creativa</h3>
              <p className="text-sm text-gray-300 mt-2">
                Crea imágenes desde ideas
              </p>
            </Link>
          </div>
        </div>

        {/* Mis Videos */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Mis Videos</h2>
            <Link
              to="/editor/new"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
            >
              + Nuevo Video
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📼</div>
              <p className="text-gray-400 mb-4">
                Aún no tienes videos. ¡Empieza a editar!
              </p>
              <Link
                to="/editor/new"
                className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
              >
                Subir Primer Video
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-700/50 rounded-lg overflow-hidden hover:bg-gray-700 transition group cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gray-800 flex items-center justify-center">
                    <span className="text-5xl">📼</span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold truncate mb-2" title={project.name}>
                      {project.name}
                    </h3>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>{project.duration}</span>
                      <span>{formatBytes(project.size)}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link
                        to={`/editor/${project.id}`}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded text-center text-sm font-semibold transition"
                      >
                        Editar
                      </Link>
                      <button className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded transition">
                        ⋮
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upgrade Banner */}
        <div className="mt-8 bg-gradient-to-r from-red-900/50 to-pink-900/50 border-2 border-red-500/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">
                ¿Necesitas más funciones profesionales?
              </h3>
              <p className="text-gray-300">
                Actualiza a Premium y obtén editor multicapa, transiciones, filtros y mucho más.
              </p>
            </div>
            <Link
              to="/pricing"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition whitespace-nowrap"
            >
              Ver Planes →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
