const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Configurar CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'https://media-enhancer.vercel.app'],
  credentials: true
}));

// ✅ Aumentar límite de body
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// ✅ Configurar multer
const upload = multer({
  dest: '/tmp/',
  limits: { fileSize: 100 * 1024 * 1024 }
});

// ✅ Configurar Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME || 'media-enhancer-vcn-videos';
const bucket = storage.bucket(bucketName);

console.log('🚀 Server starting...');
console.log('📦 Bucket:', bucketName);
console.log('🔧 Project:', process.env.GCP_PROJECT_ID || 'media-enhancer-vcn-2025');

// ✅ Manejar preflight requests
app.options('*', cors());

// ✅ Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Media Enhancer Backend is running' });
});

// ✅ Endpoint para subir video
app.post('/upload', upload.single('file'), async (req, res) => {
  console.log('📤 Upload request received');
  
  try {
    if (!req.file) {
      console.error('❌ No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('📁 File:', req.file.originalname, req.file.size, 'bytes');

    const localFilePath = req.file.path;
    const fileName = `uploads/${Date.now()}-${req.file.originalname}`;
    const file = bucket.file(fileName);

    // Subir a Cloud Storage
    await bucket.upload(localFilePath, {
      destination: fileName,
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    console.log('☁️ Uploaded to Cloud Storage:', fileName);

    // Hacer el archivo público
    await file.makePublic();

    // Eliminar archivo temporal
    fs.unlinkSync(localFilePath);

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;

    console.log('✅ Upload successful:', publicUrl);

    res.json({
      message: 'File uploaded successfully',
      url: publicUrl,
      outputUrl: publicUrl,
      fileName: fileName
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// ✅ Endpoint para procesar video
app.post('/process', async (req, res) => {
  console.log('🎬 Process request received');
  
  try {
    const { videoUrl, options } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'No video URL provided' });
    }

    const inputPath = `/tmp/input-${Date.now()}.mp4`;
    const outputPath = `/tmp/output-${Date.now()}.mp4`;

    // Descargar video desde Cloud Storage
    const fileName = videoUrl.split('/').pop();
    await bucket.file(fileName).download({ destination: inputPath });

    console.log('📥 Downloaded from Cloud Storage');

    // Procesar con FFmpeg
    await new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath).output(outputPath);

      if (options?.format) command = command.format(options.format);
      if (options?.quality) command = command.videoBitrate(options.quality);
      if (options?.resolution) {
        const [width, height] = options.resolution.split('x');
        command = command.size(`${width}x${height}`);
      }

      command
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    console.log('🎞️ Video processed with FFmpeg');

    // Subir video procesado
    const outputFileName = `processed/${Date.now()}-processed.mp4`;
    await bucket.upload(outputPath, {
      destination: outputFileName,
      metadata: { contentType: 'video/mp4' },
    });

    await bucket.file(outputFileName).makePublic();

    // Limpiar archivos temporales
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    const outputUrl = `https://storage.googleapis.com/${bucketName}/${outputFileName}`;

    console.log('✅ Processing successful:', outputUrl);

    res.json({
      message: 'Video processed successfully',
      outputUrl: outputUrl
    });

  } catch (error) {
    console.error('❌ Processing error:', error);
    res.status(500).json({ error: 'Processing failed', details: error.message });
  }
});

// ✅ Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});