// Sistema simple de gestión de jobs de renderizado
const jobs = new Map();

class RenderJob {
  constructor(jobId, videoUrl, options) {
    this.jobId = jobId;
    this.videoUrl = videoUrl;
    this.options = options; // { segments, title, audioUrl }
    this.status = 'queued'; // queued, processing, completed, error
    this.progress = 0;
    this.finalUrl = null;
    this.error = null;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updateStatus(status, progress = null, finalUrl = null, error = null) {
    this.status = status;
    if (progress !== null) this.progress = progress;
    if (finalUrl !== null) this.finalUrl = finalUrl;
    if (error !== null) this.error = error;
    this.updatedAt = new Date();
  }
}

function createJob(jobId, videoUrl, options) {
  const job = new RenderJob(jobId, videoUrl, options);
  jobs.set(jobId, job);
  return job;
}

function getJob(jobId) {
  return jobs.get(jobId);
}

function updateJob(jobId, status, progress, finalUrl, error) {
  const job = jobs.get(jobId);
  if (job) {
    job.updateStatus(status, progress, finalUrl, error);
  }
  return job;
}

function deleteOldJobs() {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hora

  for (const [jobId, job] of jobs.entries()) {
    if (now - job.createdAt.getTime() > maxAge) {
      jobs.delete(jobId);
    }
  }
}

// Limpiar jobs antiguos cada 10 minutos
setInterval(deleteOldJobs, 10 * 60 * 1000);

module.exports = {
  createJob,
  getJob,
  updateJob
};
