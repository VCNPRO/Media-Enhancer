# 🚩 Feature Flags System - Media Enhancer

Sistema de permisos por nivel de suscripción.

---

## 📋 Definición de Features

### Constantes de Features

```typescript
// backend/src/middleware/featureAccess.ts

export const FEATURES = {
  // ═══════════════════════════════════════
  // CLIENTE - Básico (Todos los niveles)
  // ═══════════════════════════════════════
  BASIC_TRIM: 'basic_trim',              // Cortar fragmentos
  BASIC_JOIN: 'basic_join',              // Unir clips
  BASIC_VOLUME: 'basic_volume',          // Ajustar volumen
  BASIC_MUSIC: 'basic_music',            // Añadir música
  BASIC_TITLES: 'basic_titles',          // Títulos simples
  BASIC_ROTATE: 'basic_rotate',          // Rotar video
  BASIC_CROP: 'basic_crop',              // Cropear

  // ═══════════════════════════════════════
  // CLIENTE - Pro (Creator+)
  // ═══════════════════════════════════════
  PRO_TRANSITIONS: 'pro_transitions',    // Transiciones avanzadas
  PRO_MULTI_AUDIO: 'pro_multi_audio',    // Múltiples pistas audio
  PRO_CHROMA_KEY: 'pro_chroma_key',      // Chroma key (fondo verde)
  PRO_COLOR_EFFECTS: 'pro_color_effects', // Efectos de color
  PRO_TEMPLATES: 'pro_templates',        // Plantillas prediseñadas
  NO_WATERMARK: 'no_watermark',          // Sin marca de agua
  PRO_ADVANCED_TEXT: 'pro_advanced_text', // Textos animados
  PRO_FILTERS: 'pro_filters',            // Filtros avanzados

  // ═══════════════════════════════════════
  // SERVIDOR - IA (Professional only)
  // ═══════════════════════════════════════
  AI_ENHANCE: 'ai_enhance',              // Mejora automática IA
  AI_SUBTITLES: 'ai_subtitles',          // Auto-subtítulos
  AI_UPSCALING: 'ai_upscaling',          // Upscaling 4K
  AI_NOISE_REDUCTION: 'ai_noise_reduction', // Reducción ruido IA
  AI_ANALYSIS: 'ai_analysis',            // Análisis de contenido
  AI_STABILIZATION: 'ai_stabilization',  // Estabilización IA
  AI_COLOR_GRADING: 'ai_color_grading',  // Color grading automático
  AI_VOICEOVER: 'ai_voiceover',          // Generación voz IA
} as const;

export type Feature = typeof FEATURES[keyof typeof FEATURES];
```

---

## 🎯 Features por Plan

```typescript
export const PLAN_FEATURES: Record<string, Feature[]> = {
  starter: [
    // Solo básico
    FEATURES.BASIC_TRIM,
    FEATURES.BASIC_JOIN,
    FEATURES.BASIC_VOLUME,
    FEATURES.BASIC_MUSIC,
    FEATURES.BASIC_TITLES,
    FEATURES.BASIC_ROTATE,
    FEATURES.BASIC_CROP,
  ],

  creator: [
    // Básico + Pro
    ...PLAN_FEATURES.starter,
    FEATURES.PRO_TRANSITIONS,
    FEATURES.PRO_MULTI_AUDIO,
    FEATURES.PRO_CHROMA_KEY,
    FEATURES.PRO_COLOR_EFFECTS,
    FEATURES.PRO_TEMPLATES,
    FEATURES.NO_WATERMARK,
    FEATURES.PRO_ADVANCED_TEXT,
    FEATURES.PRO_FILTERS,
  ],

  professional: [
    // Básico + Pro + IA
    ...PLAN_FEATURES.creator,
    FEATURES.AI_ENHANCE,
    FEATURES.AI_SUBTITLES,
    FEATURES.AI_UPSCALING,
    FEATURES.AI_NOISE_REDUCTION,
    FEATURES.AI_ANALYSIS,
    FEATURES.AI_STABILIZATION,
    FEATURES.AI_COLOR_GRADING,
    FEATURES.AI_VOICEOVER,
  ],
};
```

