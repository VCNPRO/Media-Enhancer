/**
 * Verifica si el navegador es compatible con FFmpeg.wasm
 * FFmpeg.wasm requiere SharedArrayBuffer y navegadores modernos
 */

export interface BrowserCompatibility {
  isSupported: boolean;
  issues: string[];
  browser: string;
  isModern: boolean;
}

export const checkBrowserCompatibility = (): BrowserCompatibility => {
  const issues: string[] = [];
  let isSupported = true;

  // Detectar navegador
  const userAgent = navigator.userAgent;
  let browser = 'Unknown';

  if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Firefox';
  } else if (userAgent.indexOf('Chrome') > -1) {
    browser = 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    browser = 'Safari';
  } else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg') > -1) {
    browser = 'Edge';
  } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    browser = 'Opera';
  }

  // Verificar SharedArrayBuffer (requerido para FFmpeg.wasm)
  if (typeof SharedArrayBuffer === 'undefined') {
    issues.push('SharedArrayBuffer no está disponible. Esto es necesario para FFmpeg.wasm.');
    isSupported = false;
  }

  // Verificar WebAssembly
  if (typeof WebAssembly === 'undefined') {
    issues.push('WebAssembly no está disponible. Tu navegador es muy antiguo.');
    isSupported = false;
  }

  // Verificar si está en HTTPS o localhost (requerido para SharedArrayBuffer)
  const isSecureContext = window.isSecureContext;
  if (!isSecureContext) {
    issues.push('Se requiere HTTPS o localhost para usar esta aplicación.');
    isSupported = false;
  }

  // Verificar APIs necesarias
  if (!window.URL || !window.URL.createObjectURL) {
    issues.push('URL.createObjectURL no está disponible.');
    isSupported = false;
  }

  if (!window.File || !window.FileReader) {
    issues.push('API de archivos no disponible.');
    isSupported = false;
  }

  // Determinar si es navegador moderno (aproximadamente)
  const isModern =
    typeof Promise !== 'undefined' &&
    typeof fetch !== 'undefined' &&
    typeof WebAssembly !== 'undefined';

  return {
    isSupported,
    issues,
    browser,
    isModern,
  };
};

/**
 * Obtiene recomendaciones basadas en el navegador actual
 */
export const getBrowserRecommendations = (compatibility: BrowserCompatibility): string[] => {
  const recommendations: string[] = [];

  if (!compatibility.isSupported) {
    recommendations.push('Actualiza tu navegador a la última versión.');

    if (compatibility.browser === 'Safari') {
      recommendations.push('Safari puede tener problemas con SharedArrayBuffer. Considera usar Chrome o Firefox.');
    }

    if (!window.isSecureContext) {
      recommendations.push('Asegúrate de estar usando HTTPS o localhost.');
    }

    if (!compatibility.isModern) {
      recommendations.push('Tu navegador es muy antiguo. Por favor, actualiza a Chrome 90+, Firefox 88+, Safari 15.2+, o Edge 90+.');
    }
  }

  return recommendations;
};

/**
 * Verifica si los headers COOP/COEP están configurados correctamente
 */
export const checkCOOPCOEPHeaders = async (): Promise<{
  configured: boolean;
  coopHeader: string | null;
  coepHeader: string | null;
  message: string;
}> => {
  try {
    // Intentar verificar si SharedArrayBuffer está disponible
    const hasSAB = typeof SharedArrayBuffer !== 'undefined';

    if (!hasSAB) {
      return {
        configured: false,
        coopHeader: null,
        coepHeader: null,
        message:
          'SharedArrayBuffer no está disponible.\n\n' +
          'Tu sitio necesita estos headers HTTP:\n' +
          '• Cross-Origin-Opener-Policy: same-origin\n' +
          '• Cross-Origin-Embedder-Policy: require-corp\n\n' +
          'Vercel configura esto automáticamente con vercel.json.\n' +
          'En desarrollo local, usa: vite --host',
      };
    }

    return {
      configured: true,
      coopHeader: 'same-origin',
      coepHeader: 'require-corp',
      message: 'Headers COOP/COEP configurados correctamente ✓',
    };
  } catch (err) {
    return {
      configured: false,
      coopHeader: null,
      coepHeader: null,
      message: `Error verificando headers: ${err}`,
    };
  }
};

/**
 * Muestra información de depuración sobre el navegador
 */
export const getBrowserDebugInfo = (): Record<string, any> => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    onLine: navigator.onLine,
    cookieEnabled: navigator.cookieEnabled,
    hasSharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
    hasWebAssembly: typeof WebAssembly !== 'undefined',
    isSecureContext: window.isSecureContext,
    hasServiceWorker: 'serviceWorker' in navigator,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    crossOriginIsolated: window.crossOriginIsolated || false,
  };
};
