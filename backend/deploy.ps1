# Script de deployment automático para Google Cloud Run
# Este script debe ejecutarse desde PowerShell con autenticación de gcloud ya configurada

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "",

    [Parameter(Mandatory=$false)]
    [string]$Region = "us-central1"
)

$ErrorActionPreference = "Stop"

# Colores
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-ColorOutput Green "=== Deployment de Media Enhancer Backend ==="
Write-Host ""

# Verificar autenticación
Write-ColorOutput Yellow "Verificando autenticación..."
$account = gcloud config get-value account 2>$null
if ([string]::IsNullOrEmpty($account)) {
    Write-ColorOutput Red "Error: No estás autenticado con gcloud"
    Write-Host "Por favor ejecuta: gcloud auth login"
    exit 1
}
Write-ColorOutput Green "✓ Autenticado como: $account"

# Obtener o configurar proyecto
if ([string]::IsNullOrEmpty($ProjectId)) {
    $currentProject = gcloud config get-value project 2>$null
    if ([string]::IsNullOrEmpty($currentProject)) {
        Write-ColorOutput Yellow "Proyectos disponibles:"
        gcloud projects list
        Write-Host ""
        $ProjectId = Read-Host "Ingresa el PROJECT_ID que deseas usar"
    } else {
        $ProjectId = $currentProject
    }
}

Write-ColorOutput Yellow "Configurando proyecto: $ProjectId"
gcloud config set project $ProjectId
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "Error al configurar proyecto"
    exit 1
}
Write-ColorOutput Green "✓ Proyecto configurado"

# Variables
$ServiceName = "media-enhancer-backend"
$ImageName = "gcr.io/$ProjectId/$ServiceName"
$BucketName = "media-enhancer-vcn-videos"

Write-Host ""
Write-Host "Configuración:"
Write-Host "  Proyecto: $ProjectId"
Write-Host "  Región: $Region"
Write-Host "  Servicio: $ServiceName"
Write-Host "  Imagen: $ImageName"
Write-Host ""

# Habilitar APIs necesarias
Write-ColorOutput Yellow "Habilitando APIs necesarias..."
$apis = @(
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "containerregistry.googleapis.com",
    "storage-api.googleapis.com"
)

foreach ($api in $apis) {
    Write-Host "  Habilitando $api..."
    gcloud services enable $api --quiet
}
Write-ColorOutput Green "✓ APIs habilitadas"

# Construir imagen
Write-Host ""
Write-ColorOutput Yellow "Construyendo imagen Docker con Cloud Build..."
Write-Host "Esto puede tardar varios minutos..."
gcloud builds submit --tag $ImageName --quiet
if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "Error al construir imagen"
    exit 1
}
Write-ColorOutput Green "✓ Imagen construida exitosamente"

# Deployar a Cloud Run
Write-Host ""
Write-ColorOutput Yellow "Desplegando a Cloud Run..."
gcloud run deploy $ServiceName `
    --image $ImageName `
    --platform managed `
    --region $Region `
    --allow-unauthenticated `
    --memory 512Mi `
    --cpu 1 `
    --timeout 300 `
    --max-instances 10 `
    --set-env-vars "GCS_BUCKET_NAME=$BucketName" `
    --quiet

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "Error al deployar a Cloud Run"
    exit 1
}
Write-ColorOutput Green "✓ Deployment completado exitosamente"

# Obtener URL del servicio
Write-Host ""
Write-ColorOutput Yellow "Obteniendo URL del servicio..."
$ServiceUrl = gcloud run services describe $ServiceName --region $Region --format "value(status.url)"

Write-Host ""
Write-ColorOutput Green "=== ✓ DEPLOYMENT COMPLETADO EXITOSAMENTE ==="
Write-Host ""
Write-ColorOutput Green "URL del servicio: $ServiceUrl"
Write-Host ""
Write-Host "Comandos útiles:"
Write-Host "  Ver logs: gcloud run logs tail $ServiceName --region $Region"
Write-Host "  Ver servicio: gcloud run services describe $ServiceName --region $Region"
Write-Host "  Actualizar env vars: gcloud run services update $ServiceName --region $Region --set-env-vars KEY=VALUE"
Write-Host ""
Write-ColorOutput Green "¡Deployment completado! 🚀"
