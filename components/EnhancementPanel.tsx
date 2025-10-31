import React, { useState } from 'react';
import type { MediaFile, EnhancementResult, ImageEnhancementOptions } from '../types';
import { enhanceImage, enhanceAudio } from '../services/geminiService';
import { Loader } from './Loader';
import { ImageComparator } from './ImageComparator';

interface EnhancementPanelProps {
    mediaFile: MediaFile;
    onEnhancementComplete: (result: EnhancementResult) => void;
}

export const EnhancementPanel: React.FC<EnhancementPanelProps> = ({ mediaFile, onEnhancementComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [enhancementResult, setEnhancementResult] = useState<EnhancementResult | null>(null);
    const [imageOptions, setImageOptions] = useState<ImageEnhancementOptions>({ colorize: false });

    const handleEnhance = async () => {
        setIsLoading(true);
        setError(null);
        setEnhancementResult(null);

        try {
            let enhancedDataUrl: string;

            if (mediaFile.type === 'image') {
                const imageBase64 = await enhanceImage(mediaFile.file, imageOptions);
                enhancedDataUrl = `data:image/jpeg;base64,${imageBase64}`;
            } else if (mediaFile.type === 'audio') {
                const audioBase64 = await enhanceAudio(mediaFile.file);
                enhancedDataUrl = `data:audio/webm;base64,${audioBase64}`;
            } else {
                throw new Error("Unsupported media type for enhancement.");
            }

            const result: EnhancementResult = {
                originalUrl: mediaFile.url,
                enhancedUrl: enhancedDataUrl,
                type: mediaFile.type,
            };

            setEnhancementResult(result);
            onEnhancementComplete(result);
        } catch (err) {
            setError('Ocurrió un error durante la mejora. Por favor, inténtalo de nuevo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const renderOptions = () => {
        if (mediaFile.type === 'image') {
            return (
                <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h4 className="font-semibold text-gray-300 mb-2">Opciones de Mejora</h4>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="colorize-checkbox"
                            className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-red-600 focus:ring-red-500"
                            checked={imageOptions.colorize}
                            onChange={(e) => setImageOptions({ ...imageOptions, colorize: e.target.checked })}
                        />
                        <label htmlFor="colorize-checkbox" className="ml-3 text-sm text-gray-300">
                            Colorear imagen en blanco y negro
                        </label>
                    </div>
                </div>
            );
        }
        return null;
    }

    const renderResult = () => {
        if (!enhancementResult) return null;

        if (enhancementResult.type === 'image') {
            return (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white text-center">Resultado de la Mejora</h3>
                    <div className="h-[40vh] w-full">
                       <ImageComparator originalUrl={enhancementResult.originalUrl} enhancedUrl={enhancementResult.enhancedUrl} />
                    </div>
                </div>
            );
        }

        if (enhancementResult.type === 'audio') {
            return (
                <div className="space-y-4">
                     <h3 className="text-xl font-semibold text-white text-center">Resultado de la Mejora</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-bold text-gray-300 mb-2 text-center">Original</h4>
                            <audio controls src={enhancementResult.originalUrl} className="w-full" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-300 mb-2 text-center">Mejorado</h4>
                            <audio controls src={enhancementResult.enhancedUrl} className="w-full" />
                        </div>
                     </div>
                </div>
            );
        }
        
        return null;
    };

    return (
        <div className="space-y-6 p-4">
            <div className="text-center">
                 <h3 className="text-lg font-medium text-gray-300">Mejora de Medios con IA</h3>
                 <p className="text-sm text-gray-400 mt-1">
                    {mediaFile.type === 'image' && 'Mejora la calidad de tu imagen, o colorea una foto en blanco y negro.'}
                    {mediaFile.type === 'video' && 'La mejora de video no está disponible actualmente.'}
                    {mediaFile.type === 'audio' && 'Mejora la claridad de tu audio eliminando ruido de fondo.'}
                 </p>
            </div>
            
            {renderOptions()}

            <button
                onClick={handleEnhance}
                disabled={isLoading || mediaFile.type === 'video'}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
                {isLoading ? 'Mejorando...' : `Mejorar ${mediaFile.type === 'image' ? 'Imagen' : 'Audio'}`}
            </button>
            
            {error && <p className="text-red-500 text-center">{error}</p>}
            
            {isLoading && <Loader message="Aplicando mejoras, esto puede tardar unos segundos..." />}

            {enhancementResult && renderResult()}
        </div>
    );
};