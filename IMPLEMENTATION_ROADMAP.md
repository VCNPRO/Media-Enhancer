# 🗺️ Implementation Roadmap - Media Enhancer

## 📅 Timeline General: 8 Semanas

```
Fase 1: Fundación       ████░░░░ [2 semanas]
Fase 2: Starter Tier    ░░░░████░░░░ [2 semanas]
Fase 3: Creator Tier    ░░░░░░░░████░░░░ [2 semanas]
Fase 4: Professional    ░░░░░░░░░░░░████ [2 semanas]
```

---

## 🏗️ FASE 1: Fundación (Semanas 1-2)

### Objetivos
- ✅ Infraestructura base desplegada
- ✅ Autenticación funcionando
- ✅ Base de datos configurada
- ✅ Sistema de feature flags

---

### Semana 1: Backend & Infrastructure

#### Día 1-2: Decisión y Setup de Plataforma

**Backend:**
- [ ] Decidir: Render FREE o Railway ($10 Hard Limit)
- [ ] Crear cuenta y proyecto
- [ ] Configurar variables de entorno
- [ ] Desplegar backend básico

**Checklist:**
```bash
# Variables de entorno necesarias
PORT=3001
NODE_ENV=production
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx
DATABASE_URL=postgresql://xxx
STRIPE_SECRET_KEY=sk_test_xxx
GEMINI_API_KEY=xxx
```

---

#### Día 3-4: Base de Datos

**Supabase Setup:**
- [ ] Crear proyecto en Supabase
- [ ] Ejecutar schema SQL
- [ ] Configurar Row Level Security (RLS)
- [ ] Seed datos iniciales (planes)

**Archivo:** `backend/src/database/schema.sql`
```sql
-- Ya existe en el proyecto
-- Verificar tablas:
-- - users
-- - subscription_plans
-- - user_subscriptions
-- - media_files
-- - projects
-- - exports
```

---

#### Día 5-6: Sistema de Feature Flags

**Backend:**
- [ ] Crear `middleware/featureAccess.ts`
- [ ] Definir constantes de features
- [ ] Implementar `requireFeature()` middleware
- [ ] Testing de permisos

**Archivo:** `backend/src/middleware/featureAccess.ts`
```typescript
export const FEATURES = {
  // Básico (todos)
  BASIC_TRIM: 'basic_trim',
  BASIC_VOLUME: 'basic_volume',

  // Pro (Creator+)
  PRO_TRANSITIONS: 'pro_transitions',
  PRO_CHROMA_KEY: 'pro_chroma_key',

  // IA (Professional)
  AI_ENHANCE: 'ai_enhance',
  AI_SUBTITLES: 'ai_subtitles',
};

export const PLAN_FEATURES = {
  starter: [...],
  creator: [...],
  professional: [...],
};
```

---

#### Día 7: Webhooks de Clerk

**Configurar Clerk:**
- [ ] Crear webhook endpoint en Clerk Dashboard
- [ ] URL: `https://tu-backend.com/api/webhooks/clerk`
- [ ] Eventos: `user.created`, `user.updated`, `user.deleted`
- [ ] Copiar Webhook Secret
- [ ] Actualizar `.env`

**Testing:**
- [ ] Registrar usuario de prueba
- [ ] Verificar creación en DB
- [ ] Probar update y delete

---

### Semana 2: Frontend Base

#### Día 8-9: Limpieza y Estructura

**Limpiar raíz del proyecto:**
- [ ] Eliminar archivos duplicados:
  - `index.tsx` (raíz)
  - `App.tsx` (raíz)
  - Componentes viejos en `/components`
- [ ] Mantener solo:
  - `/frontend/` (proyecto principal)
  - `/backend/`
  - Archivos `.md`

**Estructura final:**
```
Media-Enhancer/
├── frontend/          ← Proyecto React principal
├── backend/           ← API Express
├── docs/              ← Archivos .md
└── vercel.json        ← Actualizar para /frontend
```

---

#### Día 10-11: Configuración de Routing

**Implementar rutas:**
- [ ] `/` - Landing page
- [ ] `/pricing` - Planes
- [ ] `/dashboard-simple` - Nivel 1
- [ ] `/dashboard-pro` - Niveles 2 y 3
- [ ] `/editor/:projectId` - Editor

**Archivo:** `frontend/src/App.tsx`
```typescript
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/dashboard" element={<DashboardRouter />} />
      <Route path="/editor/:id" element={<EditorPage />} />
    </Routes>
  );
}

// DashboardRouter decide qué dashboard mostrar según plan
const DashboardRouter = () => {
  const { user } = useUser();
  const plan = user?.subscription?.plan_id || 'starter';

  return plan === 'starter'
    ? <DashboardSimple />
    : <DashboardPro />;
};
```

