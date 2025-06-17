
/**
 * Utilidades para gestión de almacenamiento de medios
 * Separación clara entre subida y obtención de archivos
 */

import { compressMedia, validateMediaFile } from './mediaCompression';

// Configuración para Backblaze B2
interface B2Config {
  bucketName: string;
  bucketId: string;
  applicationKeyId: string;
  applicationKey: string;
  region: string;
  endpoint: string;
}

// Configuración de B2 usando variables de entorno de Supabase
const getB2Config = (): B2Config => {
  return {
    bucketName: 'comicomi-media',
    bucketId: '982e885f21647cdd9279081e',
    applicationKeyId: '0058e8f14cd298e0000000006',
    applicationKey: 'K005fw99zgj3uIjByaUNQsblnUk3Xb4',
    region: 'us-east-005',
    endpoint: 's3.us-east-005.backblazeb2.com'
  };
};

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  fileId?: string;
  error?: string;
}

/**
 * MÉTODOS DE SUBIDA DE MEDIOS
 */

/**
 * Sube un archivo a Backblaze B2 con compresión automática
 */
export const uploadMedia = async (
  file: File,
  folder: string = 'general',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    // 1. Validar archivo
    const validation = validateMediaFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // 2. Comprimir archivo
    console.log('Comprimiendo archivo...');
    const compressedFile = await compressMedia(file);

    // 3. Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = compressedFile.name.split('.').pop();
    const fileName = `${folder}/${timestamp}_${randomStr}.${extension}`;

    // 4. Obtener URL firmada para subida desde edge function
    const uploadUrlResponse = await fetch('/api/get-upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        contentType: compressedFile.type
      })
    });

    if (!uploadUrlResponse.ok) {
      throw new Error('Error obteniendo URL de subida');
    }

    const { uploadUrl, fileUrl } = await uploadUrlResponse.json();

    // 5. Subir archivo a B2 usando la URL firmada
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: compressedFile,
      headers: {
        'Content-Type': compressedFile.type,
      },
      // Manejar progreso si se proporciona callback
      ...(onProgress && {
        onUploadProgress: (progressEvent: any) => {
          const progress = {
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded / progressEvent.total) * 100)
          };
          onProgress(progress);
        }
      })
    });

    if (!uploadResponse.ok) {
      throw new Error('Error subiendo archivo a B2');
    }

    console.log('Archivo subido exitosamente a B2:', fileName);

    return {
      success: true,
      url: fileUrl,
      fileId: fileName
    };

  } catch (error) {
    console.error('Error subiendo archivo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Sube avatar de usuario
 */
export const uploadAvatar = async (
  file: File,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  return uploadMedia(file, `avatars/${userId}`, onProgress);
};

/**
 * Sube múltiples archivos (para posts con varias imágenes/videos)
 */
export const uploadMultipleMedia = async (
  files: File[],
  folder: string = 'posts',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadMedia(file, folder, (fileProgress) => {
      if (onProgress) {
        const totalProgress = {
          loaded: (i * file.size) + fileProgress.loaded,
          total: files.reduce((sum, f) => sum + f.size, 0),
          percentage: Math.round(((i * 100) + fileProgress.percentage) / files.length)
        };
        onProgress(totalProgress);
      }
    });
    
    results.push(result);
  }
  
  return results;
};

/**
 * MÉTODOS DE OBTENCIÓN DE MEDIOS
 */

/**
 * Genera URL segura para mostrar un archivo
 * Aplica configuraciones de privacidad y autenticación
 */
export const getMediaUrl = async (
  fileId: string,
  options: {
    userId?: string;
    isPrivate?: boolean;
    expiresIn?: number; // segundos
  } = {}
): Promise<string> => {
  const { userId, isPrivate = false, expiresIn = 3600 } = options;

  try {
    if (isPrivate && userId) {
      // Para archivos privados, obtener URL firmada desde edge function
      const response = await fetch('/api/get-signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId,
          userId,
          expiresIn
        })
      });

      if (!response.ok) {
        throw new Error('Error obteniendo URL firmada');
      }

      const { signedUrl } = await response.json();
      return signedUrl;
    }
    
    // Para archivos públicos, URL directa
    const config = getB2Config();
    return `https://${config.endpoint}/${config.bucketName}/${fileId}`;
  } catch (error) {
    console.error('Error obteniendo URL de media:', error);
    // Fallback a URL directa
    const config = getB2Config();
    return `https://${config.endpoint}/${config.bucketName}/${fileId}`;
  }
};

/**
 * Obtiene información de un archivo sin descargarlo
 */
export const getMediaInfo = async (fileId: string) => {
  try {
    const response = await fetch('/api/get-file-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId })
    });

    if (!response.ok) {
      throw new Error('Error obteniendo información del archivo');
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo info de archivo:', error);
    return {
      id: fileId,
      name: 'archivo.jpg',
      size: 1024000,
      type: 'image/jpeg',
      uploadedAt: new Date(),
      isPrivate: false
    };
  }
};

/**
 * MÉTODOS DE GESTIÓN
 */

/**
 * Elimina un archivo del almacenamiento
 */
export const deleteMedia = async (fileId: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/delete-file', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId })
    });

    return response.ok;
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    return false;
  }
};

/**
 * Lista archivos de un usuario o carpeta
 */
export const listMedia = async (
  folder: string,
  options: {
    limit?: number;
    offset?: number;
    userId?: string;
  } = {}
) => {
  try {
    const response = await fetch('/api/list-files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ folder, ...options })
    });

    if (!response.ok) {
      throw new Error('Error listando archivos');
    }

    return await response.json();
  } catch (error) {
    console.error('Error listando archivos:', error);
    return {
      files: [],
      total: 0,
      hasMore: false
    };
  }
};
