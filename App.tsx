import React, { useState } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { AnalysisPanel } from './components/AnalysisPanel';
import { EnhancementPanel } from './components/EnhancementPanel';
import { CreativeToolsPanel } from './components/CreativeToolsPanel';
import { Tabs } from './components/Tabs';
import { CustomVideoPlayer } from './components/CustomVideoPlayer';
import { HistorySidebar } from './components/HistorySidebar';
import { useCloudUpload } from './src/hooks/useCloudUpload';
import { ffmpegUtils } from './src/hooks/useFFmpeg';
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

    return