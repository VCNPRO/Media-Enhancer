import React from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoEditorAdvanced } from '../components/VideoEditorAdvanced';

const EditorBasicPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard/basic')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Volver
            </button>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🎬</span>
              <div>
                <span className="text-xl font-bold">Media Enhancer</span>
                <div className="text-xs text-gray-400">Editor Básico</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <VideoEditorAdvanced />
      </main>
    </div>
  );
};

export default EditorBasicPage;
