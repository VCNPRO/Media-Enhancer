import React, { useState } from 'react';
import {
  Layout, Video, Wand2, Database, Settings, FolderOpen,
  TrendingUp, Clock, Activity, Zap, Download, Plus,
  Grid, List, Search, Filter, MoreVertical, Play,
  Pause, Upload, ChevronRight, BarChart3, Users
} from 'lucide-react';
import { useTierAccess } from '../../hooks/useTierAccess';

interface Project {
  id: string;
  name: string;
  duration: string;
  size: string;
  resolution: string;
  status: 'processing' | 'completed' | 'draft';
  progress?: number;
  thumbnail?: string;
  lastModified: string;
}

export function ProDashboard() {
  const { tier, getTierLimits } = useTierAccess();
  const limits = getTierLimits();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('projects');

  // Mock data
  const projects: Project[] = [
    {
      id: '1',
      name: 'Corporate Video 2025',
      duration: '12:34',
      size: '2.4 GB',
      resolution: '4K',
      status: 'completed',
      lastModified: '2 hours ago'
    },
    {
      id: '2',
      name: 'Product Launch',
      duration: '5:42',
      size: '890 MB',
      resolution: '1080p',
      status: 'processing',
      progress: 67,
      lastModified: '1 day ago'
    },
  ];

  const stats = [
    { label: 'Proyectos Activos', value: '12', change: '+3', icon: FolderOpen, color: 'blue' },
    { label: 'Tiempo de Renderizado', value: '45h', change: '-12%', icon: Clock, color: 'green' },
    { label: 'Storage Usado', value: '67 GB', change: '+8 GB', icon: Database, color: 'purple' },
    { label: 'Videos Exportados', value: '124', change: '+18', icon: TrendingUp, color: 'orange' },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top Bar - Professional */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Workspace Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Workspace:</span>
                <span className="text-sm font-semibold text-white">Professional</span>
              </div>
              <div className="h-4 w-px bg-gray-700"></div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Activity className="w-4 h-4" />
                <span>Sistema en línea</span>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-750 rounded-lg text-sm font-medium flex items-center space-x-2 border border-gray-700 hover:border-gray-600 transition-all">
                <Upload className="w-4 h-4" />
                <span>Importar</span>
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition-all">
                <Plus className="w-4 h-4" />
                <span>Nuevo Proyecto</span>
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-lg transition-all">
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - Professional Navigation */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-4 flex-1">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('projects')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'projects'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>Proyectos</span>
                <span className="ml-auto bg-gray-800 px-2 py-0.5 rounded text-xs">12</span>
              </button>

              <button
                onClick={() => setActiveTab('editor')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'editor'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Layout className="w-4 h-4" />
                <span>Editor Avanzado</span>
              </button>

              <button
                onClick={() => setActiveTab('ai')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'ai'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Wand2 className="w-4 h-4" />
                <span>IA Tools</span>
                <span className="ml-auto bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded text-xs font-bold">PRO</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => setActiveTab('team')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'team'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Equipo</span>
              </button>

              <button
                onClick={() => setActiveTab('storage')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'storage'
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Storage</span>
              </button>
            </nav>

            {/* Divider */}
            <div className="my-4 border-t border-gray-800"></div>

            {/* Quick Stats in Sidebar */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Recursos
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Storage</span>
                  <span className="text-xs font-semibold text-white">67 / 100 GB</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-1.5 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Generaciones IA</span>
                  <span className="text-xs font-semibold text-white">124 / ∞</span>
                </div>
                <div className="flex items-center text-xs text-green-400">
                  <Zap className="w-3 h-3 mr-1" />
                  <span>Ilimitado</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>v2.5.0 • API Online</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-950">
          {activeTab === 'projects' && (
            <div className="p-6">
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {stats.map((stat, idx) => (
                  <div key={idx} className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                      <span className={`text-xs font-semibold ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Projects Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Proyectos</h2>
                  <p className="text-sm text-gray-400">Gestiona todos tus proyectos de video</p>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Buscar proyectos..."
                      className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none w-64"
                    />
                  </div>

                  {/* Filter */}
                  <button className="p-2 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-800 transition-all">
                    <Filter className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-900 rounded-lg border border-gray-800 p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Projects Grid */}
              <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-3'}>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-gray-900 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer group overflow-hidden"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-all">
                          <Play className="w-6 h-6 text-white ml-0.5" />
                        </div>
                      </div>
                      {project.status === 'processing' && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-white font-semibold">Procesando...</span>
                            <span className="text-blue-400">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full transition-all"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          project.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                          project.status === 'processing' ? 'bg-blue-600/20 text-blue-400' :
                          'bg-gray-600/20 text-gray-400'
                        }`}>
                          {project.resolution}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white truncate">{project.name}</h3>
                        <button className="p-1 hover:bg-gray-800 rounded transition-all">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>{project.duration}</span>
                        <span>•</span>
                        <span>{project.size}</span>
                        <span>•</span>
                        <span>{project.lastModified}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add New Card */}
                <div className="bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer group overflow-hidden flex items-center justify-center aspect-video">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 transition-all">
                      <Plus className="w-6 h-6 text-gray-500 group-hover:text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500 group-hover:text-white">Nuevo Proyecto</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'editor' && (
            <div className="p-6">
              <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
                <Layout className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Editor Profesional</h3>
                <p className="text-gray-400">Timeline multipista con herramientas avanzadas</p>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="p-6">
              <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl p-8 border border-purple-500/20 text-center">
                <Wand2 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">IA Tools Professional</h3>
                <p className="text-gray-400">Herramientas de inteligencia artificial avanzadas</p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
                <BarChart3 className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Analytics & Métricas</h3>
                <p className="text-gray-400">Estadísticas detalladas de tus proyectos</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
