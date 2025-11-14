#!/bin/bash

# Script de deployment para Google Cloud Run
# Uso: ./deploy.sh [PROJECT_ID] [REGION]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuración
PROJECT_ID=${1:-""}
REGION=${2:-"us-central1"}
SERVICE_NAME="media-enhancer-backend"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Verificar que se proporcionó el PROJECT_ID
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: Debes proporcionar el PROJECT_ID${NC}"
    echo "Uso: ./deploy.sh [PROJECT_ID] [REGION]"
    echo "Ejemplo: ./deploy.sh mi-proyecto-123 us-central1"
    exit 1
fi

echo -e "${GREEN}=== Deployment de Media Enhancer Backend ===${NC}"
echo "Proyecto: $PROJECT_ID"
echo "Región: $REGION"
echo "Servicio: $SERVICE_NAME"
echo ""

# Configurar el proyecto
echo -e "${YELLOW}Configurando proyecto...${NC}"
gcloud config set project $PROJECT_ID

# Habilitar APIs necesarias
echo -e "${YELLOW}Habilitando APIs necesarias...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Construir imagen
echo -e "${YELLOW}Construyendo imagen Docker...${NC}"
gcloud builds submit --tag $IMAGE_NAME

# Deploy a Cloud Run
echo -e "${YELLOW}Desplegando a Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars "GCS_BUCKET_NAME=media-enhancer-vcn-videos"

# Obtener URL del servicio
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo -e "${GREEN}=== Deployment completado ===${NC}"
echo -e "URL del servicio: ${GREEN}$SERVICE_URL${NC}"
echo ""
echo "Para ver logs: gcloud run logs tail $SERVICE_NAME --region $REGION"
echo "Para actualizar variables de entorno:"
echo "  gcloud run services update $SERVICE_NAME --region $REGION --set-env-vars KEY=VALUE"
