# 🚀 Deployment Guide - Media Enhancer

Esta guía te ayudará a desplegar Media Enhancer en producción.

---

## 📦 Arquitectura de Deployment

```
┌─────────────────────────────────────┐
│     Frontend (React + Vite)         │
│     Vercel                           │
│     https://your-app.vercel.app     │
└──────────────┬──────────────────────┘
               │
               │ API Calls
               │
┌──────────────▼──────────────────────┐
│     Backend (Express + Node.js)     │
│     Railway                          │
│     https://your-api.railway.app    │
└─────────────────────────────────────┘
```

---

## 🔷 PASO 1: Desplegar Backend en Railway

### 1.1 Crear Cuenta en Railway

1. Ve a https://railway.app
2. Click en "Start a New Project"
3. Login con tu cuenta de GitHub

### 1.2 Crear Proyecto

1. Click "Deploy from GitHub repo"
2. Autoriza Railway a acceder a tus repos
3. Selecciona `VCNPRO/Media-Enhancer`
4. Railway detectará automáticamente que es un proyecto Node.js

### 1.3 Configurar el Proyecto

**Settings → General:**
- Project Name: `media-enhancer-backend`
- Root Directory: `backend`

**Settings → Build:**
- Build Command: `npm install && npm run build`
- Watch Paths: `backend/**`

**Settings → Deploy:**
- Start Command: `npm start`
- Health Check Path: `/health`

### 1.4 Variables de Entorno

Ve a **Variables** y añade estas variables una por una:

```bash
# Server
NODE_ENV=production
PORT=3001

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE

# Database (Supabase)
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:5432/postgres

# Stripe
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_KEY_HERE

# Frontend URL (lo configuraremos después)
FRONTEND_URL=https://media-enhancer.vercel.app

# Optional (puedes añadirlos más tarde)
GEMINI_API_KEY=YOUR_KEY_HERE
R2_ACCOUNT_ID=YOUR_ACCOUNT_ID
R2_ACCESS_KEY_ID=YOUR_ACCESS_KEY
R2_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
R2_BUCKET_NAME=media-enhancer-uploads
```

**⚠️ IMPORTANTE:** Reemplaza todos los valores con tus keys reales.

### 1.5 Deploy

1. Click en "Deploy"
2. Espera 2-3 minutos
3. Railway te dará una URL pública tipo:
   ```
   https://media-enhancer-production-xxxx.up.railway.app
   ```
4. **Copia esta URL** (la necesitarás para el frontend)

### 1.6 Verificar que Funciona

Abre en tu navegador:
```
https://tu-url-de-railway.up.railway.app/health
```

Deberías ver:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "uptime": 123.45,
  "environment": "production"
}
```

✅ **Backend desplegado correctamente!**

---

## 🔷 PASO 2: Desplegar Frontend en Vercel

### 2.1 Crear Proyecto en Vercel

1. Ve a https://vercel.com
2. Click "Add New Project"
3. Click "Import" en tu repositorio `VCNPRO/Media-Enhancer`

### 2.2 Configurar el Proyecto

**Framework Preset:** Vite

**Build & Development Settings:**
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 2.3 Variables de Entorno

Click en "Environment Variables" y añade:

```bash
# Clerk (la MISMA Publishable Key del backend)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# Backend URL (la URL que te dio Railway)
VITE_API_URL=https://media-enhancer-production-xxxx.up.railway.app

# Stripe (la MISMA Publishable Key del backend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

**⚠️ IMPORTANTE:**
- `VITE_API_URL` debe ser la URL completa de Railway (SIN barra final)
- Las keys deben ser exactamente las mismas que configuraste en Railway

### 2.4 Deploy

1. Click "Deploy"
2. Espera 1-2 minutos
3. Vercel te dará una URL tipo:
   ```
   https://media-enhancer.vercel.app
   ```

---

## 🔷 PASO 3: Conectar Frontend con Backend

### 3.1 Actualizar FRONTEND_URL en Railway

