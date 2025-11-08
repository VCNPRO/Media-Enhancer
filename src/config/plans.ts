// Configuración de planes y características

export type PlanId = 'basic' | 'premium' | 'professional';

export interface PlanLimits {
  // Límites de video
  maxVideoDuration: number; // en segundos
  maxVideoSize: number; // en bytes
  maxConcurrentProcessing: number; // videos procesando simultáneamente

  // Límites de storage
  storageLimit: number; // en bytes

  // Límites de proyectos
  maxProjects: number;

  // Límites de exportación
  maxExportsPerMonth: number;

  // Procesamiento
  processingPriority: 'low' | 'normal' | 'high';
  queueType: 'shared' | 'dedicated';
}

export interface PlanFeatures {
  // Dashboard
  dashboardType: 'basic' | 'professional';

  // Funciones básicas de video
  basicTrim: boolean;
  basicVolume: boolean;
  basicRotate: boolean;
  basicCrop: boolean;

  // Funciones de imagen
  imageEnhance: boolean;
  imageColorize: boolean;
  imageResize: boolean;

  // Funciones avanzadas de video (Premium+)
  multiLayerTimeline: boolean;
  transitions: boolean;
  filters: boolean;
  chromaKey: boolean;
  animatedTitles: boolean;
  pictureInPicture: boolean;
  multiAudioTracks: boolean;
  joinVideos: boolean;

  // Funciones VHS
  vhsEnhancement: boolean;
  autoCropBlackBars: boolean;
  noiseReduction: boolean;

  // Funciones IA (Professional)
  aiUpscaling: boolean;
  aiStabilization: boolean;
  aiAudioEnhance: boolean;
  aiAutoSubtitles: boolean;
  aiColorCorrection: boolean;
  aiLowLightEnhance: boolean;
  aiFrameInterpolation: boolean;
  aiAdvancedChromaKey: boolean;
  aiObjectDetection: boolean;
  aiAutoEditing: boolean;
  aiImageUpscaling: boolean;
  aiPhotoRestoration: boolean;
  aiPortraitEnhance: boolean;
  aiObjectRemoval: boolean;
  aiVoiceSeparation: boolean;

  // Exportación
  maxExportResolution: '1080p' | '2k' | '4k' | '8k';
  advancedCodecs: boolean;
  hdrSupport: boolean;
  batchProcessing: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number; // EUR/mes
  description: string;
  limits: PlanLimits;
  features: PlanFeatures;
}

// Constantes útiles
const GB = 1024 * 1024 * 1024;
const HOUR = 3600;
const MINUTE = 60;

