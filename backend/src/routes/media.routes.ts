import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { param, query, body } from 'express-validator';
import { validate, isValidUUID, isValidMediaMimeType } from '../middleware/validation.middleware';
import { uploadRateLimiter, aiProcessingRateLimiter } from '../middleware/rateLimit.middleware';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads with file filter
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (isValidMediaMimeType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// All routes require authentication
router.use(requireAuth);

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
        return res.status(400).json({
          success: false,
          error: {
            message: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
            code: 'FILE_TOO_LARGE',
          },
        });
      }

      // TODO: Upload to Cloudflare R2
      // TODO: Create media record in database
      // TODO: Check user storage quota before upload

      res.json({
        success: true,
        data: {
          fileId: 'temp-id',
          filename: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date().toISOString(),
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
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const order = (req.query.order as string) || 'desc';
      const offset = (page - 1) * limit;

      // TODO: Fetch media files from database with pagination
      // const result = await pool.query(
      //   'SELECT * FROM media_files WHERE user_id = $1 ORDER BY $2 $3 LIMIT $4 OFFSET $5',
      //   [userId, sortBy, order, limit, offset]
      // );

      const totalFiles = 0; // TODO: Get from database
      const totalPages = Math.ceil(totalFiles / limit);

      res.json({
        success: true,
        data: {
          files: [],
          pagination: {
            page,
            limit,
            totalFiles,
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

      // TODO: Fetch media file from database
      // TODO: Verify that the file belongs to the user

      res.json({
        success: true,
        data: {
          fileId: id,
          // Add file data here
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

      // TODO: Verify that the file belongs to the user
      // TODO: Delete from R2 and database

      res.json({
        success: true,
        data: {
          message: 'File deleted successfully',
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