---

## 📊 Límites por Plan

```typescript
// backend/src/config/planLimits.ts

export const PLAN_LIMITS = {
  starter: {
    storage: 5 * 1024 * 1024 * 1024,      // 5GB en bytes
    projects: 10,
    exportsPerMonth: 50,
    maxVideoDuration: 5 * 60,              // 5 min en segundos
    maxFileSize: 500 * 1024 * 1024,        // 500MB
    concurrentExports: 1,
  },

  creator: {
    storage: 50 * 1024 * 1024 * 1024,      // 50GB
    projects: 100,
    exportsPerMonth: 500,
    maxVideoDuration: 30 * 60,              // 30 min
    maxFileSize: 2 * 1024 * 1024 * 1024,   // 2GB
    concurrentExports: 3,
  },

  professional: {
    storage: 500 * 1024 * 1024 * 1024,     // 500GB
    projects: Infinity,
    exportsPerMonth: Infinity,
    maxVideoDuration: 2 * 60 * 60,          // 2 horas
    maxFileSize: 5 * 1024 * 1024 * 1024,   // 5GB
    concurrentExports: 10,
  },
};
```

---

## 🔒 Backend Middleware

### Feature Access Middleware

```typescript
// backend/src/middleware/featureAccess.ts

import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    subscription?: {
      plan_id: string;
      status: string;
    };
  };
}

/**
 * Middleware para verificar si el usuario tiene acceso a una feature
 */
export const requireFeature = (feature: Feature) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userPlan = req.user.subscription?.plan_id || 'starter';
      const planStatus = req.user.subscription?.status || 'inactive';

      // Verificar que la suscripción esté activa
      if (userPlan !== 'starter' && planStatus !== 'active') {
        return res.status(403).json({
          error: 'Subscription inactive',
          message: 'Your subscription is not active. Please update your payment method.',
        });
      }

      // Verificar si el plan incluye la feature
      const allowedFeatures = PLAN_FEATURES[userPlan] || [];

      if (!allowedFeatures.includes(feature)) {
        const requiredPlan = getRequiredPlan(feature);

        return res.status(403).json({
          error: 'Feature not available',
          feature,
          currentPlan: userPlan,
          requiredPlan,
          message: `This feature requires ${requiredPlan} plan or higher.`,
        });
      }

      next();
    } catch (error) {
      console.error('Feature access error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

/**
 * Determina qué plan se necesita para una feature
 */
const getRequiredPlan = (feature: Feature): string => {
  if (PLAN_FEATURES.professional.includes(feature) &&
      !PLAN_FEATURES.creator.includes(feature)) {
    return 'professional';
  }

  if (PLAN_FEATURES.creator.includes(feature) &&
      !PLAN_FEATURES.starter.includes(feature)) {
    return 'creator';
  }

  return 'starter';
};
```

---

### Limits Middleware

