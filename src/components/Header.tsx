import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-gray-900/50 backdrop-blur-sm shadow-lg shadow-black/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-white">
                            <span className="text-red-500">Gemini</span> Media Enhancer
                        </h1>
                    </div>
                </div>
            </div>
        </header>
    );
};
