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