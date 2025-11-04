import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { param, query, body } from 'express-validator';
import { validate, isValidMediaMimeType } from '../middleware/validation.middleware';
import { uploadRateLimiter, aiProcessingRateLimiter } from '../middleware/rateLimit.middleware';
import multer from 'multer';
import r2Service from '../services/r2.service';
import mediaService from '../services/media.service';
import fs from 'fs/promises';

const router = Router();

// Configure multer for file uploads with file filter
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (_req, file, cb) => {
    if (isValidMediaMimeType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// All routes require authentication (unless DISABLE_AUTH is set for testing)
if (process.env.DISABLE_AUTH !== 'true') {
  router.use(requireAuth);
} else {
  console.warn('⚠️ WARNING: Authentication is DISABLED. This is only for testing!');
}

// Upload media file
router.post(
  '/upload',
  uploadRateLimiter,
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      const userId = req.auth?.userId;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: { message: 'No file provided' },
        });
      }

      // Validar tamaño del archivo
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        // Eliminar archivo temporal
        await fs.unlink(file.path).catch(() => {});

        return res.status(400).json({
          success: false,
          error: {
            message: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
            code: 'FILE_TOO_LARGE',
          },
        });
      }

      // TODO: Check user storage quota before upload

      // Leer archivo como buffer
      const fileBuffer = await fs.readFile(file.path);

      let storageKey: string;
      let storageUrl: string;

      // Subir a R2 si está configurado
      if (r2Service.isConfigured()) {
        const key = r2Service.generateKey(userId!, file.originalname);
        const uploadResult = await r2Service.uploadFile(fileBuffer, key, file.mimetype);
        storageKey = uploadResult.key;
        storageUrl = uploadResult.url;
        console.log(`✅ File uploaded to R2: ${storageKey}`);
      } else {
        // Fallback: usar archivo local (solo para desarrollo)
        console.warn('⚠️ R2 not configured, using local storage');
        storageKey = `local/${userId}/${file.filename}`;
        storageUrl = `/uploads/${file.filename}`;
      }

      // Crear registro en base de datos
      const mediaFile = await mediaService.createMediaFile({
        userId: userId!,
        filename: file.filename,
        originalFilename: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        storageKey,
        storageUrl,
      });

      // Eliminar archivo temporal
      await fs.unlink(file.path).catch(() => {});

      console.log(`✅ Media file created: ${mediaFile.id}`);

      res.json({
        success: true,
        data: {
          fileId: mediaFile.id,
          filename: mediaFile.original_filename,
          size: mediaFile.file_size,
          mimeType: mediaFile.mime_type,
          uploadedAt: mediaFile.created_at,
          url: mediaFile.storage_url,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);

      // Distinguir entre diferentes tipos de errores
      if (error instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          error: {
            message: error.message,
            code: 'UPLOAD_ERROR',
          },
        });
      }

      res.status(500).json({
        success: false,
        error: { message: 'Failed to upload file' },
      });
    }
  }
);

// Get user's media files with pagination
router.get(
  '/',
  validate([
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .toInt()
      .withMessage('Limit must be between 1 and 100'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'size', 'filename'])
      .withMessage('Invalid sort field'),
    query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.auth?.userId;

      // Parámetros de paginación
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const sortBy = (req.query.sortBy as string) || 'created_at';
      const order = (req.query.order as string) || 'desc';

      // Obtener archivos desde la base de datos
      const result = await mediaService.getUserMediaFiles(userId!, {
        page,
        limit,
        sortBy,
        order: order as 'asc' | 'desc',
      });

      const totalPages = Math.ceil(result.total / limit);

      res.json({
        success: true,
        data: {
          files: result.files.map((file) => ({
            id: file.id,
            filename: file.original_filename,
            size: file.file_size,
            mimeType: file.mime_type,
            url: file.storage_url,
            thumbnailUrl: file.thumbnail_url,
            status: file.status,
            createdAt: file.created_at,
            updatedAt: file.updated_at,
          })),
          pagination: {
            page,
            limit,
            totalFiles: result.total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error('Get media files error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get media files' },
      });
    }
  }
);

// Get specific media file
router.get(
  '/:id',
  validate([param('id').notEmpty().withMessage('File ID is required')]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.auth?.userId;
      const { id } = req.params;

      // Obtener archivo desde la base de datos
      const mediaFile = await mediaService.getMediaFileById(id, userId!);

      if (!mediaFile) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'File not found',
            code: 'FILE_NOT_FOUND',
          },
        });
      }

      res.json({
        success: true,
        data: {
          id: mediaFile.id,
          filename: mediaFile.original_filename,
          size: mediaFile.file_size,
          mimeType: mediaFile.mime_type,
          url: mediaFile.storage_url,
          thumbnailUrl: mediaFile.thumbnail_url,
          status: mediaFile.status,
          createdAt: mediaFile.created_at,
          updatedAt: mediaFile.updated_at,
        },
      });
    } catch (error) {
      console.error('Get media file error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to get media file' },
      });
    }
  }
);

// Delete media file
router.delete(
  '/:id',
  validate([param('id').notEmpty().withMessage('File ID is required')]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.auth?.userId;
      const { id } = req.params;

      // Verificar que el archivo pertenece al usuario
      const mediaFile = await mediaService.getMediaFileById(id, userId!);

      if (!mediaFile) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'File not found',
            code: 'FILE_NOT_FOUND',
          },
        });
      }

      // Eliminar de R2 si está configurado
      if (r2Service.isConfigured()) {
        try {
          await r2Service.deleteFile(mediaFile.storage_key);
          console.log(`✅ File deleted from R2: ${mediaFile.storage_key}`);
        } catch (error) {
          console.error('⚠️ Error deleting from R2 (continuing anyway):', error);
          // Continuar con el delete de la BD incluso si R2 falla
        }
      }

      // Eliminar registro de base de datos
      const deleted = await mediaService.deleteMediaFile(id, userId!);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'File not found or already deleted',
            code: 'FILE_NOT_FOUND',
          },
        });
      }

      res.json({
        success: true,
        data: {
          message: 'File deleted successfully',
          fileId: id,
        },
      });
    } catch (error) {
      console.error('Delete media file error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to delete file' },
      });
    }
  }
);

// Process media with AI
router.post(
  '/:id/enhance',
  aiProcessingRateLimiter,
  validate([
    param('id').notEmpty().withMessage('File ID is required'),
    body('enhancements')
      .isArray()
      .withMessage('Enhancements must be an array')
      .notEmpty()
      .withMessage('At least one enhancement is required'),
    body('enhancements.*.type')
      .isIn(['denoise', 'upscale', 'colorgrade', 'stabilize', 'transcribe'])
      .withMessage('Invalid enhancement type'),
  ]),
  async (req: Request, res: Response) => {
    try {
      const userId = req.auth?.userId;
      const { id } = req.params;
      const { enhancements } = req.body;

      // TODO: Verify that the file belongs to the user
      // TODO: Check user's subscription plan allows AI enhancements
      // TODO: Queue AI enhancement job

      res.json({
        success: true,
        data: {
          jobId: 'temp-job-id',
          status: 'queued',
          enhancements: enhancements.map((e: any) => e.type),
        },
      });
    } catch (error) {
      console.error('Enhancement error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to queue enhancement' },
      });
    }
  }
);

export default router;
