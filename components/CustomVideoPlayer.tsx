import React from 'react';

interface CustomVideoPlayerProps {
    src: string;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ src }) => {
    return (
        <video
            key={src} // Add key to force re-mount when src changes, avoiding issues with old video state
            controls
            className="w-full h-full object-contain rounded-lg"
        >
            <source src={src} />
            Tu navegador no soporta el elemento de video.
        </video>
    );
};
