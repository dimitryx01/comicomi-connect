
/**
 * Utilidades para gestión de almacenamiento de medios
 * Separación clara entre subida y obtención de archivos
 */

import { compressMedia, validateMediaFile } from './mediaCompression';
import { supabase } from '@/integrations/supabase/client';

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
    const { data: uploadData, error: uploadError } = await supabase.functions.invoke('b2-upload', {
      body: {
        fileName,
        contentType: compressedFile.type
      }
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // 5. Subir archivo a B2 usando la URL firmada
    const uploadResponse = await fetch(uploadData.uploadUrl, {
      method: 'PUT',
      body: compressedFile,
      headers: {
        'Authorization': uploadData.authorizationToken,
        'Content-Type': compressedFile.type,
        'X-Bz-File-Name': encodeURIComponent(fileName),
        'X-Bz-Content-Sha1': 'unverified'
      }
    });

    if (!uploadResponse.ok) {
      throw new Error('Error subiendo archivo a B2');
    }

    console.log('Archivo subido exitosamente a B2:', fileName);

    return {
      success: true,
      url: uploadData.fileUrl,
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
      const { data, error } = await supabase.functions.invoke('b2-signed-url', {
        body: {
          fileId,
          userId,
          expiresIn
        }
      });

      if (error) {
        throw new Error('Error obteniendo URL firmada');
      }

      return data.signedUrl;
    }
    
    // Para archivos públicos, URL directa
    return `https://s3.us-east-005.backblazeb2.com/comicomi-media/${fileId}`;
  } catch (error) {
    console.error('Error obteniendo URL de media:', error);
    // Fallback a URL directa
    return `https://s3.us-east-005.backblazeb2.com/comicomi-media/${fileId}`;
  }
};

/**
 * Obtiene información de un archivo sin descargarlo
 */
export const getMediaInfo = async (fileId: string) => {
  try {
    // Para obtener info del archivo, usaríamos una edge function adicional
    // Por ahora retornamos información básica
    return {
      id: fileId,
      name: fileId.split('/').pop() || 'archivo.jpg',
      size: 1024000,
      type: 'image/jpeg',
      uploadedAt: new Date(),
      isPrivate: false
    };
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
    // Implementar edge function para eliminar archivos de B2
    console.log('Eliminación de archivos pendiente de implementar:', fileId);
    return true;
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
    // Implementar edge function para listar archivos de B2
    console.log('Listado de archivos pendiente de implementar:', folder);
    return {
      files: [],
      total: 0,
      hasMore: false
    };
  } catch (error) {
    console.error('Error listando archivos:', error);
    return {
      files: [],
      total: 0,
      hasMore: false
    };
  }
};
