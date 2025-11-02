# 🖥️ Client vs Server Processing - Media Enhancer

Estrategia de procesamiento: **95% cliente, 5% servidor**.

---

## 📊 Decisión Arquitectónica

### Por qué Cliente-Primero

**Costos:**
```
Procesamiento en servidor: $0.20/video
Procesamiento en cliente: $0.00/video

Ahorro con 1000 videos/mes: $200/mes
```

**Privacidad:**
- ✅ Videos nunca salen del navegador
- ✅ Datos sensibles permanecen locales
- ✅ Cumplimiento GDPR automático

**Escalabilidad:**
- ✅ Sin límite de usuarios concurrentes
- ✅ CPU distribuida (cada usuario usa su PC)
- ✅ Infraestructura más simple

---

## 🌐 Procesamiento en Cliente

### Tecnologías

#### 1. FFmpeg.wasm

**¿Qué es?**
- FFmpeg compilado a WebAssembly
- Corre completamente en el navegador
- Mismas funcionalidades que FFmpeg nativo

**Instalación:**
```bash
npm install @ffmpeg/ffmpeg @ffmpeg/util
```

**Ejemplo básico:**
```typescript
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

// Cargar FFmpeg.wasm
await ffmpeg.load({
  coreURL: await toBlobURL(
    'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
    'text/javascript'
  ),
  wasmURL: await toBlobURL(
    'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
    'application/wasm'
  ),
});

// Escribir archivo en sistema virtual
await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

// Ejecutar comando FFmpeg
await ffmpeg.exec([
  '-i', 'input.mp4',
  '-ss', '00:00:10',
  '-to', '00:00:30',
  '-c', 'copy',
  'output.mp4'
]);

// Leer resultado
const data = await ffmpeg.readFile('output.mp4');
const blob = new Blob([data.buffer], { type: 'video/mp4' });
```

**Ventajas:**
- ✅ Funcionalidad completa de FFmpeg
- ✅ No requiere servidor
- ✅ Gratis (costo = $0)

**Desventajas:**
- ⚠️ 50-70% más lento que FFmpeg nativo
- ⚠️ Limitado por RAM del navegador (~2GB en móviles)
- ⚠️ No funciona en navegadores muy antiguos

---

#### 2. WebCodecs API

**¿Qué es?**
- API nativa del navegador para codecs de video
- Hardware-accelerated
- Más rápido que FFmpeg.wasm

**Ejemplo:**
```typescript
const decoder = new VideoDecoder({
  output: (frame) => {
    // Procesar frame
    ctx.drawImage(frame, 0, 0);
    frame.close();
  },
  error: (e) => console.error(e),
});

decoder.configure({
  codec: 'vp8',
  codedWidth: 1920,
  codedHeight: 1080,
});

// Decodificar chunks
decoder.decode(chunk);
```

**Ventajas:**
- ✅ MÁS rápido (hardware accelerated)
- ✅ Menor consumo de RAM
- ✅ Nativo del navegador

**Desventajas:**
- ⚠️ API más compleja
- ⚠️ Menos funciones que FFmpeg
- ⚠️ Soporte limitado en navegadores antiguos

---

### Funciones Implementadas en Cliente

#### Nivel 1 - Starter (FFmpeg.wasm)

**Cortar fragmentos:**
```typescript
const trimVideo = async (file: File, start: number, end: number) => {
  await ffmpeg.writeFile('input.mp4', await fetchFile(file));

  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-ss', formatTime(start),
    '-to', formatTime(end),
    '-c', 'copy',  // Copia sin re-encodear (rápido)
    'output.mp4'
  ]);

  const data = await ffmpeg.readFile('output.mp4');
  return new Blob([data.buffer], { type: 'video/mp4' });
};
```

**Ajustar volumen:**
```typescript
const adjustVolume = async (file: File, volume: number) => {
  await ffmpeg.writeFile('input.mp4', await fetchFile(file));

  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-filter:a', `volume=${volume}`,  // 1.0 = normal, 2.0 = doble
    '-c:v', 'copy',  // Video sin cambios
    'output.mp4'
  ]);

  const data = await ffmpeg.readFile('output.mp4');
  return new Blob([data.buffer], { type: 'video/mp4' });
};
```

