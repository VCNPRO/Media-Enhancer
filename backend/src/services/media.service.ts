import pool from '../config/database';

export interface MediaFile {
  id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  duration?: number;
  resolution?: string;
  storage_key: string;
  storage_url: string;
  thumbnail_url?: string;
  status: 'uploading' | 'ready' | 'processing' | 'error';
  created_at: Date;
  updated_at: Date;
}

export interface CreateMediaFileInput {
  userId: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  storageKey: string;
  storageUrl: string;
}

class MediaService {
  /**
   * Crear registro de archivo en la base de datos
   */
  async createMediaFile(input: CreateMediaFileInput): Promise<MediaFile> {
    const query = `
      INSERT INTO media_files (
        user_id, filename, original_filename, file_size,
        mime_type, storage_key, storage_url, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      input.userId,
      input.filename,
      input.originalFilename,
      input.fileSize,
      input.mimeType,
      input.storageKey,
      input.storageUrl,
      'ready',
    ];

    try {
      const result = await pool.query(query, values);
      console.log(`✅ Media file created in DB: ${result.rows[0].id}`);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error creating media file in DB:', error);
      throw new Error('Failed to create media file record');
    }
  }

  /**
   * Obtener archivos de un usuario con paginación
   */
  async getUserMediaFiles(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: string;
      order?: 'asc' | 'desc';
    } = {}
  ): Promise<{ files: MediaFile[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const sortBy = options.sortBy || 'created_at';
    const order = options.order || 'desc';
    const offset = (page - 1) * limit;

    // Validar sortBy para prevenir SQL injection
    const allowedSortFields = ['created_at', 'updated_at', 'file_size', 'filename'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = order === 'asc' ? 'ASC' : 'DESC';

    try {
      // Obtener total de archivos
      const countQuery = 'SELECT COUNT(*) FROM media_files WHERE user_id = $1';
      const countResult = await pool.query(countQuery, [userId]);
      const total = parseInt(countResult.rows[0].count);

      // Obtener archivos paginados
      const query = `
        SELECT * FROM media_files
        WHERE user_id = $1
        ORDER BY ${safeSortBy} ${safeOrder}
        LIMIT $2 OFFSET $3
      `;
      const result = await pool.query(query, [userId, limit, offset]);

      console.log(`✅ Retrieved ${result.rows.length} media files for user ${userId}`);

      return {
        files: result.rows,
        total,
      };
    } catch (error) {
      console.error('❌ Error getting user media files:', error);
      throw new Error('Failed to get media files');
    }
  }

  /**
   * Obtener un archivo por ID
   */
  async getMediaFileById(fileId: string, userId: string): Promise<MediaFile | null> {
    const query = 'SELECT * FROM media_files WHERE id = $1 AND user_id = $2';

    try {
      const result = await pool.query(query, [fileId, userId]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('❌ Error getting media file by ID:', error);
      throw new Error('Failed to get media file');
    }
  }

  /**
   * Eliminar archivo de la base de datos
   */
  async deleteMediaFile(fileId: string, userId: string): Promise<boolean> {
    const query = 'DELETE FROM media_files WHERE id = $1 AND user_id = $2 RETURNING *';

    try {
      const result = await pool.query(query, [fileId, userId]);

      if (result.rows.length === 0) {
        return false;
      }

      console.log(`✅ Media file deleted from DB: ${fileId}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting media file from DB:', error);
      throw new Error('Failed to delete media file');
    }
  }

  /**
   * Actualizar estado del archivo
   */
  async updateMediaFileStatus(
    fileId: string,
    status: 'uploading' | 'ready' | 'processing' | 'error'
  ): Promise<void> {
    const query = 'UPDATE media_files SET status = $1, updated_at = NOW() WHERE id = $2';

    try {
      await pool.query(query, [status, fileId]);
      console.log(`✅ Media file status updated: ${fileId} -> ${status}`);
    } catch (error) {
      console.error('❌ Error updating media file status:', error);
      throw new Error('Failed to update media file status');
    }
  }

  /**
   * Obtener uso de almacenamiento del usuario
   */
  async getUserStorageUsage(userId: string): Promise<number> {
    const query = 'SELECT SUM(file_size) as total FROM media_files WHERE user_id = $1';

    try {
      const result = await pool.query(query, [userId]);
      const total = parseInt(result.rows[0].total) || 0;
      return total;
    } catch (error) {
      console.error('❌ Error getting user storage usage:', error);
      throw new Error('Failed to get storage usage');
    }
  }
}

export default new MediaService();
