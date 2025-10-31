import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { AnalysisPanel } from './components/AnalysisPanel';
import { EnhancementPanel } from './components/EnhancementPanel';
import { CreativeToolsPanel } from './components/CreativeToolsPanel';
import { Tabs } from './components/Tabs';
import { CustomVideoPlayer } from './components/CustomVideoPlayer';
import { HistorySidebar } from './components/HistorySidebar';
import type { MediaFile, AnalysisResult, EnhancementResult, StoryboardFrame, HistoryItem, CreativeResult } from './types';

const getMediaType = (file: File): 'image' | 'video' | 'audio' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    // Fallback for uncommon mimetypes
    return 'image';
};

const App: React.FC = () => {
    const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
    const [activeTab, setActiveTab] = useState('creative');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);


    const handleFileChange = (file: File | null) => {
        if (file) {
            const mediaType = getMediaType(file);
            setMediaFile({
                file,
                name: file.name,
                url: URL.createObjectURL(file),
                type: mediaType,
            });
            setActiveTab('analysis'); // Switch to analysis tab when a file is uploaded
            setSelectedHistoryItem(null);
        } else {
            setMediaFile(null);
            setActiveTab('creative');
        }
    };
    
    const addToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
        const newHistoryItem: HistoryItem = {
            ...item,
            id: new Date().toISOString() + Math.random(),
            timestamp: new Date(),
        };
        setHistory(prev => [newHistoryItem, ...prev]);
        setSelectedHistoryItem(newHistoryItem);
    };

    const handleAnalysisComplete = (result: AnalysisResult) => {
        if (mediaFile) {
            addToHistory({
                type: 'analysis',
                mediaType: mediaFile.type,
                payload: result,
                mediaFile: mediaFile,
            });
        }
    };

    const handleStoryboardComplete = (result: StoryboardFrame[]) => {
        if (mediaFile) {
            addToHistory({
                type: 'storyboard',
                mediaType: mediaFile.type,
                payload: result,
                mediaFile: mediaFile,
            });
        }
    };
    
    const handleEnhancementComplete = (result: EnhancementResult) => {
        if (mediaFile) {
            addToHistory({
                type: 'enhancement',
                mediaType: mediaFile.type,
                payload: result,
                mediaFile: mediaFile
            });
        }
    };

    const handleGenerationComplete = (prompt: string, imageUrl: string) => {
        const result: CreativeResult = { prompt, imageUrl };
        addToHistory({
            type: 'creative',
            mediaType: 'none',
            payload: result,
        });
    };
    
    const handleHistorySelect = (item: HistoryItem) => {
        setSelectedHistoryItem(item);
        if (item.mediaFile) {
            setMediaFile(item.mediaFile);
        } else {
            setMediaFile(null);
        }
        
        if (item.type === 'creative') {
            setActiveTab('creative');
        } else {
            setActiveTab(item.type === 'storyboard' ? 'analysis' : item.type);
        }
    };
    
    const handleClearHistory = () => {
        setHistory([]);
        setSelectedHistoryItem(null);
    };

    const tabs = [
        { id: 'creative', label: 'Herramientas Creativas' },
        { id: 'analysis', label: 'Análisis de Medios' },
        { id: 'enhancement', label: 'Mejora de Medios' },
    ];
    
    const renderMediaPreview = () => {
        if (!mediaFile) return null;
        switch (mediaFile.type) {
            case 'image':
                return <img src={mediaFile.url} alt={mediaFile.name} className="max-h-[40vh] w-auto rounded-lg object-contain mx-auto" />;
            case 'video':
                return <div className="h-[40vh] w-full"><CustomVideoPlayer src={mediaFile.url} /></div>;
            case 'audio':
                return (
                    <div className="w-full p-4">
                        <p className="text-center text-gray-400 mb-2">{mediaFile.name}</p>
                        <audio controls src={mediaFile.url} className="w-full" />
                    </div>
                );
            default:
                return null;
        }
    };

    const renderPanel = () => {
        switch (activeTab) {
            case 'analysis':
                if (!mediaFile) {
                    return (
                        <div className="p-8 text-center">
                            <h3 className="text-xl font-semibold text-gray-300 mb-2">Análisis de Medios</h3>
                            <p className="text-gray-400">Sube una imagen, video o audio para analizar su contenido con IA.</p>
                        </div>
                    );
                }
                return <AnalysisPanel key={mediaFile.url} mediaFile={mediaFile} onAnalysisComplete={handleAnalysisComplete} onStoryboardComplete={handleStoryboardComplete} />;
            case 'enhancement':
                if (!mediaFile) {
                    return (
                        <div className="p-8 text-center">
                            <h3 className="text-xl font-semibold text-gray-300 mb-2">Mejora de Medios</h3>
                            <p className="text-gray-400 mb-4">Sube una imagen o audio para mejorar su calidad con IA.</p>
                            <div className="bg-gray-800/50 p-4 rounded-lg max-w-md mx-auto">
                                <p className="text-sm text-gray-400">
                                    <span className="font-semibold text-white">Imágenes:</span> Mejora calidad, colorea blanco y negro<br/>
                                    <span className="font-semibold text-white">Audio:</span> Elimina ruido de fondo, mejora claridad<br/>
                                    <span className="font-semibold text-white">Video:</span> No soportado actualmente
                                </p>
                            </div>
                        </div>
                    );
                }
                return <EnhancementPanel key={mediaFile.url} mediaFile={mediaFile} onEnhancementComplete={handleEnhancementComplete} />;
            case 'creative':
                return <CreativeToolsPanel onGenerationComplete={handleGenerationComplete} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <Header />
            <main className="flex">
                <HistorySidebar history={history} onSelect={handleHistorySelect} onClear={handleClearHistory} />
                <div className="flex-1 p-8 overflow-y-auto" style={{maxHeight: 'calc(100vh - 4rem)'}}>
                    <div className="max-w-4xl mx-auto">
                        {/* Mostrar FileUpload cuando no hay archivo y no estamos en creative */}
                        {!mediaFile && activeTab !== 'creative' && (
                            <div className="text-center space-y-8">
                                <h2 className="text-3xl font-bold">Sube un archivo para empezar</h2>
                                <p className="text-gray-400">Analiza, mejora o transforma tus imágenes, videos y audios con el poder de Gemini.</p>
                                <FileUpload onFileChange={handleFileChange} />
                            </div>
                        )}

                        {/* Mostrar contenido cuando hay archivo o estamos en creative */}
                        {(mediaFile || activeTab === 'creative') && (
                            <div className="space-y-6">
                                {/* Banner informativo cuando no hay archivo en pestañas que lo requieren */}
                                {!mediaFile && activeTab !== 'creative' && (
                                    <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-4">
                                        <p className="text-yellow-200 text-center">
                                            📁 Por favor, sube un archivo para usar esta función
                                        </p>
                                    </div>
                                )}

                                {/* Preview del archivo subido */}
                                {mediaFile && (
                                    <div className="bg-gray-800/50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold truncate" title={mediaFile.name}>{mediaFile.name}</h3>
                                            <button onClick={() => handleFileChange(null)} className="text-sm text-red-500 hover:underline">Cambiar archivo</button>
                                        </div>
                                        {renderMediaPreview()}
                                    </div>
                                )}

                                <div className="bg-gray-800/50 rounded-lg">
                                    <div className="px-4">
                                      <Tabs tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />
                                    </div>
                                    {renderPanel()}
                                </div>

                                {/* FileUpload visible en la parte inferior cuando no hay archivo */}
                                {!mediaFile && (
                                    <div className="mt-8">
                                        <h3 className="text-xl font-semibold mb-4 text-center">Sube un archivo para empezar</h3>
                                        <FileUpload onFileChange={handleFileChange} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