**Añadir música:**
```typescript
const addMusic = async (videoFile: File, audioFile: File) => {
  await ffmpeg.writeFile('video.mp4', await fetchFile(videoFile));
  await ffmpeg.writeFile('audio.mp3', await fetchFile(audioFile));

  await ffmpeg.exec([
    '-i', 'video.mp4',
    '-i', 'audio.mp3',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-shortest',  // Cortar al más corto
    'output.mp4'
  ]);

  const data = await ffmpeg.readFile('output.mp4');
  return new Blob([data.buffer], { type: 'video/mp4' });
};
```

**Rotar video:**
```typescript
const rotateVideo = async (file: File, degrees: 90 | 180 | 270) => {
  const transposeMap = {
    90: '1',   // 90° clockwise
    180: '2,transpose=2',  // 180°
    270: '2',  // 90° counter-clockwise
  };

  await ffmpeg.writeFile('input.mp4', await fetchFile(file));

  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-vf', `transpose=${transposeMap[degrees]}`,
    '-c:a', 'copy',
    'output.mp4'
  ]);

  const data = await ffmpeg.readFile('output.mp4');
  return new Blob([data.buffer], { type: 'video/mp4' });
};
```

---

#### Nivel 2 - Creator (FFmpeg.wasm + Canvas API)

**Transiciones (Fade):**
```typescript
const addFadeTransition = async (
  video1: File,
  video2: File,
  duration: number = 1
) => {
  await ffmpeg.writeFile('v1.mp4', await fetchFile(video1));
  await ffmpeg.writeFile('v2.mp4', await fetchFile(video2));

  // Obtener duración del primer video
  const v1Duration = await getVideoDuration('v1.mp4');

  await ffmpeg.exec([
    '-i', 'v1.mp4',
    '-i', 'v2.mp4',
    '-filter_complex',
    `[0:v]fade=t=out:st=${v1Duration - duration}:d=${duration}[v0];
     [1:v]fade=t=in:st=0:d=${duration}[v1];
     [v0][v1]concat=n=2:v=1:a=0[outv];
     [0:a][1:a]concat=n=2:v=0:a=1[outa]`,
    '-map', '[outv]',
    '-map', '[outa]',
    'output.mp4'
  ]);

  const data = await ffmpeg.readFile('output.mp4');
  return new Blob([data.buffer], { type: 'video/mp4' });
};
```

**Chroma Key (Green Screen):**
```typescript
const chromaKey = async (
  videoFile: File,
  backgroundFile: File,
  color: string = 'green',
  similarity: number = 0.3
) => {
  await ffmpeg.writeFile('video.mp4', await fetchFile(videoFile));
  await ffmpeg.writeFile('background.mp4', await fetchFile(backgroundFile));

  await ffmpeg.exec([
    '-i', 'video.mp4',
    '-i', 'background.mp4',
    '-filter_complex',
    `[0:v]chromakey=${color}:${similarity}:0.1[ckout];
     [1:v][ckout]overlay[out]`,
    '-map', '[out]',
    '-map', '0:a',
    'output.mp4'
  ]);

  const data = await ffmpeg.readFile('output.mp4');
  return new Blob([data.buffer], { type: 'video/mp4' });
};
```

**Múltiples pistas de audio:**
```typescript
const mixAudioTracks = async (
  videoFile: File,
  audioTracks: File[],
  volumes: number[]  // [1.0, 0.5, 0.8]
) => {
  await ffmpeg.writeFile('video.mp4', await fetchFile(videoFile));

  // Escribir todas las pistas de audio
  for (let i = 0; i < audioTracks.length; i++) {
    await ffmpeg.writeFile(`audio${i}.mp3`, await fetchFile(audioTracks[i]));
  }

  // Construir filtro de mezcla
  const mixFilter = audioTracks
    .map((_, i) => `[${i + 1}:a]volume=${volumes[i]}[a${i}]`)
    .join(';');

  const amixInputs = audioTracks.map((_, i) => `[a${i}]`).join('');

  await ffmpeg.exec([
    '-i', 'video.mp4',
    ...audioTracks.flatMap((_, i) => ['-i', `audio${i}.mp3`]),
    '-filter_complex',
    `${mixFilter};${amixInputs}amix=inputs=${audioTracks.length}[aout]`,
    '-map', '0:v',
    '-map', '[aout]',
    '-c:v', 'copy',
    'output.mp4'
  ]);

  const data = await ffmpeg.readFile('output.mp4');
  return new Blob([data.buffer], { type: 'video/mp4' });
};
```

