
import React, { useState } from 'react';
import type { MediaFile, AnalysisResult, StoryboardFrame } from '../types';
import { analyzeMedia, generateStoryboard } from '../services/geminiService';
import { Loader } from './Loader';

interface AnalysisPanelProps {
    mediaFile: MediaFile;
    onAnalysisComplete: (result: AnalysisResult) => void;
    onStoryboardComplete: (result: StoryboardFrame[]) => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ mediaFile, onAnalysisComplete, onStoryboardComplete }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

    const [storyboard, setStoryboard] = useState<StoryboardFrame[] | null>(null);
    const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
    const [storyboardError, setStoryboardError] = useState<string | null>(null);


    const handleAnalyze = async () => {
        if (!prompt.trim()) {
            setError('Por favor, introduce una pregunta o instrucción para el análisis.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        try {
            const result = await analyzeMedia(mediaFile.file, prompt);
            setAnalysisResult(result);
            onAnalysisComplete(result);
        } catch (err) {
            setError('Ocurrió un error durante el análisis. Por favor, inténtalo de nuevo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateStoryboard = async () => {
        if (mediaFile.type !== 'video') return;

        setIsGeneratingStoryboard(true);
        setStoryboardError(null);
        setStoryboard(null);
        try {
            const result = await generateStoryboard(mediaFile.file);
            setStoryboard(result);
            onStoryboardComplete(result);
        } catch (err: any) {
            setStoryboardError(err.message || 'Ocurrió un error al generar el storyboard.');
            console.error(err);
        } finally {
            setIsGeneratingStoryboard(false);
        }
    };

    return (
        <div className="space-y-6 p-4">
            <div>
                <label htmlFor="analysis-prompt" className="block text-sm font-medium text-gray-300 mb-2">
                    ¿Qué quieres saber sobre este archivo?
                </label>
                <textarea
                    id="analysis-prompt"
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-red-500 focus:border-red-500"
                    placeholder="Ej: Describe la escena, transcribe el audio, identifica los objetos principales..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>
            <button
                onClick={handleAnalyze}
                disabled={isLoading || !prompt.trim()}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
                {isLoading ? 'Analizando...' : 'Analizar'}
            </button>
            
            {error && <p className="text-red-500 text-center">{error}</p>}
            
            {isLoading && <Loader message="Analizando el medio, esto puede tardar unos segundos..." />}

            {analysisResult && (
                <div className="bg-gray-800/50 p-4 rounded-lg space-y-4">
                    <h3 className="text-xl font-semibold text-white">Resultados del Análisis</h3>
                    <div>
                        <h4 className="font-bold text-gray-300">Descripción:</h4>
                        <p className="text-gray-400 whitespace-pre-wrap">{analysisResult.description}</p>
                    </div>
                     {analysisResult.transcript && (
                        <div>
                            <h4 className="font-bold text-gray-300">Transcripción:</h4>
                            <p className="text-gray-400 whitespace-pre-wrap">{analysisResult.transcript}</p>
                        </div>
                    )}
                    <div>
                        <h4 className="font-bold text-gray-300">Etiquetas:</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {analysisResult.tags.map((tag, index) => (
                                <span key={index} className="bg-gray-700 text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {mediaFile.type === 'video' && (
                <div className="border-t border-gray-700 pt-6 space-y-4">
                     <h3 className="text-lg font-medium text-gray-300">Herramienta de Video</h3>
                     <p className="text-sm text-gray-400">
                        Genera un guion gráfico (storyboard) a partir del primer fotograma de tu video para visualizar una posible continuación de la historia.
                    </p>
                    <button
                        onClick={handleGenerateStoryboard}
                        disabled={isGeneratingStoryboard}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        {isGeneratingStoryboard ? 'Generando Storyboard...' : 'Generar Storyboard'}
                    </button>
                    {storyboardError && <p className="text-red-500 text-center">{storyboardError}</p>}
                    {isGeneratingStoryboard && <Loader message="Generando storyboard... Este proceso puede tardar varios minutos." />}
                    {storyboard && (
                        <div className="space-y-4">
                             <h3 className="text-xl font-semibold text-white text-center">Storyboard Generado</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {storyboard.map((frame, index) => (
                                    <div key={index} className="bg-gray-800/50 rounded-lg overflow-hidden">
                                        <img src={frame.imageUrl} alt={`Storyboard panel ${index + 1}`} className="w-full h-48 object-cover" />
                                        <div className="p-4">
                                            <p className="text-sm text-gray-300">{frame.description}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};