const ffmpeg = require('fluent-ffmpeg');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const { updateJob } = require('./renderJobs');

const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME || 'media-enhancer-vcn-videos';
const bucket = storage.bucket(bucketName);

// Descargar archivo desde URL
async function downloadFile(url, outputPath) {
  const protocol = url.startsWith('https') ? https : http;

  return new Promise((resolve, reject) => {
    const file = require('fs').createWriteStream(outputPath);

    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(outputPath);
      reject(err);
    });
  });
}

// Subir archivo a Cloud Storage
async function uploadToStorage(localPath, destinationPath) {
  await bucket.upload(localPath, {
    destination: destinationPath,
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });

  const publicUrl = `https://storage.googleapis.com/${bucketName}/${destinationPath}`;
  return publicUrl;
}

// Procesar video con FFmpeg
async function processVideo(jobId, videoUrl, options) {
  const { segments, title, audioUrl } = options;

  const tempDir = '/tmp';
  const inputPath = path.join(tempDir, `input-${jobId}.mp4`);
  const outputPath = path.join(tempDir, `output-${jobId}.mp4`);
  const audioPath = audioUrl ? path.join(tempDir, `audio-${jobId}.mp3`) : null;

  try {
    console.log(`[${jobId}] Descargando video desde:`, videoUrl);
    updateJob(jobId, 'processing', 10);

    // Descargar video
    await downloadFile(videoUrl, inputPath);
    console.log(`[${jobId}] Video descargado`);
    updateJob(jobId, 'processing', 30);

    // Descargar audio si se proporcionó
    if (audioUrl) {
      console.log(`[${jobId}] Descargando audio desde:`, audioUrl);
      await downloadFile(audioUrl, audioPath);
      console.log(`[${jobId}] Audio descargado`);
    }
    updateJob(jobId, 'processing', 40);

    // Configurar comando FFmpeg
    let command = ffmpeg(inputPath);

    // Aplicar cortes si hay segmentos
    if (segments && segments.length > 0) {
      // Por simplicidad, tomamos el primer segmento
      // En una implementación real, concatenarías múltiples segmentos
      const segment = segments[0];
      command = command
        .setStartTime(segment.start)
        .setDuration(segment.end - segment.start);

      console.log(`[${jobId}] Aplicando corte: ${segment.start}s - ${segment.end}s`);
    }

    // Reemplazar audio si se proporcionó
    if (audioPath) {
      command = command
        .input(audioPath)
        .outputOptions('-map 0:v') // Video del primer input
        .outputOptions('-map 1:a') // Audio del segundo input
        .outputOptions('-c:v copy') // Copiar codec de video
        .outputOptions('-c:a aac'); // Codec de audio AAC

      console.log(`[${jobId}] Reemplazando audio`);
    }

    // Añadir título si se proporcionó
    if (title) {
      // Configurar filtro de texto
      const drawtext = `drawtext=text='${title.replace(/'/g, "\\'")}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=50:shadowcolor=black:shadowx=2:shadowy=2`;
      command = command.videoFilters(drawtext);

      console.log(`[${jobId}] Añadiendo título: ${title}`);
    }

    updateJob(jobId, 'processing', 50);

    // Procesar video
    console.log(`[${jobId}] Iniciando procesamiento FFmpeg`);

    await new Promise((resolve, reject) => {
      command
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log(`[${jobId}] FFmpeg command:`, commandLine);
        })
        .on('progress', (progress) => {
          if (progress.percent) {
            const percent = Math.min(Math.round(progress.percent), 95);
            const adjustedProgress = 50 + (percent * 0.4); // 50-90%
            updateJob(jobId, 'processing', adjustedProgress);
            console.log(`[${jobId}] Progreso: ${percent}%`);
          }
        })
        .on('end', () => {
          console.log(`[${jobId}] Procesamiento completado`);
          resolve();
        })
        .on('error', (err) => {
          console.error(`[${jobId}] Error FFmpeg:`, err);
          reject(err);
        })
        .run();
    });

    updateJob(jobId, 'processing', 90);

    // Subir resultado a Cloud Storage
    console.log(`[${jobId}] Subiendo resultado a Cloud Storage`);
    const destinationPath = `rendered/${jobId}-${Date.now()}.mp4`;
    const finalUrl = await uploadToStorage(outputPath, destinationPath);

    console.log(`[${jobId}] Renderizado completo:`, finalUrl);
    updateJob(jobId, 'completed', 100, finalUrl);

    // Limpiar archivos temporales
    await cleanup([inputPath, outputPath, audioPath]);

    return finalUrl;

  } catch (error) {
    console.error(`[${jobId}] Error procesando video:`, error);
    updateJob(jobId, 'error', 0, null, error.message);

    // Limpiar archivos temporales en caso de error
    await cleanup([inputPath, outputPath, audioPath]);

    throw error;
  }
}

// Limpiar archivos temporales
async function cleanup(files) {
  for (const file of files) {
    if (file) {
      try {
        await fs.unlink(file);
      } catch (err) {
        // Ignorar errores si el archivo no existe
      }
    }
  }
}

module.exports = {
  processVideo
};
