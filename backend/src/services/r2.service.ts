import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Servicio para interactuar con Cloudflare R2 (compatible con S3)
 */
class R2Service {
  private client: S3Client | null = null;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME || '';
    this.publicUrl = process.env.R2_PUBLIC_URL || '';

    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      console.warn('⚠️ R2 credentials not configured. File upload will not work.');
      return;
    }

    try {
      this.client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      });
      console.log('✅ R2 client initialized');
    } catch (error) {
      console.error('❌ Error initializing R2 client:', error);
    }
  }

  /**
   * Verificar si R2 está configurado
   */
  isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Subir archivo a R2
   */
  async uploadFile(
    file: Buffer,
    key: string,
    contentType: string
  ): Promise<{ key: string; url: string }> {
    if (!this.client) {
      throw new Error('R2 client not configured');
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: contentType,
      });

      await this.client.send(command);

      const url = `${this.publicUrl}/${key}`;

      console.log(`✅ File uploaded to R2: ${key}`);

      return { key, url };
    } catch (error) {
      console.error('❌ Error uploading file to R2:', error);
      throw new Error('Failed to upload file to storage');
    }
  }

  /**
   * Eliminar archivo de R2
   */
  async deleteFile(key: string): Promise<void> {
    if (!this.client) {
      throw new Error('R2 client not configured');
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.client.send(command);

      console.log(`✅ File deleted from R2: ${key}`);
    } catch (error) {
      console.error('❌ Error deleting file from R2:', error);
      throw new Error('Failed to delete file from storage');
    }
  }

  /**
   * Obtener URL firmada para subir archivos (PUT)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.client) {
      throw new Error('R2 client not configured');
    }

    try {
      // Usar PutObjectCommand para generar URL de subida
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });

      return url;
    } catch (error) {
      console.error('❌ Error getting signed URL:', error);
      throw new Error('Failed to get file URL');
    }
  }

  /**
   * Obtener URL firmada para descargar archivos (GET)
   */
  async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (!this.client) {
      throw new Error('R2 client not configured');
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });

      return url;
    } catch (error) {
      console.error('❌ Error getting signed download URL:', error);
      throw new Error('Failed to get file URL');
    }
  }

  /**
   * Generar key único para archivo
   */
  generateKey(userId: string, filename: string): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `users/${userId}/${timestamp}-${sanitizedFilename}`;
  }

  /**
   * Obtener URL pública de un archivo
   */
  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}

export default new R2Service();
