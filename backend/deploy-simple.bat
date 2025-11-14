@echo off
echo ========================================
echo   DEPLOYMENT MEDIA ENHANCER BACKEND
echo ========================================
echo.

set PROJECT_ID=media-enhancer-vcn-2025
set REGION=us-central1
set SERVICE_NAME=media-enhancer-backend
set BUCKET_NAME=media-enhancer-vcn-videos

echo Configurando proyecto: %PROJECT_ID%
gcloud config set project %PROJECT_ID%
if errorlevel 1 goto error

echo.
echo Habilitando APIs necesarias...
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable storage-api.googleapis.com
if errorlevel 1 goto error

echo.
echo ========================================
echo   CONSTRUYENDO IMAGEN DOCKER
echo   (Esto puede tardar varios minutos...)
echo ========================================
echo.
gcloud builds submit --tag gcr.io/%PROJECT_ID%/%SERVICE_NAME%
if errorlevel 1 goto error

echo.
echo ========================================
echo   DESPLEGANDO A CLOUD RUN
echo ========================================
echo.
gcloud run deploy %SERVICE_NAME% --image gcr.io/%PROJECT_ID%/%SERVICE_NAME% --platform managed --region %REGION% --allow-unauthenticated --memory 512Mi --cpu 1 --timeout 300 --max-instances 10 --set-env-vars "GCS_BUCKET_NAME=%BUCKET_NAME%"
if errorlevel 1 goto error

echo.
echo ========================================
echo   OBTENIENDO URL DEL SERVICIO
echo ========================================
echo.
gcloud run services describe %SERVICE_NAME% --region %REGION% --format "value(status.url)"

echo.
echo ========================================
echo   DEPLOYMENT COMPLETADO EXITOSAMENTE!
echo ========================================
echo.
echo Comandos utiles:
echo   Ver logs: gcloud run logs tail %SERVICE_NAME% --region %REGION%
echo   Ver servicio: gcloud run services describe %SERVICE_NAME% --region %REGION%
echo.
goto end

:error
echo.
echo ========================================
echo   ERROR EN EL DEPLOYMENT
echo ========================================
echo.
pause
exit /b 1

:end
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul
