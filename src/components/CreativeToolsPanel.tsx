import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { Loader } from './Loader';

interface CreativeToolsPanelProps {
    onGenerationComplete: (prompt: string, resultUrl: string) => void;
}

const LightbulbIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} viewBox="0 0 20 20" fill="currentColor">
      <path d="M11 3a1 1 0 100 2h.01a1 1 0 100-2H11zM10 1a1 1 0 011 1v1a1 1 0 11-2 0V2a1 1 0 011-1zM10 15a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM4.343 4.343a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM3 11a1 1 0 100 2h1a1 1 0 100-2H3zM16 11a1 1 0 100 2h1a1 1 0 100-2h-1zM13.657 4.343a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707zM10 5a5.99 5.99 0 00-4.78 9.584A1.002 1.002 0 006 15H9a1 1 0 011 1v.01A7 7 0 0010 5z" />
    </svg>
);

export const CreativeToolsPanel: React.FC<CreativeToolsPanelProps> = ({ onGenerationComplete }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Por favor, introduce una descripción para la imagen a generar.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImageUrl(null);
        try {
            const imageBase64 = await generateImage(prompt);
            const imageUrl = `data:image/jpeg;base64,${imageBase64}`;
            setGeneratedImageUrl(imageUrl);
            onGenerationComplete(prompt, imageUrl);
        } catch (err) {
            setError('Ocurrió un error durante la generación de la imagen. Por favor, inténtalo de nuevo.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 p-4">
            <div>
                <label htmlFor="generation-prompt" className="block text-sm font-medium text-gray-300 mb-2">
                    Describe la imagen que quieres crear
                </label>
                <textarea
                    id="generation-prompt"
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-white focus:ring-red-500 focus:border-red-500"
                    placeholder="Ej: Un astronauta montando a caballo en Marte, estilo fotorrealista..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </div>
            
            <div className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center font-semibold text-gray-300 mb-2">
                    <LightbulbIcon className="h-5 w-5 mr-2 text-yellow-400" />
                    Consejos para mejores resultados
                </div>
                <ul className="list-disc list-inside space-y-1">
                    <li><span className="font-semibold">Sé específico:</span> En lugar de "un coche", prueba "un deportivo rojo de los años 60 en una carretera costera al atardecer".</li>
                    <li><span className="font-semibold">Define el estilo:</span> Añade términos como "fotorrealista", "pintura al óleo", "arte digital 3D", "estética cyberpunk".</li>
                    <li><span className="font-semibold">Añade detalles:</span> Menciona la iluminación ("iluminación cinematográfica") o la composición ("primer plano", "vista panorámica").</li>
                </ul>
            </div>

            <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
                {isLoading ? 'Generando...' : 'Generar Imagen'}
            </button>
            
            {error && <p className="text-red-500 text-center">{error}</p>}
            
            {isLoading && <Loader message="Generando tu imagen, esto puede tomar unos segundos..." />}

            {generatedImageUrl && (
                <div className="bg-gray-800/50 p-4 rounded-lg space-y-4">
                    <h3 className="text-xl font-semibold text-white text-center">Imagen Generada</h3>
                    <div className="flex justify-center">
                        <img src={generatedImageUrl} alt="Generated" className="max-h-[40vh] w-auto rounded-lg object-contain" />
                    </div>
                </div>
            )}
        </div>
    );
};