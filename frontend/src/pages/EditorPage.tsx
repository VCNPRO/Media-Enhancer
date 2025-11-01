import { Link } from 'react-router-dom';
import { ArrowLeft, Video, Upload } from 'lucide-react';

export default function EditorPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-2 hover:text-blue-400">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Video className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold">New Project</span>
          </div>
          <button className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Save Project
          </button>
        </div>
      </header>

      {/* Editor Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
          {/* Left Panel - Media Library */}
          <div className="lg:col-span-1 bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Media Library</h3>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 mb-2">Drop files here</p>
              <button className="text-blue-400 hover:underline text-sm">
                or browse
              </button>
            </div>
          </div>

          {/* Center - Preview */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg p-4">
            <div className="bg-black aspect-video rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Video className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p>No media selected</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Properties */}
          <div className="lg:col-span-1 bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Properties</h3>
            <div className="space-y-4 text-gray-400">
              <p className="text-sm">Select a media file to see properties</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Timeline</h3>
          <div className="bg-gray-700 h-32 rounded-lg flex items-center justify-center text-gray-500">
            <p>Drag media here to start editing</p>
          </div>
        </div>
      </main>
    </div>
  );
}