---

#### Día 12-13: Integración de Clerk

**Frontend:**
- [ ] Instalar `@clerk/clerk-react`
- [ ] Configurar `ClerkProvider`
- [ ] Crear componentes de auth
- [ ] Probar login/signup/logout

**Archivo:** `frontend/src/main.tsx`
```typescript
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>
);
```

---

#### Día 14: Deploy Frontend

**Vercel:**
- [ ] Crear nuevo proyecto en Vercel
- [ ] Conectar repo GitHub
- [ ] Configurar Root Directory: `frontend`
- [ ] Variables de entorno:
  ```
  VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
  VITE_API_URL=https://tu-backend.com
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
  ```
- [ ] Deploy y verificar

---

## 🎯 FASE 2: Starter Tier (Semanas 3-4)

### Objetivos
- ✅ Dashboard Simple funcional
- ✅ Editor básico con FFmpeg.wasm
- ✅ Upload a Cloudflare R2
- ✅ Sistema de límites

---

### Semana 3: Dashboard Simple

#### Día 15-16: UI del Dashboard

**Componentes a crear:**
- [ ] `DashboardSimple.tsx`
- [ ] `VideoGrid.tsx`
- [ ] `UploadButton.tsx`
- [ ] `UsageStats.tsx`
- [ ] `UpgradeCTA.tsx`

**Características:**
- Diseño minimalista
- Solo funciones esenciales
- CTA claro para upgrade

---

#### Día 17-18: Sistema de Proyectos

**Backend:**
- [ ] Endpoints:
  - `GET /api/projects` - Listar proyectos
  - `POST /api/projects` - Crear proyecto
  - `DELETE /api/projects/:id` - Eliminar
- [ ] Validar límites (10 proyectos max)

**Frontend:**
- [ ] Crear proyecto
- [ ] Listar proyectos
- [ ] Eliminar proyecto
- [ ] Mostrar límites

---

#### Día 19-20: Cloudflare R2 Setup

**Configuración:**
- [ ] Crear bucket en Cloudflare R2
- [ ] Obtener API keys
- [ ] Configurar CORS
- [ ] Implementar upload backend