**Texto animado (Canvas API):**
```typescript
const addAnimatedText = async (
  videoFile: File,
  text: string,
  options: {
    fontFamily: string;
    fontSize: number;
    color: string;
    x: number;
    y: number;
    animation: 'fade' | 'slide' | 'bounce';
  }
) => {
  // 1. Extraer frames del video
  const frames = await extractFrames(videoFile);

  // 2. Aplicar texto a cada frame
  const processedFrames = frames.map((frame, index) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = frame.width;
    canvas.height = frame.height;

    // Dibujar frame original
    ctx.drawImage(frame, 0, 0);

    // Dibujar texto con animación
    const progress = index / frames.length;
    drawAnimatedText(ctx, text, options, progress);

    return canvas.toDataURL();
  });

  // 3. Reconstruir video con FFmpeg.wasm
  return await framesToVideo(processedFrames);
};
```

---

## 🖥️ Procesamiento en Servidor

### Cuándo Usar Servidor

**SOLO para:**
1. **Funciones IA** (Nivel Professional)
   - Mejora automática con Gemini AI
   - Auto-subtítulos
   - Upscaling 4K
   - Noise reduction avanzado
   - Análisis de contenido

2. **Tareas muy pesadas**
   - Videos > 2GB
   - Procesamiento que toma > 10 minutos
   - Batch processing

---

### Stack de Servidor

```
┌─────────────────────────────────────┐
│ Backend (Railway/Render)            │
│ - Express API                       │
│ - FFmpeg nativo (más rápido)        │
│ - Google Gemini AI                  │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ Job Queue (BullMQ + Redis)          │
│ - Procesamiento asíncrono           │
│ - Progress tracking                 │
│ - Retry logic                       │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ Cloudflare R2                       │
│ - Almacenamiento resultado          │
└─────────────────────────────────────┘
```

---

### Funciones IA (Servidor)

#### Auto-mejora con Gemini AI

```typescript
// backend/src/services/aiEnhancement.ts

import { GoogleGenerativeAI } from '@google/generative-ai';
import ffmpeg from 'fluent-ffmpeg';

export const enhanceVideo = async (videoPath: string) => {
  // 1. Extraer frames representativos
  const frames = await extractKeyFrames(videoPath, 10);

  // 2. Analizar con Gemini AI
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Analiza estos frames de video y sugiere mejoras en:
  1. Iluminación (brillo, contraste, exposición)
  2. Color (saturación, temperatura, tinte)
  3. Nitidez
  4. Estabilización necesaria

  Retorna JSON con parámetros específicos para FFmpeg.`;

  const result = await model.generateContent([
    prompt,
    ...frames.map(f => ({ inlineData: { data: f, mimeType: 'image/jpeg' } }))
  ]);

  const suggestions = JSON.parse(result.response.text());

  // 3. Aplicar mejoras con FFmpeg
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .videoFilters([
        `eq=brightness=${suggestions.brightness}:contrast=${suggestions.contrast}`,
        `hue=s=${suggestions.saturation}`,
        `unsharp=5:5:${suggestions.sharpness}:5:5:0.0`
      ])
      .output('enhanced.mp4')
      .on('end', () => resolve('enhanced.mp4'))
      .on('error', reject)
      .run();
  });
};
```

---

#### Auto-subtítulos

```typescript
// backend/src/services/subtitles.ts

import { SpeechClient } from '@google-cloud/speech';
import ffmpeg from 'fluent-ffmpeg';

export const generateSubtitles = async (videoPath: string) => {
  // 1. Extraer audio
  const audioPath = await extractAudio(videoPath);

  // 2. Transcribir con Google Speech-to-Text
  const client = new SpeechClient();
  const audio = fs.readFileSync(audioPath).toString('base64');

  const [response] = await client.recognize({
    audio: { content: audio },
    config: {
      encoding: 'LINEAR16',
      languageCode: 'es-ES',
      enableWordTimeOffsets: true,
      enableAutomaticPunctuation: true,
    },
  });

  // 3. Convertir a formato SRT
  const srtContent = convertToSRT(response.results);
  fs.writeFileSync('subtitles.srt', srtContent);

  // 4. Incrustar subtítulos en video
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        '-vf', `subtitles=subtitles.srt`,
        '-c:a', 'copy'
      ])
      .output('with-subtitles.mp4')
      .on('end', () => resolve('with-subtitles.mp4'))
      .on('error', reject)
      .run();
  });
};
```

---

#### Upscaling 4K

```typescript
// backend/src/services/upscaling.ts

