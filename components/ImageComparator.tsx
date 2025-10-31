import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ImageComparatorProps {
    originalUrl: string;
    enhancedUrl: string;
}

export const ImageComparator: React.FC<ImageComparatorProps> = ({ originalUrl, enhancedUrl }) => {
    const [sliderPosition, setSliderPosition] = useState(50);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMove = useCallback((clientX: number) => {
        if (!imageContainerRef.current) return;
        const rect = imageContainerRef.current.getBoundingClientRect();
        let newX = clientX - rect.left;
        
        if (newX < 0) newX = 0;
        if (newX > rect.width) newX = rect.width;
        
        const newPosition = (newX / rect.width) * 100;
        setSliderPosition(newPosition);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        isDragging.current = true;
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        isDragging.current = true;
    };

    const onMouseUp = useCallback(() => {
        isDragging.current = false;
    }, []);
    
    const onMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging.current) return;
        e.preventDefault();
        handleMove(e.clientX);
    }, [handleMove]);

    const onTouchMove = useCallback((e: TouchEvent) => {
        if (!isDragging.current) return;
        handleMove(e.touches[0].clientX);
    }, [handleMove]);

    useEffect(() => {
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('touchend', onMouseUp);
        document.addEventListener('touchmove', onTouchMove);

        return () => {
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('touchend', onMouseUp);
            document.removeEventListener('touchmove', onTouchMove);
        };
    }, [onMouseUp, onMouseMove, onTouchMove]);

    return (
        <div 
            ref={imageContainerRef}
            className="relative w-full h-full select-none cursor-ew-resize overflow-hidden rounded-lg"
        >
            <img 
                src={originalUrl} 
                alt="Original" 
                className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none" 
            />
            <div 
                className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img 
                    src={enhancedUrl} 
                    alt="Enhanced" 
                    className="absolute top-0 left-0 w-full h-full object-contain"
                />
            </div>
            <div
                className="absolute top-0 bottom-0 w-1 bg-white/50 backdrop-blur-sm cursor-ew-resize"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 bg-white/50 rounded-full flex items-center justify-center border-2 border-white pointer-events-none shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                </div>
            </div>
        </div>
    );
};
