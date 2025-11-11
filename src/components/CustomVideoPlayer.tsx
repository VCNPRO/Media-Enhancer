import React from 'react';

interface CustomVideoPlayerProps {
    url: string;
    type: string;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ url, type }) => {
    // Determinar el tipo MIME del video
    const getMimeType = (type: string, url: string): string => {
        if (type === 'video') {
            // Intentar detectar por extensión
            if (url.includes('.mp4')) return 'video/mp4';
            if (url.includes('.webm')) return 'video/webm';
            if (url.includes('.ogg')) return 'video/ogg';
            if (url.includes('.mov')) return 'video/quicktime';
            if (url.includes('.avi')) return 'video/x-msvideo';
            return 'video/mp4'; // Default
        }
        if (type === 'audio') {
            if (url.includes('.mp3')) return 'audio/mpeg';
            if (url.includes('.wav')) return 'audio/wav';
            if (url.includes('.ogg')) return 'audio/ogg';
            return 'audio/mpeg'; // Default
        }
        return 'video/mp4';
    };

    const mimeType = getMimeType(type, url);

    if (type === 'image') {
        return (
            <div className="w-full bg-gray-950 rounded-lg flex items-center justify-center">
                <img
                    src={url}
                    alt="Preview"
                    className="max-w-full max-h-[600px] object-contain rounded-lg"
                />
            </div>
        );
    }

    if (type === 'audio') {
        return (
            <div className="w-full bg-gray-950 rounded-lg p-8 flex items-center justify-center">
                <audio
                    key={url}
                    controls
                    className="w-full"
                    src={url}
                >
                    <source src={url} type={mimeType} />
                    Tu navegador no soporta el elemento de audio.
                </audio>
            </div>
        );
    }

    // Video player
    return (
        <div className="w-full bg-gray-950 rounded-lg">
            <video
                key={url}
                controls
                className="w-full max-h-[400px] object-contain rounded-lg"
                src={url}
                crossOrigin="anonymous"
            >
                <source src={url} type={mimeType} />
                Tu navegador no soporta el elemento de video.
            </video>
        </div>
    );
};
