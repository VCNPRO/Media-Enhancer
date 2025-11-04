import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Rate limiter para endpoints de subida de archivos
 * Límite: 5 uploads por minuto por usuario
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5,
  message: {
    success: false,
    error: {
      message: 'Too many upload requests. Please try again in a minute.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Usar userId como key en lugar de IP
  keyGenerator: (req: Request) => {
    return req.auth?.userId || req.ip;
  },
});

/**
 * Rate limiter para endpoints de autenticación
 * Límite: 5 intentos por 15 minutos
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para procesamiento con IA
 * Límite: 10 procesamiento por hora por usuario
 */
export const aiProcessingRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10,
  message: {
    success: false,
    error: {
      message:
        'You have reached your AI processing limit. Please try again in an hour.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.auth?.userId || req.ip;
  },
});

/**
 * Rate limiter general para API
 * Límite: 100 requests por 15 minutos
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    success: false,
    error: {
      message: 'Too many requests. Please slow down.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.auth?.userId || req.ip;
  },
});

/**
 * Rate limiter para checkout/pagos
 * Límite: 3 intentos por 10 minutos
 */
export const checkoutRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 3,
  message: {
    success: false,
    error: {
      message: 'Too many checkout attempts. Please try again later.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.auth?.userId || req.ip;
  },
});
