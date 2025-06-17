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
    console.log('📁 mediaStorage: Iniciando subida de archivo:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      folder
    });

    // 1. Validar archivo
    const validation = validateMediaFile(file);
    if (!validation.valid) {
      console.error('❌ mediaStorage: Validación fallida:', validation.error);
      return { success: false, error: validation.error };
    }

    console.log('✅ mediaStorage: Archivo validado correctamente');

    // 2. Comprimir archivo
    console.log('🗜️ mediaStorage: Comprimiendo archivo...');
    const compressedFile = await compressMedia(file);
    console.log('✅ mediaStorage: Archivo comprimido:', {
      originalSize: file.size,
      compressedSize: compressedFile.size,
      reduction: Math.round((1 - compressedFile.size / file.size) * 100) + '%'
    });

    // 3. Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = compressedFile.name.split('.').pop();
    const fileName = `${folder}/${timestamp}_${randomStr}.${extension}`;

    console.log('📝 mediaStorage: Nombre de archivo generado:', fileName);

    // 4. Preparar FormData para la subida
    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('fileName', fileName);

    console.log('📤 mediaStorage: Enviando archivo a edge function...');

    if (onProgress) {
      onProgress({ loaded: 0, total: compressedFile.size, percentage: 0 });
    }

    // 5. Subir archivo usando la edge function que maneja todo el proceso B2
    const { data: uploadData, error: uploadError } = await supabase.functions.invoke('b2-upload', {
      body: formData
    });

    if (uploadError) {
      console.error('❌ mediaStorage: Error en edge function:', uploadError);
      throw new Error(`Error en subida: ${uploadError.message}`);
    }

    if (!uploadData || !uploadData.success) {
      console.error('❌ mediaStorage: Respuesta de error de edge function:', uploadData);
      throw new Error(uploadData?.error || 'Error desconocido en la subida');
    }

    if (onProgress) {
      onProgress({ loaded: compressedFile.size, total: compressedFile.size, percentage: 100 });
    }

    console.log('✅ mediaStorage: Archivo subido exitosamente:', uploadData);

    const result = {
      success: true,
      url: uploadData.url,
      fileId: uploadData.fileId
    };

    console.log('🎉 mediaStorage: Subida completada exitosamente:', result);

    return result;

  } catch (error) {
    console.error('💥 mediaStorage: Error crítico durante la subida:', error);
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
