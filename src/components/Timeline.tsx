import React, { useState, useRef } from 'react';

interface TimelineProps {
  duration: number;
  startTime: number;
  endTime: number;
  onRangeChange: (start: number, end: number) => void;
  currentTime?: number;
}

export const Timeline: React.FC<TimelineProps> = ({
  duration,
  startTime,
  endTime,
  onRangeChange,
  currentTime = 0,
}) => {
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeFromPosition = (clientX: number): number => {
    if (!timelineRef.current) return 0;

    const rect = timelineRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    return percent * duration;
  };

  const handleMouseDown = (type: 'start' | 'end') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newTime = getTimeFromPosition(e.clientX);

    if (isDragging === 'start') {
      // No permitir que start sea mayor que end
      const newStart = Math.min(newTime, endTime - 0.1);
      onRangeChange(newStart, endTime);
    } else {
      // No permitir que end sea menor que start
      const newEnd = Math.max(newTime, startTime + 0.1);
      onRangeChange(startTime, newEnd);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startTime, endTime]);

  const startPercent = (startTime / duration) * 100;
  const endPercent = (endTime / duration) * 100;
  const currentPercent = (currentTime / duration) * 100;
  const selectedDuration = endTime - startTime;

  return (
    <div className="space-y-3">
      {/* Info */}
      <div className="flex justify-between text-sm">
        <div>
          <span className="text-gray-400">Inicio:</span>{' '}
          <span className="font-semibold text-green-400">{formatTime(startTime)}</span>
        </div>
        <div>
          <span className="text-gray-400">Duración seleccionada:</span>{' '}
          <span className="font-semibold text-yellow-400">{formatTime(selectedDuration)}</span>
        </div>
        <div>
          <span className="text-gray-400">Final:</span>{' '}
          <span className="font-semibold text-red-400">{formatTime(endTime)}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Background */}
        <div
          ref={timelineRef}
          className="relative h-16 bg-gray-700 rounded-lg overflow-hidden cursor-pointer"
        >
          {/* Unselected regions (dark) */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-gray-800"
            style={{ width: `${startPercent}%` }}
          />
          <div
            className="absolute top-0 bottom-0 right-0 bg-gray-800"
            style={{ width: `${100 - endPercent}%` }}
          />

          {/* Selected region (highlighted) */}
          <div
            className="absolute top-0 bottom-0 bg-gradient-to-r from-red-600/50 to-red-500/50 border-t-2 border-b-2 border-red-500"
            style={{
              left: `${startPercent}%`,
              right: `${100 - endPercent}%`,
            }}
          >
            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-20 bg-stripes" />
          </div>

          {/* Current time indicator */}
          {currentTime > 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
              style={{ left: `${currentPercent}%` }}
            >
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
            </div>
          )}

          {/* Start handle */}
          <div
            className="absolute top-0 bottom-0 w-4 bg-green-500 cursor-ew-resize hover:bg-green-400 transition z-20 group"
            style={{ left: `${startPercent}%`, transform: 'translateX(-50%)' }}
            onMouseDown={handleMouseDown('start')}
          >
            <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-white" />
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 px-2 py-1 rounded text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition">
              {formatTime(startTime)}
            </div>
          </div>

          {/* End handle */}
          <div
            className="absolute top-0 bottom-0 w-4 bg-red-500 cursor-ew-resize hover:bg-red-400 transition z-20 group"
            style={{ left: `${endPercent}%`, transform: 'translateX(-50%)' }}
            onMouseDown={handleMouseDown('end')}
          >
            <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-white" />
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 px-2 py-1 rounded text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition">
              {formatTime(endTime)}
            </div>
          </div>
        </div>

        {/* Time markers */}
        <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
          <span>0:00</span>
          <span>{formatTime(duration / 4)}</span>
          <span>{formatTime(duration / 2)}</span>
          <span>{formatTime((duration * 3) / 4)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Quick presets */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => onRangeChange(0, duration)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs font-semibold transition"
        >
          Seleccionar Todo
        </button>
        <button
          onClick={() => onRangeChange(0, Math.min(60, duration))}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs font-semibold transition"
        >
          Primer Minuto
        </button>
        <button
          onClick={() => onRangeChange(Math.max(0, duration - 60), duration)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs font-semibold transition"
        >
          Último Minuto
        </button>
      </div>

      <style>{`
        .bg-stripes {
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255, 255, 255, 0.1) 10px,
            rgba(255, 255, 255, 0.1) 20px
          );
        }
      `}</style>
    </div>
  );
};
