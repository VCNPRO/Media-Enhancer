const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const bucketName = process.env.GOOGLE_CLOUD_BUCKET;
const bucket = storage.bucket(bucketName);

// Configuración de Multer para subida temporal
const upload = multer({
  dest: "/tmp/uploads/",
  limits: { fileSize: 6 * 1024 * 1024 * 1024 }, // 6GB max
});

// Ruta de salud (health check)
app.get("/", (req, res) => {
  res.send("✅ Media Enhancer backend running in Cloud Run!");
});

// Endpoint para generar URL firmada para subida directa
app.post("/api/generate-upload-url", async (req, res) => {
  try {
    const { fileName, contentType } = req.body;
    
    if (!fileName || !contentType) {
      return res.status(400).json({ error: "fileName and contentType are required" });
    }

    const uniqueFileName = `uploads/${uuidv4()}-${fileName}`;
    const file = bucket.file(uniqueFileName);

    // Generar URL firmada para subida (válida por 15 minutos)
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutos
      contentType: contentType,
    });

    res.json({
      uploadUrl: url,
      fileName: uniqueFileName,
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ error: "Failed to generate upload URL", details: error.message });
  }
});

// Endpoint para procesar video con FFmpeg
app.post("/api/process-video", upload.single("video"), async (req, res) => {
  let inputPath = null;
  let outputPath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    inputPath = req.file.path;
    const outputFileName = `processed-${uuidv4()}.mp4`;
    outputPath = path.join("/tmp", outputFileName);

    console.log("Processing video:", inputPath);

    // Procesar video con FFmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          "-c:v libx264",      // Codec de video H.264
          "-preset fast",      // Velocidad de encoding
          "-crf 23",           // Calidad (18-28, menor = mejor calidad)
          "-c:a aac",          // Codec de audio
          "-b:a 128k",         // Bitrate de audio
          "-movflags +faststart", // Optimizar para streaming
        ])
        .output(outputPath)
        .on("end", () => {
          console.log("Video processing completed");
          resolve();
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          reject(err);
        })
        .run();
    });

    // Subir video procesado a Cloud Storage
    const destination = `processed/${outputFileName}`;
    await bucket.upload(outputPath, {
      destination: destination,
      metadata: {
        contentType: "video/mp4",
      },
    });

    // Generar URL pública
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;

    // Limpiar archivos temporales
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    res.json({
      success: true,
      message: "Video processed successfully",
      url: publicUrl,
      fileName: destination,
    });
  } catch (error) {
    console.error("Error processing video:", error);

    // Limpiar archivos en caso de error
    if (inputPath && fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
    if (outputPath && fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }

    res.status(500).json({
      error: "Failed to process video",
      details: error.message,
    });
  }
});

// Endpoint para obtener información de un video
app.get("/api/video-info/:fileName", async (req, res) => {
  try {
    const { fileName } = req.params;
    const file = bucket.file(fileName);

    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: "Video not found" });
    }

    const [metadata] = await file.getMetadata();
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + 60 * 60 * 1000, // 1 hora
    });

    res.json({
      fileName: fileName,
      size: metadata.size,
      contentType: metadata.contentType,
      created: metadata.timeCreated,
      url: url,
    });
  } catch (error) {
    console.error("Error getting video info:", error);
    res.status(500).json({ error: "Failed to get video info", details: error.message });
  }
});

// Endpoint para eliminar un video
app.delete("/api/video/:fileName", async (req, res) => {
  try {
    const { fileName } = req.params;
    const file = bucket.file(fileName);

    await file.delete();

    res.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ error: "Failed to delete video", details: error.message });
  }
});

// --- Renderizado en Servidor ---

const jobs = {}; // Almacén en memoria para los trabajos de renderizado

// Endpoint para iniciar un nuevo trabajo de renderizado
app.post("/api/render", async (req, res) => {
  try {
    const { videoUrl, segments } = req.body;

    if (!videoUrl || !segments || !Array.isArray(segments)) {
      return res.status(400).json({ error: "videoUrl and segments are required" });
    }

    const jobId = `job-${uuidv4()}`;
    jobs[jobId] = {
      id: jobId,
      videoUrl,
      segments,
      status: "queued",
      progress: 0,
      createdAt: new Date(),
    };

    // Iniciar el procesamiento en segundo plano (sin esperar)
    processRenderQueue();

    res.status(202).json({ jobId });
  } catch (error) {
    console.error("Error starting render job:", error);
    res.status(500).json({ error: "Failed to start render job", details: error.message });
  }
});

