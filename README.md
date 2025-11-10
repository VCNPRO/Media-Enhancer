# 🎬 Media Enhancer

**Video Processing Platform con FFmpeg**

Aplicación web para procesamiento y mejora de videos usando FFmpeg. Soporta procesamiento en el navegador (videos pequeños) y en servidor con Google Cloud (videos grandes hasta 6GB).

---

## ✨ Features

- 📹 **Procesamiento en Navegador** - Videos pequeños con FFmpeg.wasm
- ☁️ **Procesamiento en Servidor** - Videos grandes (hasta 6GB) con Google Cloud Run
- 🎬 **Conversión de Formatos** - Optimización H.264/AAC para streaming
- 📦 **Google Cloud Storage** - Almacenamiento escalable y seguro
- 🔒 **URLs Firmadas** - Subida y descarga seguras
- ⚡ **Multi-threading** - Procesamiento rápido con SharedArrayBuffer

---

## 🏗️ Tech Stack

### Frontend (Vercel)
- React 19 + TypeScript
- Vite
- Tailwind CSS
- FFmpeg.wasm v0.10
- React Router
- TanStack Query
- Zustand

### Backend (Google Cloud Run)
- Node.js 18 + Express
- FFmpeg (fluent-ffmpeg)
- Google Cloud Storage
- Multer
- Docker

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Cuenta de Google Cloud con:
  - Cloud Run API habilitada
  - Cloud Storage API habilitada
  - Bucket de Storage creado
  - Service Account con permisos

### Desarrollo Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/VCNPRO/Media-Enhancer.git
cd Media-Enhancer
```

2. **Instalar dependencias del frontend**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con VITE_BACKEND_URL
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

5. **Abrir la aplicación**
```
http://localhost:5173
```

### Despliegue en Producción

#### Frontend en Vercel

El proyecto ya está conectado a Vercel. Los cambios se despliegan automáticamente al hacer push a GitHub.

**Configurar variable de entorno en Vercel:**
```
VITE_BACKEND_URL=https://tu-backend-url.a.run.app
```

#### Backend en Google Cloud Run

Ver guía completa en [`backend/DEPLOY.md`](./backend/DEPLOY.md)

**Despliegue rápido:**
```bash
cd backend
gcloud run deploy media-enhancer-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --set-env-vars GOOGLE_CLOUD_PROJECT=tu-proyecto \
  --set-env-vars GOOGLE_CLOUD_BUCKET=tu-bucket
```

---

## 📋 Variables de Entorno

### Frontend (`.env`)
```env
VITE_BACKEND_URL=https://tu-backend-url.a.run.app
```

### Backend (`backend/.env`)
```env
GOOGLE_CLOUD_PROJECT=tu-proyecto-id
GOOGLE_CLOUD_BUCKET=tu-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
PORT=8080
```

---

## 📚 Documentation

- [Next Steps](./NEXT_STEPS.md) - Implementation guide
- [Architecture](./ARCHITECTURE.md) - System design and tech details

---

## 💰 Pricing Tiers

### 🆓 Starter
- 5GB Storage
- 10 Projects
- 50 Exports/month
- Up to 5 min videos

### ⭐ Creator ($14.99/month)
- 50GB Storage
- 100 Projects
- 500 Exports/month
- Up to 30 min videos
- AI Enhancements
- No watermark

### 🚀 Professional ($49.99/month)
- 500GB Storage
- Unlimited Projects
- Unlimited Exports
- Up to 2 hour videos
- Advanced AI Features
- Priority Support

---

## 🗺️ Roadmap

### Phase 1 - MVP (Current)
- [x] Authentication system
- [x] Basic UI/UX
- [x] Database schema
- [ ] File upload
- [ ] Video editor basics
- [ ] Subscription flow

### Phase 2 - Core Features
- [ ] Video processing
- [ ] AI enhancements
- [ ] Export system
- [ ] Usage tracking
- [ ] Admin dashboard

### Phase 3 - Advanced Features
- [ ] Collaborative editing
- [ ] Video templates
- [ ] Mobile app
- [ ] API for integrations

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👤 Author

**VCNPRO**
- GitHub: [@VCNPRO](https://github.com/VCNPRO)

---

## 🙏 Acknowledgments

- [Clerk](https://clerk.com) - Authentication
- [Supabase](https://supabase.com) - Database hosting
- [Stripe](https://stripe.com) - Payment processing
- [Google Gemini](https://ai.google.dev) - AI capabilities
- [Cloudflare R2](https://cloudflare.com/r2) - File storage

---

**Made with ❤️ by VCNPRO**