```typescript
// backend/src/middleware/limits.ts

/**
 * Verifica límite de almacenamiento
 */
export const checkStorageLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userPlan = req.user.subscription?.plan_id || 'starter';
  const limits = PLAN_LIMITS[userPlan];

  // Obtener uso actual del usuario
  const currentUsage = await getUserStorageUsage(req.user.id);
  const fileSize = req.file?.size || 0;

  if (currentUsage + fileSize > limits.storage) {
    return res.status(403).json({
      error: 'Storage limit exceeded',
      currentUsage,
      limit: limits.storage,
      requiredSpace: fileSize,
      upgradeRequired: userPlan === 'starter' ? 'creator' : 'professional',
    });
  }

  next();
};

/**
 * Verifica límite de proyectos
 */
export const checkProjectLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userPlan = req.user.subscription?.plan_id || 'starter';
  const limits = PLAN_LIMITS[userPlan];

  const projectCount = await getUserProjectCount(req.user.id);

  if (projectCount >= limits.projects) {
    return res.status(403).json({
      error: 'Project limit exceeded',
      currentProjects: projectCount,
      limit: limits.projects,
      upgradeRequired: 'creator',
    });
  }

  next();
};

/**
 * Verifica límite de exports mensuales
 */
export const checkExportLimit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userPlan = req.user.subscription?.plan_id || 'starter';
  const limits = PLAN_LIMITS[userPlan];

  if (limits.exportsPerMonth === Infinity) {
    return next();
  }

  const monthlyExports = await getUserMonthlyExports(req.user.id);

  if (monthlyExports >= limits.exportsPerMonth) {
    return res.status(403).json({
      error: 'Export limit exceeded',
      exportsThisMonth: monthlyExports,
      limit: limits.exportsPerMonth,
      resetDate: getNextMonthStart(),
      upgradeRequired: userPlan === 'starter' ? 'creator' : 'professional',
    });
  }

  next();
};

/**
 * Verifica duración del video
 */
export const checkVideoDuration = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const userPlan = req.user.subscription?.plan_id || 'starter';
  const limits = PLAN_LIMITS[userPlan];
  const videoDuration = req.body.duration; // en segundos

  if (videoDuration > limits.maxVideoDuration) {
    return res.status(403).json({
      error: 'Video duration exceeds limit',
      duration: videoDuration,
      limit: limits.maxVideoDuration,
      upgradeRequired: userPlan === 'starter' ? 'creator' : 'professional',
    });
  }

  next();
};
```

---

## ⚛️ Frontend Hook

### useFeatureAccess Hook

```typescript
// frontend/src/hooks/useFeatureAccess.ts

import { useUser } from '@clerk/clerk-react';
import { FEATURES, PLAN_FEATURES } from '../config/features';

export const useFeatureAccess = () => {
  const { user } = useUser();

  // Obtener plan del usuario desde metadata
  const plan = user?.publicMetadata?.subscription?.plan_id || 'starter';

  /**
   * Verifica si el usuario puede usar una feature
   */
  const canUse = (feature: string): boolean => {
    const allowedFeatures = PLAN_FEATURES[plan] || [];
    return allowedFeatures.includes(feature);
  };

  /**
   * Obtiene el plan requerido para una feature
   */
  const getRequiredPlan = (feature: string): string | null => {
    if (canUse(feature)) return null;

    if (PLAN_FEATURES.professional.includes(feature)) {
      return 'professional';
    }

    if (PLAN_FEATURES.creator.includes(feature)) {
      return 'creator';
    }

    return null;
  };

  /**
   * Retorna todas las features disponibles
   */
  const getAvailableFeatures = (): string[] => {
    return PLAN_FEATURES[plan] || [];
  };

  /**
   * Verifica si debe mostrar upgrade modal
   */
  const shouldShowUpgrade = (feature: string): boolean => {
    return !canUse(feature);
  };

  return {
    canUse,
    getRequiredPlan,
    getAvailableFeatures,
    shouldShowUpgrade,
    currentPlan: plan,
  };
};
```

---

### useUpgradeModal Hook

```typescript
// frontend/src/hooks/useUpgradeModal.ts

import { useState } from 'react';

interface UpgradeModalState {
  isOpen: boolean;
  feature: string;
  requiredPlan: string;
}

export const useUpgradeModal = () => {
  const [modal, setModal] = useState<UpgradeModalState>({
    isOpen: false,
    feature: '',
    requiredPlan: '',
  });

  const showUpgradeModal = (feature: string, requiredPlan: string) => {
    setModal({
      isOpen: true,
      feature,
      requiredPlan,
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      feature: '',
      requiredPlan: '',
    });
  };

  return {
    modal,
    showUpgradeModal,
    closeModal,
  };
};
```

---

## 🎨 Frontend Components

### Feature-Gated Button