export const PLANS: Record<PlanId, Plan> = {
  basic: {
    id: 'basic',
    name: 'Plan Basic',
    price: 9.99,
    description: 'Perfecto para usuarios domésticos que quieren editar videos VHS y recuerdos familiares',
    limits: {
      maxVideoDuration: 3 * HOUR, // 3 horas (para VHS completos)
      maxVideoSize: 10 * GB, // 10 GB por video
      maxConcurrentProcessing: 1, // 1 video a la vez
      storageLimit: 20 * GB, // 20 GB total
      maxProjects: 5,
      maxExportsPerMonth: 20,
      processingPriority: 'low',
      queueType: 'shared',
    },
    features: {
      dashboardType: 'basic',

      // Básicas de video
      basicTrim: true,
      basicVolume: true,
      basicRotate: true,
      basicCrop: true,

      // Imagen
      imageEnhance: true,
      imageColorize: true,
      imageResize: true,

      // Avanzadas - NO
      multiLayerTimeline: false,
      transitions: false,
      filters: false,
      chromaKey: false,
      animatedTitles: false,
      pictureInPicture: false,
      multiAudioTracks: false,
      joinVideos: false,

      // VHS - Básicas
      vhsEnhancement: true,
      autoCropBlackBars: true,
      noiseReduction: true,

      // IA - NO
      aiUpscaling: false,
      aiStabilization: false,
      aiAudioEnhance: false,
      aiAutoSubtitles: false,
      aiColorCorrection: false,
      aiLowLightEnhance: false,
      aiFrameInterpolation: false,
      aiAdvancedChromaKey: false,
      aiObjectDetection: false,
      aiAutoEditing: false,
      aiImageUpscaling: false,
      aiPhotoRestoration: false,
      aiPortraitEnhance: false,
      aiObjectRemoval: false,
      aiVoiceSeparation: false,

      // Exportación
      maxExportResolution: '1080p',
      advancedCodecs: false,
      hdrSupport: false,
      batchProcessing: false,
    },
  },

  premium: {
    id: 'premium',
    name: 'Plan Premium',
    price: 24.99,
    description: 'Para creadores de contenido que necesitan funciones profesionales',
    limits: {
      maxVideoDuration: 5 * HOUR, // 5 horas
      maxVideoSize: 30 * GB,
      maxConcurrentProcessing: 2,
      storageLimit: 100 * GB,
      maxProjects: 50,
      maxExportsPerMonth: 100,
      processingPriority: 'normal',
      queueType: 'shared',
    },
    features: {
      dashboardType: 'professional',

      // Básicas
      basicTrim: true,
      basicVolume: true,
      basicRotate: true,
      basicCrop: true,

      // Imagen
      imageEnhance: true,
      imageColorize: true,
      imageResize: true,

      // Avanzadas - SÍ
      multiLayerTimeline: true,
      transitions: true,
      filters: true,
      chromaKey: true,
      animatedTitles: true,
      pictureInPicture: true,
      multiAudioTracks: true,
      joinVideos: true,

      // VHS
      vhsEnhancement: true,
      autoCropBlackBars: true,
      noiseReduction: true,

      // IA - BLOQUEADAS (🔒)
      aiUpscaling: false,
      aiStabilization: false,
      aiAudioEnhance: false,
      aiAutoSubtitles: false,
      aiColorCorrection: false,
      aiLowLightEnhance: false,
      aiFrameInterpolation: false,
      aiAdvancedChromaKey: false,
      aiObjectDetection: false,
      aiAutoEditing: false,
      aiImageUpscaling: false,
      aiPhotoRestoration: false,
      aiPortraitEnhance: false,
      aiObjectRemoval: false,
      aiVoiceSeparation: false,

      // Exportación
      maxExportResolution: '2k',
      advancedCodecs: true,
      hdrSupport: false,
      batchProcessing: false,
    },
  },

  professional: {
    id: 'professional',
    name: 'Plan Professional',
    price: 49.99,
    description: 'Poder completo con todas las funciones IA y sin límites',
    limits: {
      maxVideoDuration: 10 * HOUR, // 10 horas
      maxVideoSize: 100 * GB,
      maxConcurrentProcessing: 5,
      storageLimit: 500 * GB,
      maxProjects: 999999, // Ilimitado
      maxExportsPerMonth: 999999, // Ilimitado
      processingPriority: 'high',
      queueType: 'dedicated',
    },
    features: {
      dashboardType: 'professional',

      // Básicas
      basicTrim: true,
      basicVolume: true,
      basicRotate: true,
      basicCrop: true,

      // Imagen
      imageEnhance: true,
      imageColorize: true,
      imageResize: true,

      // Avanzadas - SÍ
      multiLayerTimeline: true,
      transitions: true,
      filters: true,
      chromaKey: true,
      animatedTitles: true,
      pictureInPicture: true,
      multiAudioTracks: true,
      joinVideos: true,

      // VHS
      vhsEnhancement: true,
      autoCropBlackBars: true,
      noiseReduction: true,

      // IA - TODAS DESBLOQUEADAS ✅
      aiUpscaling: true,
      aiStabilization: true,
      aiAudioEnhance: true,
      aiAutoSubtitles: true,
      aiColorCorrection: true,
      aiLowLightEnhance: true,
      aiFrameInterpolation: true,
      aiAdvancedChromaKey: true,
      aiObjectDetection: true,
      aiAutoEditing: true,
      aiImageUpscaling: true,
      aiPhotoRestoration: true,
      aiPortraitEnhance: true,
      aiObjectRemoval: true,
      aiVoiceSeparation: true,

      // Exportación
      maxExportResolution: '8k',
      advancedCodecs: true,
      hdrSupport: true,
      batchProcessing: true,
    },
  },
};

// Helper functions
export const getPlan = (planId: PlanId): Plan => {
  return PLANS[planId];
};

export const canUseFeature = (planId: PlanId, feature: keyof PlanFeatures): boolean => {
  return PLANS[planId].features[feature];
};

export const getRequiredPlanForFeature = (feature: keyof PlanFeatures): PlanId | null => {
  // Buscar el plan mínimo que tiene esta feature
  if (PLANS.basic.features[feature]) return 'basic';
  if (PLANS.premium.features[feature]) return 'premium';
  if (PLANS.professional.features[feature]) return 'professional';
  return null;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes} min`;
};
