/**
 * Sistema de Cola de Trabajos en Memoria
 *
 * Para una aplicación en producción real, considera usar:
 * - Bull/BullMQ con Redis
 * - AWS SQS
 * - Google Cloud Tasks
 *
 * Esta implementación en memoria es simple y funciona para el MVP.
 */

export interface RenderJob {
  id: string;
  userId: string;
  fileId: string;
  sourceUrl: string;
  segments: Array<{ start: number; end: number }>;
  status: 'queued' | 'processing' | 'completed' | 'error';
  progress: number;
  resultUrl?: string;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

class JobQueueService {
  private jobs: Map<string, RenderJob> = new Map();
  private queue: string[] = []; // Cola FIFO de job IDs
  private isProcessing: boolean = false;

  /**
   * Crear un nuevo trabajo de renderizado
   */
  createJob(input: {
    userId: string;
    fileId: string;
    sourceUrl: string;
    segments: Array<{ start: number; end: number }>;
  }): RenderJob {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const job: RenderJob = {
      id: jobId,
      userId: input.userId,
      fileId: input.fileId,
      sourceUrl: input.sourceUrl,
      segments: input.segments,
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
    };

    this.jobs.set(jobId, job);
    this.queue.push(jobId);

    console.log(`✅ Render job created: ${jobId}`);
    console.log(`📊 Queue size: ${this.queue.length}`);

    // Iniciar procesamiento si no está activo
    if (!this.isProcessing) {
      this.processNextJob();
    }

    return job;
  }

  /**
   * Obtener un trabajo por ID
   */
  getJob(jobId: string): RenderJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Obtener todos los trabajos de un usuario
   */
  getUserJobs(userId: string): RenderJob[] {
    return Array.from(this.jobs.values()).filter((job) => job.userId === userId);
  }

  /**
   * Actualizar el estado de un trabajo
   */
  updateJobStatus(
    jobId: string,
    status: RenderJob['status'],
    updates: Partial<Pick<RenderJob, 'progress' | 'resultUrl' | 'error'>> = {}
  ): void {
    const job = this.jobs.get(jobId);
    if (!job) {
      console.error(`❌ Job not found: ${jobId}`);
      return;
    }

    job.status = status;

    if (updates.progress !== undefined) {
      job.progress = updates.progress;
    }

    if (updates.resultUrl) {
      job.resultUrl = updates.resultUrl;
    }

    if (updates.error) {
      job.error = updates.error;
    }

    if (status === 'processing' && !job.startedAt) {
      job.startedAt = new Date();
    }

    if ((status === 'completed' || status === 'error') && !job.completedAt) {
      job.completedAt = new Date();
    }

    console.log(`📝 Job ${jobId} updated: ${status} (${updates.progress || 0}%)`);
  }

  /**
   * Procesar el siguiente trabajo en la cola
   */
  private async processNextJob(): Promise<void> {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      console.log('✅ Queue is empty');
      return;
    }

    this.isProcessing = true;
    const jobId = this.queue.shift()!;
    const job = this.jobs.get(jobId);

    if (!job) {
      console.error(`❌ Job not found in map: ${jobId}`);
      this.processNextJob();
      return;
    }

    console.log(`🚀 Processing job: ${jobId}`);

    // Actualizar estado a "processing"
    this.updateJobStatus(jobId, 'processing', { progress: 0 });

    try {
      // El procesamiento real se hace en render.service.ts
      // Este método solo gestiona la cola
      // El servicio de renderizado llamará a updateJobStatus() según avance

      // Por ahora, solo actualizamos a processing
      // El worker real (render.service.ts) manejará el progreso
    } catch (error) {
      console.error(`❌ Error processing job ${jobId}:`, error);
      this.updateJobStatus(jobId, 'error', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Procesar siguiente trabajo
    setTimeout(() => this.processNextJob(), 100);
  }

  /**
   * Obtener el siguiente trabajo en la cola para procesar
   */
  getNextQueuedJob(): RenderJob | undefined {
    const jobId = this.queue[0];
    if (!jobId) return undefined;

    const job = this.jobs.get(jobId);
    if (!job) {
      // Job no encontrado, remover de cola
      this.queue.shift();
      return this.getNextQueuedJob();
    }

    return job;
  }

  /**
   * Limpiar trabajos completados antiguos (más de 24 horas)
   */
  cleanOldJobs(): void {
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 24 horas

    let cleaned = 0;
    for (const [jobId, job] of this.jobs.entries()) {
      if (
        (job.status === 'completed' || job.status === 'error') &&
        job.completedAt &&
        job.completedAt.getTime() < cutoffTime
      ) {
        this.jobs.delete(jobId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} old jobs`);
    }
  }

  /**
   * Obtener estadísticas de la cola
   */
  getStats() {
    const jobs = Array.from(this.jobs.values());

    return {
      total: jobs.length,
      queued: jobs.filter((j) => j.status === 'queued').length,
      processing: jobs.filter((j) => j.status === 'processing').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      error: jobs.filter((j) => j.status === 'error').length,
      queueLength: this.queue.length,
      isProcessing: this.isProcessing,
    };
  }
}

// Singleton
const jobQueueService = new JobQueueService();

// Limpiar trabajos viejos cada hora
setInterval(() => {
  jobQueueService.cleanOldJobs();
}, 60 * 60 * 1000);

export default jobQueueService;
