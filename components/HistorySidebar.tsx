import React from 'react';
import type { HistoryItem } from '../types';

interface HistorySidebarProps {
    history: HistoryItem[];
    onSelect: (item: HistoryItem) => void;
    onClear: () => void;
}

const HistoryIcon: React.FC<{ type: HistoryItem['type'] }> = ({ type }) => {
    switch(type) {
        case 'analysis':
             return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h4a1 1 0 100-2H7zm0 4a1 1 0 100 2h4a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
            );
        case 'storyboard':
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm2 1v2h12V7H4zm0 4v2h12v-2H4zm0 4v2h12v-2H4z" />
                </svg>
            )
        case 'enhancement':
        case 'creative':
        default:
             return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            );
    }
};

const getHistoryItemDetails = (item: HistoryItem) => {
    const typeText: Record<HistoryItem['type'], string> = {
        analysis: 'Análisis',
        enhancement: 'Mejora',
        creative: 'Generación',
        storyboard: 'Storyboard'
    };
    
    const typeColorClasses: Record<HistoryItem['type'], string> = {
        analysis: 'bg-blue-500/20 text-blue-400',
        enhancement: 'bg-green-500/20 text-green-400',
        creative: 'bg-purple-500/20 text-purple-400',
        storyboard: 'bg-yellow-500/20 text-yellow-400'
    };

    return {
        title: `${typeText[item.type]} - ${item.mediaType}`,
        colorClasses: typeColorClasses[item.type]
    }
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, onClear }) => {
    return (
        <aside className="w-80 bg-gray-900/50 p-4 space-y-4 border-r border-gray-700/50 h-screen sticky top-0">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">Historial de Operaciones</h2>
                <button onClick={onClear} className="text-sm text-red-500 hover:underline disabled:text-gray-600 disabled:no-underline" disabled={history.length === 0}>Limpiar todo</button>
            </div>
            {history.length === 0 ? (
                <div className="text-center text-gray-500 pt-10 h-full flex flex-col justify-center items-center">
                    <p>No hay operaciones en el historial.</p>
                    <p className="text-xs mt-2">Los resultados de tus análisis y mejoras aparecerán aquí.</p>
                </div>
            ) : (
                <ul className="space-y-2 overflow-y-auto" style={{maxHeight: 'calc(100vh - 8rem)'}}>
                    {history.map((item) => {
                        const { title, colorClasses } = getHistoryItemDetails(item);
                        return (
                             <li key={item.id}>
                                <button
                                    onClick={() => onSelect(item)}
                                    className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors flex items-center space-x-3"
                                >
                                    <div className={`p-1.5 rounded-full ${colorClasses}`}>
                                        <HistoryIcon type={item.type} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-medium text-gray-200 truncate">{title}</p>
                                        <p className="text-xs text-gray-400">{item.timestamp.toLocaleString()}</p>
                                    </div>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}
        </aside>
    );
};