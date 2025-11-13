import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises'; // Para operaciones async
import * as fsSync from 'fs'; // Para createWriteStream
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import r2Service from './r2.service'; // Importar el servicio R2

interface RenderJob {
  id: string;
  videoUrl: string; // url en R2
  segments: { start: number; end: number }[];
  status: 'queued' | 'processing' | 'completed' | 'error';
  progress: number;
  finalUrl: string | null;
  error?: string;
  createdAt: Date;
}

const jobs: { [key: string]: RenderJob } = {}; // Almacén en memoria para los trabajos de renderizado
let isProcessing = false; // Flag para evitar procesamiento concurrente

class RenderService {
  private tempDir: string;

  constructor() {
    this.tempDir = process.env.TEMP_DIR || '/tmp'; // Directorio temporal configurable
    this.ensureTempDirectory();
  }

  private async ensureTempDirectory() {
    try {
      await fs.mkdir(`${this.tempDir}/uploads`, { recursive: true });
    } catch (error) {
      console.error('Error creating temporary directory:', error);
    }
  }

  // Iniciar un nuevo trabajo de renderizado
  async createRenderJob(videoUrl: string, segments: { start: number; end: number }[]): Promise<string> {
    const jobId = `job-${uuidv4()}`;
    jobs[jobId] = {
      id: jobId,
      videoUrl,
      segments,
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
      finalUrl: null,
    };

    // Iniciar el procesamiento en segundo plano (sin esperar)
    this.processRenderQueue();

    return jobId;
  }

  // Obtener el estado de un trabajo
  getJobStatus(jobId: string): RenderJob | undefined {
    return jobs[jobId];
  }

  // Lógica del Trabajador de Renderizado
  async processRenderQueue() {
    if (isProcessing) {
      return; // Evitar procesamiento concurrente
    }

    const job = Object.values(jobs).find((j) => j.status === 'queued');
    if (!job) {
      return; // No hay trabajos en cola
    }

    isProcessing = true;
    job.status = 'processing';
    console.log(`Processing job: ${job.id}`);

    let inputFilePath: string | null = null;
    const tempFiles: string[] = []; // Para limpiar al final

    try {
      // 1. Descargar el video fuente desde la URL (que será una URL de R2 o similar)
      job.progress = 10;
      // Obtener el nombre del archivo de la URL para usarlo como nombre temporal
      const urlObject = new URL(job.videoUrl);
      const originalFileName = path.basename(urlObject.pathname);
      inputFilePath = path.join(this.tempDir, `render-in-${job.id}-${originalFileName}`);
      tempFiles.push(inputFilePath);

      // Usar axios para descargar el archivo
      const response = await axios({
        method: 'get',
        url: job.videoUrl,
        responseType: 'stream',
      });

      const writer = fsSync.createWriteStream(inputFilePath);
      response.data.pipe(writer);

      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => resolve());
        writer.on('error', reject);
      });

      console.log(`Job ${job.id}: Video downloaded to ${inputFilePath}`);

      // 2. Cortar los segmentos con FFmpeg
      job.progress = 30;
      const segmentOutputPaths: string[] = [];

      for (let i = 0; i < job.segments.length; i++) {
        const segment = job.segments[i];
        const outputSegmentPath = path.join(this.tempDir, `segment-${job.id}-${i}.mp4`);
        tempFiles.push(outputSegmentPath);
        segmentOutputPaths.push(outputSegmentPath);

        await new Promise((resolve, reject) => {
          ffmpeg(inputFilePath!)
            .setStartTime(segment.start)
            .setDuration(segment.end - segment.start)
            .outputOptions([
                "-c:v libx264",      // Codec de video H.264
                "-preset fast",      // Velocidad de encoding
                "-crf 23",           // Calidad (18-28, menor = mejor calidad)
                "-c:a aac",          // Codec de audio
                "-b:a 128k",         // Bitrate de audio
                "-movflags +faststart", // Optimizar para streaming
            ])
            .output(outputSegmentPath)
            .on('end', () => {
              console.log(`Job ${job.id}: Segment ${i} created`);
              resolve(null);
            })
            .on('error', (err) => {
              console.error(`Job ${job.id}: Error creating segment ${i}`, err);
              reject(err);
            })
            .run();
        });
      }
      job.progress = 60;

      // 3. Unir los segmentos
      const concatFilePath = path.join(this.tempDir, `concat-${job.id}.txt`);
      const concatContent = segmentOutputPaths.map((p) => `file '${p}'`).join('\n');
      await fs.writeFile(concatFilePath, concatContent);
      tempFiles.push(concatFilePath);

      const finalOutputName = `rendered-${job.id}.mp4`;
      const finalOutputPath = path.join(this.tempDir, finalOutputName);
      tempFiles.push(finalOutputPath);

      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(concatFilePath)
          .inputOptions(['-f concat', '-safe 0'])
          .outputOptions(['-c copy']) // Copiar codecs sin re-encodear
          .output(finalOutputPath)
          .on('end', () => {
            console.log(`Job ${job.id}: Segments merged successfully`);
            resolve(null);
          })
          .on('error', (err) => {
            console.error(`Job ${job.id}: Error merging segments`, err);
            reject(err);
          })
          .run();
      });
      job.progress = 80;

      // 4. Subir el resultado a R2
      if (!r2Service.isConfigured()) {
        throw new Error('R2 service not configured for upload');
      }
      const outputBuffer = await fs.readFile(finalOutputPath);
      const r2Key = r2Service.generateKey('rendered', finalOutputName); // 'rendered' como userId dummy
      const { url: publicUrl } = await r2Service.uploadFile(outputBuffer, r2Key, 'video/mp4');

      job.finalUrl = publicUrl;
      job.status = 'completed';
      job.progress = 100;
      console.log(`Job ${job.id}: Processing complete. Final URL: ${publicUrl}`);
    } catch (error: any) {
      console.error(`Job ${job.id}: Failed to process video`, error);
      job.status = 'error';
      job.error = error.message;
    } finally {
      // 5. Limpiar archivos temporales
      console.log(`Job ${job.id}: Cleaning up temporary files...`);
      for (const file of tempFiles) {
        try {
          await fs.unlink(file);
        } catch (err) {
          console.warn(`Failed to delete temp file ${file}:`, err);
        }
      }

      isProcessing = false;
      // Intentar procesar el siguiente trabajo en la cola después de un breve retraso
      setTimeout(() => this.processRenderQueue(), 1000);
    }
  }
}

export default new RenderService();