**Backend:** `backend/src/services/r2.ts`
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const uploadToR2 = async (file, key) => {
  const client = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
  }));
};
```

---

#### Día 21: Límites y Validaciones

**Implementar:**
- [ ] Límite de almacenamiento (5GB)
- [ ] Límite de proyectos (10)
- [ ] Límite de exports (50/mes)
- [ ] Duración máxima video (5 min)

**Middleware:** `backend/src/middleware/limits.ts`
```typescript
export const checkStorageLimit = async (req, res, next) => {
  const usage = await getUserStorageUsage(req.user.id);
  const plan = req.user.subscription?.plan_id || 'starter';
  const limits = PLAN_LIMITS[plan];

  if (usage + req.file.size > limits.storage) {
    return res.status(403).json({
      error: 'Storage limit exceeded',
      usage,
      limit: limits.storage,
      upgradeRequired: 'creator'
    });
  }

  next();
};
```

---

### Semana 4: Editor Básico

#### Día 22-23: FFmpeg.wasm Setup

**Instalación:**
```bash
cd frontend
npm install @ffmpeg/ffmpeg @ffmpeg/util
```

**Implementar:**
- [ ] Cargar FFmpeg.wasm
- [ ] Mostrar progreso de carga
- [ ] Manejar errores

**Hook:** `frontend/src/hooks/useFFmpeg.ts`
```typescript
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export const useFFmpeg = () => {
  const [loaded, setLoaded] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());

  const load = async () => {
    const ffmpeg = ffmpegRef.current;
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    setLoaded(true);
  };

  return { ffmpeg: ffmpegRef.current, loaded, load };
};
```

---

#### Día 24-25: Funciones de Edición Básicas

**Implementar:**
- [ ] Cortar fragmentos (trim)
- [ ] Ajustar volumen
- [ ] Rotar video
- [ ] Cropear

**Ejemplo - Cortar:**
```typescript
const trimVideo = async (inputFile, startTime, endTime) => {
  const { ffmpeg } = useFFmpeg();

  await ffmpeg.writeFile('input.mp4', await fetchFile(inputFile));

  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-ss', startTime,
    '-to', endTime,
    '-c', 'copy',
    'output.mp4'
  ]);

  const data = await ffmpeg.readFile('output.mp4');
  return new Blob([data.buffer], { type: 'video/mp4' });
};
```

---

#### Día 26-27: UI del Editor

**Componentes:**
- [ ] `VideoPlayer.tsx`
- [ ] `Timeline.tsx`
- [ ] `ToolPanel.tsx`
- [ ] `ExportModal.tsx`

**Features:**
- Play/Pause
- Seek en timeline
- Marcadores de corte
- Preview en tiempo real

---

#### Día 28: Testing e Integración

- [ ] Probar flujo completo:
  1. Crear proyecto
  2. Subir video
  3. Editar (cortar, volumen)
  4. Exportar
  5. Guardar en R2
- [ ] Verificar límites funcionan
- [ ] Testing cross-browser

---

## 🎨 FASE 3: Creator Tier (Semanas 5-6)

### Objetivos
- ✅ Dashboard Pro
- ✅ Funciones avanzadas de edición
- ✅ Sistema de plantillas
- ✅ Integración Stripe

---

### Semana 5: Dashboard Pro

#### Día 29-30: UI Avanzada

**Componentes:**
- [ ] `DashboardPro.tsx`
- [ ] `ProjectFilters.tsx`
- [ ] `SearchBar.tsx`
- [ ] `AnalyticsPanel.tsx`
- [ ] `TemplatesGallery.tsx`

---

#### Día 31-32: Funciones Pro (Cliente)

**Implementar:**
- [ ] Transiciones (fade, wipe, slide)
- [ ] Múltiples pistas de audio
- [ ] Efectos de color (saturation, brightness)
- [ ] Overlays de texto avanzado

**Ejemplo - Transición Fade:**
```typescript
const addFadeTransition = async (video1, video2, duration = 1) => {
  await ffmpeg.exec([
    '-i', 'video1.mp4',
    '-i', 'video2.mp4',
    '-filter_complex',
    `[0:v]fade=t=out:st=${video1.duration - duration}:d=${duration}[v0];
     [1:v]fade=t=in:st=0:d=${duration}[v1];
     [v0][v1]concat=n=2:v=1[outv]`,
    '-map', '[outv]',
    'output.mp4'
  ]);
};
```

---

#### Día 33-34: Sistema de Plantillas

**Plantillas:**
- [ ] Intro/Outro templates
- [ ] Lower thirds
- [ ] Títulos animados
- [ ] Overlays de redes sociales

**Estructura:**
```typescript
interface Template {
  id: string;
  name: string;
  category: 'intro' | 'outro' | 'transition' | 'text';
  preview: string;
  duration: number;
  config: TemplateConfig;
}
```

---

#### Día 35: Stripe Integration

**Setup:**
- [ ] Crear productos en Stripe
- [ ] Configurar precios:
  - Creator: $14.99/mes
  - Professional: $49.99/mes
- [ ] Implementar Checkout
- [ ] Webhook de Stripe

**Backend:**
```typescript
// POST /api/subscriptions/checkout
app.post('/api/subscriptions/checkout', async (req, res) => {
  const { planId } = req.body;

  const session = await stripe.checkout.sessions.create({
    customer_email: req.user.email,
    line_items: [{
      price: STRIPE_PRICE_IDS[planId],
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
    cancel_url: `${process.env.FRONTEND_URL}/pricing`,
  });

  res.json({ url: session.url });
});
```

---

### Semana 6: Feature Flags & Polish

#### Día 36-37: Feature Flags Frontend

**Hook:** `useFeatureAccess.ts`
```typescript
export const useFeatureAccess = () => {
  const { user } = useUser();
  const plan = user?.subscription?.plan_id || 'starter';

  const canUse = (feature: string) => {
    return PLAN_FEATURES[plan]?.includes(feature) || false;
  };

  const showUpgradeModal = (feature: string) => {
    // Mostrar modal con info del plan necesario
  };

  return { canUse, showUpgradeModal };
};
```

---

#### Día 38-39: UI de Funciones Bloqueadas

**Componentes:**
- [ ] `LockedFeatureBadge.tsx`
- [ ] `UpgradeModal.tsx`
- [ ] Tooltips explicativos

**Ejemplo:**
```tsx
const AIEnhanceButton = () => {
  const { canUse, showUpgradeModal } = useFeatureAccess();

  if (!canUse('ai_enhance')) {
    return (
      <button
        onClick={() => showUpgradeModal('ai_enhance')}
        className="locked"
      >
        🤖 Mejorar con IA 🔒
        <span className="tooltip">Requiere plan Professional</span>
      </button>
    );
  }

  return <button onClick={handleEnhance}>🤖 Mejorar con IA</button>;
};
```

---

#### Día 40-42: Testing & Bug Fixes

- [ ] Testing de subscripciones
- [ ] Verificar feature flags
- [ ] Testing de plantillas
- [ ] Performance optimization
- [ ] Cross-browser testing

---

## 🤖 FASE 4: Professional Tier (Semanas 7-8)

### Objetivos
- ✅ Funciones IA funcionando
- ✅ Job queue para procesamiento
- ✅ Progress tracking
- ✅ Optimizaciones finales

---

### Semana 7: IA Integration

#### Día 43-44: Google Gemini Setup

**Implementar:**
- [ ] Servicio de análisis de video
- [ ] Extracción de frames
- [ ] Análisis con Gemini
- [ ] Generación de recomendaciones

**Servicio:** `backend/src/services/ai.ts`
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

export const analyzeVideo = async (videoPath: string) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  // Extraer frames del video
  const frames = await extractFrames(videoPath);

  const prompt = `Analiza este video y sugiere mejoras en:
  - Iluminación y color
  - Estabilización
  - Calidad de audio
  - Composición de encuadres`;

  const result = await model.generateContent([prompt, ...frames]);
  return result.response.text();
};
```

---

#### Día 45-46: Job Queue (BullMQ)

**Setup:**
- [ ] Instalar Redis (Upstash free tier)
- [ ] Configurar BullMQ
- [ ] Crear workers
- [ ] Implementar retry logic

**Queue:** `backend/src/queues/videoProcessing.ts`
```typescript
import { Queue, Worker } from 'bullmq';

const videoQueue = new Queue('video-processing', {
  connection: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  }
});

const worker = new Worker('video-processing', async (job) => {
  const { videoId, operation } = job.data;

  if (operation === 'ai_enhance') {
    await processAIEnhancement(videoId, job);
  }

  job.updateProgress(100);
}, { connection: {...} });
```

---

#### Día 47-48: Endpoints de IA

**Implementar:**
- [ ] `POST /api/ai/enhance` - Auto-mejora
- [ ] `POST /api/ai/subtitles` - Generar subtítulos
- [ ] `POST /api/ai/upscale` - Upscaling 4K
- [ ] `GET /api/ai/status/:jobId` - Status del job

**Ejemplo:**
```typescript
app.post('/api/ai/enhance',
  requireFeature('ai_enhance'),
  async (req, res) => {
    const { videoId } = req.body;

    const job = await videoQueue.add('ai_enhance', {
      videoId,
      userId: req.user.id,
    });

    res.json({ jobId: job.id });
  }
);
```

---

#### Día 49: Progress Tracking

**Frontend:**
- [ ] Polling de status
- [ ] Progress bar
- [ ] Notificaciones
- [ ] Error handling

**Hook:**
```typescript
const useJobProgress = (jobId: string) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/ai/status/${jobId}`);
      const data = await res.json();

      setProgress(data.progress);
      setStatus(data.status);

      if (data.status === 'completed') {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  return { progress, status };
};
```

---

### Semana 8: Polish & Launch

#### Día 50-51: Performance Optimization

- [ ] Lazy loading de componentes
- [ ] Image optimization
- [ ] Code splitting
- [ ] CDN setup para assets

---

#### Día 52-53: Testing Final

- [ ] E2E testing (Playwright)
- [ ] Load testing
- [ ] Security audit
- [ ] Accessibility check

---

#### Día 54-55: Documentación

- [ ] User guide
- [ ] API documentation
- [ ] Video tutorials
- [ ] FAQ

---

#### Día 56: Launch! 🚀

- [ ] Deploy final
- [ ] Monitoreo activo
- [ ] Preparar marketing
- [ ] Soft launch con early adopters

---

## 📊 Métricas de Éxito

### Semana 2
- [ ] Backend deployed y accesible
- [ ] Clerk auth funcionando
- [ ] DB con primeros usuarios

### Semana 4
- [ ] Editor básico funcional
- [ ] Usuario puede editar y exportar video
- [ ] Límites funcionando

### Semana 6
- [ ] Stripe checkout funcionando
- [ ] Feature flags operativos
- [ ] Primer pago de prueba exitoso

### Semana 8
- [ ] Funciones IA operativas
- [ ] 10+ usuarios beta testers
- [ ] Todas las funciones probadas

---

## 🆘 Plan B

### Si te atrasas:

**Prioridad 1 (MVP):**
- Nivel 1 (Starter) completo
- Editor básico funcional
- Deploy en producción

**Prioridad 2:**
- Stripe integration
- Dashboard Pro
- Funciones avanzadas cliente

**Prioridad 3:**
- Funciones IA
- Job queue
- Analytics

---

**Última actualización:** 2024-11-02
