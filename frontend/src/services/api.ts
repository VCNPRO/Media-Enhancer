import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Get token from Clerk
    try {
      const clerkToken = await (window as any).__clerk?.session?.getToken();
      if (clerkToken) {
        config.headers.Authorization = `Bearer ${clerkToken}`;
      }
    } catch (error) {
      console.error('Error getting Clerk token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    console.error('API Error:', {
      status: error.response?.status,
      message: error.response?.data?.error?.message || error.message,
      code: error.response?.data?.error?.code,
    });

    // Handle specific error statuses
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      console.warn('Unauthorized access - redirecting to login');
      window.location.href = '/sign-in';
    } else if (error.response?.status === 429) {
      // Rate limit exceeded
      console.warn('Rate limit exceeded - please try again later');
    }

    return Promise.reject(error);
  }
);

/**
 * Helper para subir archivos con seguimiento de progreso
 */
export const uploadFile = async (
  file: File,
  onProgress?: (progress: number) => void
) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
      timeout: 60000, // 60 segundos timeout
    });

    return response.data;
  } catch (error: any) {
    // Mejorar mensaje de error
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      'Failed to upload file';
    throw new Error(errorMessage);
  }
};

/**
 * Helper para obtener lista de archivos con paginación
 */
export const getMediaFiles = async (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}) => {
  try {
    const response = await api.get('/media', { params });
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      'Failed to fetch media files';
    throw new Error(errorMessage);
  }
};

/**
 * Helper para obtener suscripción del usuario
 */
export const getSubscription = async () => {
  try {
    const response = await api.get('/subscriptions');
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      'Failed to fetch subscription';
    throw new Error(errorMessage);
  }
};
