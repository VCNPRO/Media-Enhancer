# Despliegue del Backend en Google Cloud Run

## Requisitos previos

1. **Google Cloud SDK instalado**
   ```bash
   # Descargar de: https://cloud.google.com/sdk/docs/install
   ```

2. **Proyecto de Google Cloud configurado**
   - Crear un proyecto en Google Cloud Console
   - Habilitar las APIs necesarias:
     - Cloud Run API
     - Cloud Storage API
     - Cloud Build API

3. **Bucket de Google Cloud Storage creado**
   ```bash
   gsutil mb -p TU_PROJECT_ID -l us-central1 gs://TU_BUCKET_NAME
   ```

4. **Service Account con permisos**
   - Crear Service Account en Google Cloud Console
   - Asignar roles:
     - Storage Admin
     - Cloud Run Admin
   - Descargar clave JSON

## Variables de entorno

El backend necesita estas variables de entorno:

- `GOOGLE_CLOUD_PROJECT`: ID de tu proyecto de Google Cloud
- `GOOGLE_CLOUD_BUCKET`: Nombre de tu bucket (sin gs://)
- `GOOGLE_APPLICATION_CREDENTIALS`: Ruta al archivo de credenciales JSON

## Despliegue

### Opción 1: Usando gcloud CLI (Recomendado)

```bash
# 1. Autenticarse en Google Cloud
gcloud auth login

# 2. Configurar proyecto
gcloud config set project TU_PROJECT_ID

# 3. Habilitar Cloud Run API
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 4. Desplegar directamente desde el código
gcloud run deploy media-enhancer-backend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 600 \
  --max-instances 10 \
  --set-env-vars GOOGLE_CLOUD_PROJECT=TU_PROJECT_ID \
  --set-env-vars GOOGLE_CLOUD_BUCKET=TU_BUCKET_NAME \
  --service-account TU_SERVICE_ACCOUNT@TU_PROJECT_ID.iam.gserviceaccount.com
```

### Opción 2: Usando Docker y Google Container Registry

```bash
# 1. Construir la imagen
docker build -t gcr.io/TU_PROJECT_ID/media-enhancer-backend .

# 2. Configurar Docker para usar gcloud
gcloud auth configure-docker

# 3. Subir imagen a GCR
docker push gcr.io/TU_PROJECT_ID/media-enhancer-backend

# 4. Desplegar en Cloud Run
gcloud run deploy media-enhancer-backend \
  --image gcr.io/TU_PROJECT_ID/media-enhancer-backend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 600 \
  --max-instances 10 \
  --set-env-vars GOOGLE_CLOUD_PROJECT=TU_PROJECT_ID \
  --set-env-vars GOOGLE_CLOUD_BUCKET=TU_BUCKET_NAME \
  --service-account TU_SERVICE_ACCOUNT@TU_PROJECT_ID.iam.gserviceaccount.com
```

## Configurar CORS en el bucket

Para que el frontend pueda acceder a los archivos procesados:

```bash
gsutil cors set cors.json gs://TU_BUCKET_NAME
```

## Verificar el despliegue

Después del despliegue, obtendrás una URL como:
```
https://media-enhancer-backend-XXXX-uc.a.run.app
```

Prueba el health check:
```bash
curl https://media-enhancer-backend-XXXX-uc.a.run.app/
# Debería responder: "✅ Media Enhancer backend running in Cloud Run!"
```

## Conectar con el frontend en Vercel

1. En Vercel, agregar variable de entorno:
   ```
   VITE_BACKEND_URL=https://media-enhancer-backend-XXXX-uc.a.run.app
   ```

2. Redesplegar el frontend en Vercel

## Monitoreo y logs

```bash
# Ver logs en tiempo real
gcloud run services logs tail media-enhancer-backend --region us-central1

# Ver métricas
gcloud run services describe media-enhancer-backend --region us-central1
```

## Costos estimados

- Cloud Run: ~$0.00002400 por vCPU-segundo
- Cloud Storage: ~$0.020 por GB/mes
- Transferencia de datos: ~$0.12 por GB

Con tráfico moderado: ~$10-50/mes

## Solución de problemas

1. **Error de autenticación**
   - Verificar que el Service Account tenga los permisos correctos
   - Verificar que el Service Account esté asignado al servicio

2. **Timeout en videos grandes**
   - Aumentar `--timeout` a 900 (15 minutos) o más
   - Aumentar `--memory` a 4Gi si es necesario

3. **Error de cuota**
   - Verificar límites en Google Cloud Console
   - Solicitar aumento de cuota si es necesario