```tsx
// frontend/src/components/FeatureButton.tsx

import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { useUpgradeModal } from '../hooks/useUpgradeModal';

interface FeatureButtonProps {
  feature: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export const FeatureButton: React.FC<FeatureButtonProps> = ({
  feature,
  onClick,
  children,
  className = '',
}) => {
  const { canUse, getRequiredPlan } = useFeatureAccess();
  const { showUpgradeModal } = useUpgradeModal();

  const isLocked = !canUse(feature);
  const requiredPlan = getRequiredPlan(feature);

  const handleClick = () => {
    if (isLocked) {
      showUpgradeModal(feature, requiredPlan!);
    } else {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${className}
        ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      `}
      disabled={isLocked}
    >
      {children}
      {isLocked && <span className="ml-2">🔒</span>}
    </button>
  );
};
```

---

### Upgrade Modal

```tsx
// frontend/src/components/UpgradeModal.tsx

import { useUpgradeModal } from '../hooks/useUpgradeModal';

export const UpgradeModal = () => {
  const { modal, closeModal } = useUpgradeModal();

  if (!modal.isOpen) return null;

  const planInfo = {
    creator: {
      price: '$14.99/mes',
      features: ['50GB almacenamiento', '100 proyectos', 'Transiciones Pro'],
    },
    professional: {
      price: '$49.99/mes',
      features: ['500GB almacenamiento', 'Proyectos ilimitados', 'Funciones IA'],
    },
  };

  const info = planInfo[modal.requiredPlan];

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>🔒 Función Premium</h2>
        <p>Esta función requiere el plan {modal.requiredPlan}</p>

        <div className="plan-info">
          <h3>{modal.requiredPlan} - {info.price}</h3>
          <ul>
            {info.features.map(f => <li key={f}>✅ {f}</li>)}
          </ul>
        </div>

        <div className="actions">
          <button onClick={() => window.location.href = '/pricing'}>
            Mejorar Plan
          </button>
          <button onClick={closeModal}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};
```

---

## 🧪 Ejemplos de Uso

### En Rutas de Backend

```typescript
// backend/src/routes/ai.ts

import { requireFeature } from '../middleware/featureAccess';
import { FEATURES } from '../middleware/featureAccess';

app.post('/api/ai/enhance',
  requireFeature(FEATURES.AI_ENHANCE),
  async (req, res) => {
    // Solo usuarios Professional llegan aquí
    const { videoId } = req.body;

    const job = await aiQueue.add('enhance', {
      videoId,
      userId: req.user.id,
    });

    res.json({ jobId: job.id });
  }
);

app.post('/api/projects',
  checkProjectLimit,
  async (req, res) => {
    // Verifica límite antes de crear
    const project = await createProject(req.user.id, req.body);
    res.json(project);
  }
);
```

---

### En Componentes Frontend

```tsx
// frontend/src/pages/EditorPage.tsx

import { FeatureButton } from '../components/FeatureButton';
import { FEATURES } from '../config/features';

const EditorPage = () => {
  return (
    <div className="editor">
      {/* Disponible para todos */}
      <button onClick={handleTrim}>✂️ Cortar</button>

      {/* Solo Creator+ */}
      <FeatureButton
        feature={FEATURES.PRO_TRANSITIONS}
        onClick={handleTransitions}
      >
        ✨ Transiciones
      </FeatureButton>

      {/* Solo Professional */}
      <FeatureButton
        feature={FEATURES.AI_ENHANCE}
        onClick={handleAIEnhance}
      >
        🤖 Mejorar con IA
      </FeatureButton>
    </div>
  );
};
```

---

## 📈 Testing

### Test de Middleware

```typescript
// backend/src/middleware/__tests__/featureAccess.test.ts

describe('requireFeature middleware', () => {
  it('should allow starter users to use basic features', async () => {
    const req = mockRequest({
      user: { subscription: { plan_id: 'starter' } }
    });
    const res = mockResponse();
    const next = jest.fn();

    await requireFeature(FEATURES.BASIC_TRIM)(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should block starter users from AI features', async () => {
    const req = mockRequest({
      user: { subscription: { plan_id: 'starter' } }
    });
    const res = mockResponse();
    const next = jest.fn();

    await requireFeature(FEATURES.AI_ENHANCE)(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
```

---

**Última actualización:** 2024-11-02
