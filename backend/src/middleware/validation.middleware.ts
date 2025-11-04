import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Middleware para manejar errores de validación de express-validator
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: errors.array(),
      },
    });
    return;
  }

  next();
};

/**
 * Ejecuta un array de validaciones en secuencia
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Ejecutar todas las validaciones
    for (const validation of validations) {
      await validation.run(req);
    }

    // Verificar si hay errores
    handleValidationErrors(req, res, next);
  };
};

/**
 * Validación personalizada para tipos MIME de archivos multimedia
 */
export const isValidMediaMimeType = (value: string): boolean => {
  const validMimeTypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'image/jpeg',
    'image/png',
  ];

  return validMimeTypes.includes(value);
};

/**
 * Validación para UUID
 */
export const isValidUUID = (value: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};
