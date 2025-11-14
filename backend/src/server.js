const express = require('express');
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');
const { createJob, getJob } = require('./renderJobs');
const { processVideo } = require('./videoProcessor');

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración CORS más permisiva
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://media-enhancer.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Habilitar pre-flight para todas las rutas

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME || 'media-enhancer-vcn-videos';
const bucket = storage.bucket(bucketName);

console.log('Server starting on port', PORT);
console.log('Bucket:', bucketName);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Media Enhancer Backend' });
});

app.get('/signed-url', async (req, res) => {
  console.log('Signed URL request received');
  try {
    const fileName = 'uploads/' + Date.now() + '-' + req.query.fileName;
    const file = bucket.file(fileName);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 10 * 60 * 1000,
      contentType: req.query.contentType || 'application/octet-stream'
    });

    const publicUrl = 'https://storage.googleapis.com/' + bucketName + '/' + fileName;

    console.log('Signed URL generated for:', fileName);
    res.json({ uploadUrl: url, publicUrl: publicUrl, fileName: fileName });
  } catch (error) {
    console.error('Signed URL error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/media/upload', async (req, res) => {
  console.log('Upload request received');
  try {
    // Generar nombre de archivo único
    const timestamp = Date.now();
    const fileName = `uploads/${timestamp}-video.mp4`;
    const file = bucket.file(fileName);

    // Obtener el archivo del body (se asume que viene como multipart/form-data)
    // Por ahora, usamos signed URL para que el frontend suba directamente
    const [uploadUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutos
      contentType: 'video/mp4'
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    console.log('Upload URL generated for:', fileName);
    res.json({
      data: {
        url: publicUrl,
        uploadUrl: uploadUrl,
        fileName: fileName
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.post('/api/media/render', async (req, res) => {
  console.log('Render request received');
  try {
    const { videoUrl, segments, title, audioUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: { message: 'videoUrl is required' } });
    }

    // Generar ID de trabajo único
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.log('Render job created:', jobId);
    console.log('Video:', videoUrl);
    console.log('Segments:', segments);
    console.log('Title:', title);
    console.log('Audio:', audioUrl);

    // Crear job en el sistema
    const job = createJob(jobId, videoUrl, { segments, title, audioUrl });

    // Iniciar procesamiento asíncrono (no bloqueante)
    processVideo(jobId, videoUrl, { segments, title, audioUrl })
      .catch(err => {
        console.error(`Error processing job ${jobId}:`, err);
      });

    // Devolver jobId inmediatamente
    res.json({
      data: {
        jobId: jobId
      }
    });
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.get('/api/media/render/status/:jobId', async (req, res) => {
  console.log('Render status request for job:', req.params.jobId);
  try {
    const { jobId } = req.params;

    const job = getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: { message: 'Job not found' } });
    }

    res.json({
      data: {
        status: job.status,
        progress: job.progress,
        finalUrl: job.finalUrl,
        error: job.error
      }
    });
  } catch (error) {
    console.error('Render status error:', error);
    res.status(500).json({ error: { message: error.message } });
  }
});

app.listen(PORT, () => {
  console.log('Server listening on port', PORT);
});