1. Ve a tu proyecto en Railway
2. Click en "Variables"
3. Edita la variable `FRONTEND_URL`
4. Cambia el valor a tu URL de Vercel:
   ```
   FRONTEND_URL=https://media-enhancer.vercel.app
   ```
5. Railway se redeployará automáticamente

### 3.2 Verificar la Conexión

1. Abre tu URL de Vercel: `https://media-enhancer.vercel.app`
2. Click en "Sign Up" o "Get Started"
3. Crea una cuenta con Clerk
4. Si puedes hacer login → ✅ **¡Todo funciona!**

---

## 🐛 Troubleshooting

### Backend no arranca en Railway

**Error: "Missing environment variables"**
- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que no hay espacios extras
- Revisa los logs en Railway → Deployments → View Logs

**Error: "Cannot connect to database"**
- Verifica la `DATABASE_URL` en Railway
- Asegúrate de que el password está URL-encoded (`@` = `%40`)
- Prueba la conexión desde Supabase dashboard

### Frontend no puede conectar con Backend

**Error: "Network Error" o CORS**
- Verifica que `VITE_API_URL` en Vercel sea correcta
- Verifica que `FRONTEND_URL` en Railway sea correcta
- Ambas deben coincidir exactamente

**Error: "Authentication failed"**
- Verifica que `VITE_CLERK_PUBLISHABLE_KEY` sea la misma en Vercel y Railway
- Revisa el dashboard de Clerk para errores

### Deployment falla

**Vercel:**
- Revisa los logs: Vercel Dashboard → Deployments → Failed
- Asegúrate de que `frontend/` tiene todos los archivos necesarios

**Railway:**
- Revisa los logs: Railway Dashboard → Deployments → View Logs
- Verifica que `backend/package.json` tenga el script "start"

---

## 📊 Monitoreo

### Railway
- Dashboard → Metrics (CPU, Memory, Network)
- Dashboard → Logs (Errores en tiempo real)

### Vercel
- Analytics → Visitors, Page Views
- Logs → Function Logs (si usas API routes)

---

## 💰 Costes Estimados

### Development (mientras desarrollas)
- **Railway:** $5/mes en créditos (sobra para testing)
- **Vercel:** $0 (Hobby plan)
- **Total:** ~$0-5/mes

### Production (1000 usuarios activos)
- **Railway:** ~$20-30/mes
- **Vercel:** $0 (Hobby) o $20 (Pro si necesitas más)
- **Supabase:** $25/mes (Pro plan)
- **Total:** ~$45-75/mes

---

## 🔄 Deploys Automáticos

Ambos servicios están configurados para deployment automático:

1. Haces cambios en tu código local
2. Haces commit: `git commit -m "mensaje"`
3. Haces push: `git push origin main`
4. **Railway** detecta cambios en `backend/` → redeploy automático
5. **Vercel** detecta cambios en `frontend/` → redeploy automático

✅ **No necesitas hacer nada más!**

---

## 🎯 Checklist Final

Antes de considerar el deployment completo:

- [ ] Backend desplegado en Railway
- [ ] Frontend desplegado en Vercel
- [ ] Variables de entorno configuradas en ambos
- [ ] Health check del backend funciona
- [ ] Puedes hacer login en el frontend
- [ ] Dashboard carga correctamente
- [ ] Pricing page funciona
- [ ] No hay errores en la consola del navegador

---

## 📚 Próximos Pasos

Una vez desplegado:

1. **Stripe Webhooks:** Configura los webhooks en Stripe apuntando a:
   ```
   https://tu-backend.railway.app/api/webhooks/stripe
   ```

2. **Dominio Custom:** Configura tu propio dominio en Vercel
   - Vercel → Settings → Domains
   - Añade tu dominio (ej: `app.tudominio.com`)

3. **Monitoreo:** Configura alertas en Railway para downtime

4. **Backups:** Configura backups automáticos en Supabase

---

**¡Deployment completado!** 🎉

Si tienes problemas, revisa:
1. Los logs de Railway
2. La consola del navegador
3. El dashboard de Clerk