import ffmpeg from 'fluent-ffmpeg';

export const upscaleTo4K = async (videoPath: string) => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .size('3840x2160')  // 4K resolution
      .videoFilters([
        'scale=3840:2160:flags=lanczos',  // Algoritmo de alta calidad
        'unsharp=5:5:1.0:5:5:0.0'  // Sharpening
      ])
      .videoCodec('libx264')
      .outputOptions([
        '-preset', 'slow',  // Mejor calidad
        '-crf', '18'  // Calidad visual alta
      ])
      .output('upscaled-4k.mp4')
      .on('progress', (progress) => {
        console.log(`Upscaling: ${progress.percent}%`);
      })
      .on('end', () => resolve('upscaled-4k.mp4'))
      .on('error', reject)
      .run();
  });
};
```

---

## 📊 Comparación de Performance

### Benchmark: Cortar 1GB video (10 min → 5 min)

| Método | Tiempo | Costo | RAM |
|--------|--------|-------|-----|
| **FFmpeg.wasm (Cliente)** | ~8 minutos | $0 | 1.5GB (navegador) |
| **FFmpeg nativo (Servidor)** | ~3 minutos | $0.014 | 1GB (Railway) |
| **WebCodecs API (Cliente)** | ~5 minutos | $0 | 800MB (navegador) |

**Conclusión:** Cliente es suficiente para la mayoría de casos.

---

### Benchmark: Aplicar filtro de color

| Método | Tiempo | Costo |
|--------|--------|-------|
| **FFmpeg.wasm** | ~12 min | $0 |
| **Canvas API** | ~20 min | $0 |
| **FFmpeg servidor** | ~5 min | $0.023 |

**Conclusión:** Para filtros simples, FFmpeg.wasm es óptimo.

---

## 🎯 Flujo de Decisión

```
Usuario inicia tarea
      ↓
┌─────────────────────────────────────┐
│ ¿Es función IA?                     │
│ (enhance, subtitles, upscale)       │
└─────────────────────────────────────┘
      ↓ Sí
┌─────────────────────────────────────┐
│ ¿Usuario tiene plan Professional?  │
└─────────────────────────────────────┘
      ↓ Sí
┌─────────────────────────────────────┐
│ SERVIDOR                            │
│ - Subir video a R2                  │
│ - Crear job en BullMQ               │
│ - Procesar con IA                   │
│ - Notificar al usuario              │
└─────────────────────────────────────┘

      ↓ No (función básica/pro)
┌─────────────────────────────────────┐
│ ¿Video < 2GB y duración < 30 min?  │
└─────────────────────────────────────┘
      ↓ Sí
┌─────────────────────────────────────┐
│ CLIENTE (FFmpeg.wasm)               │
│ - Procesar en navegador             │
│ - Subir solo resultado a R2         │
│ - Costo: $0                         │
└─────────────────────────────────────┘

      ↓ No
┌─────────────────────────────────────┐
│ SERVIDOR (Fallback)                 │
│ - Video muy grande                  │
│ - Procesamiento pesado              │
└─────────────────────────────────────┘
```

---

## 💡 Optimizaciones

### Caché de FFmpeg.wasm

```typescript
// Cargar FFmpeg.wasm solo una vez
let ffmpegInstance: FFmpeg | null = null;

export const getFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpegInstance?.loaded) {
    return ffmpegInstance;
  }

  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
  }

  await ffmpegInstance.load();
  return ffmpegInstance;
};
```

---

### Progress Tracking

```typescript
ffmpeg.on('progress', ({ progress }) => {
  console.log(`Procesando: ${Math.round(progress * 100)}%`);
  updateProgressBar(progress);
});
```

---

### Manejo de Errores

```typescript
try {
  const result = await trimVideo(file, 10, 30);
} catch (error) {
  if (error.message.includes('out of memory')) {
    // Fallback a servidor
    await processOnServer(file);
  } else {
    showError('Error procesando video');
  }
}
```

---

## 📚 Recursos

- [FFmpeg.wasm Docs](https://ffmpegwasm.netlify.app/)
- [WebCodecs API](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)
- [FFmpeg Filters Guide](https://ffmpeg.org/ffmpeg-filters.html)
- [Google Gemini AI](https://ai.google.dev/docs)

---

**Última actualización:** 2024-11-02