// Endpoint para consultar el estado de un trabajo
app.get("/api/render/status/:jobId", (req, res) => {
  const { jobId } = req.params;
  const job = jobs[jobId];

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  res.json({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    finalUrl: job.finalUrl || null,
  });
});

// --- Lógica del Trabajador de Renderizado ---

let isProcessing = false;

async function processRenderQueue() {
  if (isProcessing) {
    return; // Evitar procesamiento concurrente
  }

  const job = Object.values(jobs).find((j) => j.status === "queued");
  if (!job) {
    return; // No hay trabajos en cola
  }

  isProcessing = true;
  job.status = "processing";
  console.log(`Processing job: ${job.id}`);

  let inputPath = null;
  const outputFiles = [];

  try {
    // 1. Descargar el video fuente
    job.progress = 10;
    const originalFileName = path.basename(new URL(job.videoUrl).pathname);
    inputPath = path.join("/tmp", `render-in-${uuidv4()}-${originalFileName}`);
    
    const file = bucket.file(decodeURIComponent(originalFileName));
    await file.download({ destination: inputPath });
    console.log(`Job ${job.id}: Video downloaded to ${inputPath}`);

    // 2. Cortar los segmentos con FFmpeg
    job.progress = 30;
    const segmentPromises = job.segments.map((segment, index) => {
      return new Promise((resolve, reject) => {
        const outputSegmentPath = path.join("/tmp", `segment-${job.id}-${index}.mp4`);
        outputFiles.push(outputSegmentPath);

        ffmpeg(inputPath)
          .setStartTime(segment.start)
          .setDuration(segment.end - segment.start)
          .output(outputSegmentPath)
          .on("end", () => {
            console.log(`Job ${job.id}: Segment ${index} created`);
            resolve(outputSegmentPath);
          })
          .on("error", (err) => {
            console.error(`Job ${job.id}: Error creating segment ${index}`, err);
            reject(err);
          })
          .run();
      });
    });

    const processedSegments = await Promise.all(segmentPromises);
    job.progress = 60;

    // 3. Unir los segmentos
    const concatFilePath = path.join("/tmp", `concat-${job.id}.txt`);
    const concatContent = processedSegments.map(p => `file '${p}'`).join('\n');
    fs.writeFileSync(concatFilePath, concatContent);
    outputFiles.push(concatFilePath);

    const finalOutputName = `rendered-${job.id}.mp4`;
    const finalOutputPath = path.join("/tmp", finalOutputName);
    outputFiles.push(finalOutputPath);

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(concatFilePath)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions(['-c copy']) // Copiar codecs sin re-encodear
        .output(finalOutputPath)
        .on("end", () => {
          console.log(`Job ${job.id}: Segments merged successfully`);
          resolve();
        })
        .on("error", (err) => {
          console.error(`Job ${job.id}: Error merging segments`, err);
          reject(err);
        })
        .run();
    });
    job.progress = 80;

    // 4. Subir el resultado a GCS
    const destination = `rendered/${finalOutputName}`;
    await bucket.upload(finalOutputPath, {
      destination: destination,
      metadata: { contentType: "video/mp4" },
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
    job.finalUrl = publicUrl;
    job.status = "completed";
    job.progress = 100;
    console.log(`Job ${job.id}: Processing complete. Final URL: ${publicUrl}`);

  } catch (error) {
    console.error(`Job ${job.id}: Failed to process video`, error);
    job.status = "error";
    job.error = error.message;
  } finally {
    // 5. Limpiar archivos temporales
    console.log(`Job ${job.id}: Cleaning up temporary files...`);
    if (inputPath) fs.unlink(inputPath, (err) => err && console.error(`Failed to delete input: ${inputPath}`, err));
    outputFiles.forEach(f => fs.unlink(f, (err) => err && console.error(`Failed to delete temp file: ${f}`, err)));
    
    isProcessing = false;
    // Intentar procesar el siguiente trabajo en la cola
    setTimeout(processRenderQueue, 1000); 
  }
}

// Crear directorio temporal si no existe
if (!fs.existsSync("/tmp/uploads")) {
  fs.mkdirSync("/tmp/uploads", { recursive: true });
}

// Escuchar en el puerto asignado por Cloud Run
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Bucket: ${bucketName}`);
  console.log(`🌍 Project: ${process.env.GOOGLE_CLOUD_PROJECT}`);
});