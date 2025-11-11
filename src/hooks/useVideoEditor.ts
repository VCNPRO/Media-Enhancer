import { useState } from 'react';
import { useFFmpeg } from './useFFmpeg';

interface VideoSegment {
  id: string;
  start: number;
  end: number;
  duration: number;
}

interface UseVideoEditorReturn {
  rendering: boolean;
  progress: number;
  error: string | null;
  renderSegments: (
    file: File | string,
    segments: VideoSegment[],
    fileName: string
  ) => Promise<string | null>;
}

export const useVideoEditor = (): UseVideoEditorReturn => {
  const ffmpeg = useFFmpeg();
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const renderSegments = async (
    file: File | string,
    segments: VideoSegment[],
    fileName: string
  ): Promise<string | null> => {
    if (segments.length === 0) {
      setError('No hay segmentos para renderizar');
      return null;
    }

    try {
      setRendering(true);
      setProgress(0);
      setError(null);

      // Verificar si es una URL de Cloud Storage
      if (typeof file === 'string') {
        setError('Los archivos grandes en la nube deben procesarse en el servidor. Por ahora, usa archivos menores a 100MB.');
        setRendering(false);
        return null;
      }

      // Verificar tamaño del archivo
      if (file.size > 100 * 1024 * 1024) {
        setError('Archivo muy grande para procesamiento local. Máximo 100MB.');
        setRendering(false);
        return null;
      }

      // Cargar FFmpeg si no está cargado
      if (!ffmpeg.loaded) {
        console.log('🔄 Cargando FFmpeg...');
        setProgress(5);
        await ffmpeg.load();
        setProgress(10);
      }

      console.log('📝 Escribiendo archivo de video...');
      setProgress(15);

      // Escribir el archivo de entrada
      const inputFileName = 'input.mp4';
      await ffmpeg.writeFile(inputFileName, file);

      setProgress(25);

      // Ordenar segmentos por tiempo de inicio
      const sortedSegments = [...segments].sort((a, b) => a.start - b.start);

      console.log('✂️ Cortando segmentos...');

      // Crear un archivo de texto para concatenación
      const concatList: string[] = [];

      // Extraer cada segmento
      for (let i = 0; i < sortedSegments.length; i++) {
        const segment = sortedSegments[i];
        const segmentFileName = `segment_${i}.mp4`;

        console.log(`✂️ Extrayendo segmento ${i + 1}/${sortedSegments.length}: ${segment.start}s - ${segment.end}s`);

        // Comando FFmpeg para extraer el segmento
        // -ss: inicio, -t: duración, -c copy: copiar sin recodificar (rápido)
        await ffmpeg.executeCommand([
          '-i', inputFileName,
          '-ss', segment.start.toString(),
          '-t', (segment.end - segment.start).toString(),
          '-c', 'copy',
          '-avoid_negative_ts', '1',
          segmentFileName
        ]);

        concatList.push(`file '${segmentFileName}'`);

        // Actualizar progreso
        const segmentProgress = 25 + (i + 1) / sortedSegments.length * 50;
        setProgress(Math.round(segmentProgress));
      }

      console.log('🔗 Concatenando segmentos...');
      setProgress(80);

      // Crear archivo de concatenación
      const concatContent = concatList.join('\n');
      await ffmpeg.writeFile('concat.txt', concatContent);

      // Concatenar todos los segmentos
      const outputFileName = `edited_${fileName}`;
      await ffmpeg.executeCommand([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-c', 'copy',
        outputFileName
      ]);

      setProgress(90);

      console.log('📖 Leyendo archivo de salida...');

      // Leer el archivo de salida
      const data = await ffmpeg.readFile(outputFileName);

      console.log('🧹 Limpiando archivos temporales...');

      // Limpiar archivos temporales
      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile('concat.txt');
      await ffmpeg.deleteFile(outputFileName);

      for (let i = 0; i < sortedSegments.length; i++) {
        try {
          await ffmpeg.deleteFile(`segment_${i}.mp4`);
        } catch (err) {
          console.warn(`No se pudo eliminar segment_${i}.mp4`);
        }
      }

      setProgress(100);

      // Crear URL del video renderizado
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      console.log('✅ Video renderizado exitosamente');
      setRendering(false);

      return url;
    } catch (err: any) {
      console.error('❌ Error renderizando video:', err);
      setError(err.message || 'Error desconocido renderizando video');
      setRendering(false);
      return null;
    }
  };

  return {
    rendering,
    progress,
    error,
    renderSegments,
  };
};
