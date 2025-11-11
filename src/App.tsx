import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { AnalysisPanel } from './components/AnalysisPanel';
import { EnhancementPanel } from './components/EnhancementPanel';
import { CreativeToolsPanel } from './components/CreativeToolsPanel';
import { Tabs } from './components/Tabs';
import { CustomVideoPlayer } from './components/CustomVideoPlayer';
import { HistorySidebar } from './components/HistorySidebar';
import { useCloudUpload } from './hooks/useCloudUpload';
import { ffmpegUtils } from './hooks/useFFmpeg';
import type { MediaFile, AnalysisResult, EnhancementResult, StoryboardFrame, HistoryItem, CreativeResult } from '../types';

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

    // Hook para procesamiento en la nube
    const { uploading, processing, progress, error: cloudError, uploadAndProcess } = useCloudUpload();

    const handleFileChange = async (file: File | null) => {
        if (file) {
            const mediaType = getMediaType(file);
            const shouldUseCloud = ffmpegUtils.shouldUseServerProcessing(file.size);
            
            console.log(`📦 Archivo: ${file.name}`);
            console.log(`📏 Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`☁️ Usar Cloud: ${shouldUseCloud ? 'Sí' : 'No (local)'}`);
            
            setMediaFile({
                file,
                name: file.name,
                url: URL.createObjectURL(file),
                type: mediaType,
                useCloud: shouldUseCloud,
            });
            setActiveTab('analysis');
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
                mediaFile: mediaFile,
            });
        }
    };

    const handleCreativeComplete = (result: CreativeResult) => {
        if (mediaFile) {
            addToHistory({
                type: 'creative',
                mediaType: mediaFile.type,
                payload: result,
                mediaFile: mediaFile,
            });
        }
    };

    const handleHistoryItemClick = (item: HistoryItem) => {
        setSelectedHistoryItem(item);
        setMediaFile(item.mediaFile);
        
        // Switch to the appropriate tab based on history item type
        switch (item.type) {
            case 'analysis':
                setActiveTab('analysis');
                break;
            case 'enhancement':
                setActiveTab('enhancement');
                break;
            case 'creative':
            case 'storyboard':
                setActiveTab('creative');
                break;
        }
    };

    const handleDeleteHistoryItem = (id: string) => {
        setHistory(prev => prev.filter(item => item.id !== id));
        if (selectedHistoryItem?.id === id) {
            setSelectedHistoryItem(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <Header />

            <div className="flex flex-1 overflow-hidden">
                <HistorySidebar
                    history={history}
                    selectedItem={selectedHistoryItem}
                    onItemClick={handleHistoryItemClick}
                    onItemDelete={handleDeleteHistoryItem}
                />

                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {/* File Upload Section */}
                        {!mediaFile && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">Sube tu archivo multimedia</h2>
                                <FileUpload onFileChange={handleFileChange} />
                            </div>
                        )}

                        {/* Media Preview and Tools */}
                        {mediaFile && (
                            <>
                                {/* Media Player */}
                                <div className="bg-gray-800 rounded-lg p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h2 className="text-xl font-semibold">{mediaFile.name}</h2>
                                        <button
                                            onClick={() => handleFileChange(null)}
                                            className="text-sm text-gray-400 hover:text-white"
                                        >
                                            Cambiar archivo
                                        </button>
                                    </div>
                                    <CustomVideoPlayer url={mediaFile.url} type={mediaFile.type} />
                                </div>

                                {/* Tabs and Panels */}
                                <div className="bg-gray-800 rounded-lg overflow-hidden">
                                    <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

                                    <div className="p-6">
                                        {activeTab === 'analysis' && (
                                            <AnalysisPanel
                                                mediaFile={mediaFile}
                                                onAnalysisComplete={handleAnalysisComplete}
                                                onStoryboardComplete={handleStoryboardComplete}
                                            />
                                        )}

                                        {activeTab === 'enhancement' && (
                                            <EnhancementPanel
                                                mediaFile={mediaFile}
                                                onEnhancementComplete={handleEnhancementComplete}
                                            />
                                        )}

                                        {activeTab === 'creative' && (
                                            <CreativeToolsPanel
                                                mediaFile={mediaFile}
                                                onCreativeComplete={handleCreativeComplete}
                                            />
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;