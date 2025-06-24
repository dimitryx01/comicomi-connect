/**
 * Utilidades para gestión de almacenamiento de medios
 * Versión optimizada con URLs firmadas de larga duración para evitar Error 406
 */

import { applyIntelligentCompression } from './intelligentCompression';
import { imageCache } from './imageCache';
import { supabase } from '@/integrations/supabase/client';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  fileId?: string;
  error?: string;
}

/**
 * Función para determinar si es una URL pública
 */
const isPublicUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Valida el tamaño y tipo de archivo antes de la compresión
 */
export const validateMediaFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/mov', 'video/avi'
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'El archivo es demasiado grande. Máximo 50MB.' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo de archivo no permitido.' };
  }

  return { valid: true };
};

/**
 * Aplica compresión inteligente según el tipo de archivo
 */
const compressMediaIntelligently = async (file: File, folder: string): Promise<File> => {
  if (!file.type.startsWith('image/')) {
    console.log('📹 mediaStorage: Archivo no es imagen, sin compresión:', file.type);
    return file;
  }

  try {
    console.log('🧠 mediaStorage: Aplicando compresión inteligente...');
    
    // Determinar tipo basado en carpeta
    const type = folder.includes('avatar') ? 'avatar' : 'media';
    
    // Aplicar compresión inteligente
    const compressionResult = await applyIntelligentCompression(file, type);
    
    console.log('✅ mediaStorage: Compresión inteligente completada:', {
      wasCompressed: compressionResult.wasCompressed,
      reason: compressionResult.reason,
      originalKB: compressionResult.originalSizeKB,
      finalKB: compressionResult.finalSizeKB,
      savings: compressionResult.originalSizeKB - compressionResult.finalSizeKB + 'KB'
    });

    return compressionResult.file;
  } catch (error) {
    console.error('❌ mediaStorage: Error en compresión inteligente:', error);
    throw error;
  }
};

/**
 * MÉTODOS DE SUBIDA DE MEDIOS
 */

/**
 * Sube un archivo a Backblaze B2 con compresión inteligente
 */
export const uploadMedia = async (
  file: File,
  folder: string = 'general',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    console.log('📁 mediaStorage: Iniciando subida con compresión inteligente:', {
      fileName: file.name,
      fileSizeKB: Math.round(file.size / 1024),
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

    // 2. Aplicar compresión inteligente
    console.log('🧠 mediaStorage: Aplicando compresión inteligente...');
    const optimizedFile = await compressMediaIntelligently(file, folder);
    
    const originalSizeKB = Math.round(file.size / 1024);
    const optimizedSizeKB = Math.round(optimizedFile.size / 1024);
    const savings = originalSizeKB - optimizedSizeKB;
    
    console.log('✅ mediaStorage: Archivo optimizado:', {
      originalSizeKB,
      optimizedSizeKB,
      savingsKB: savings,
      compressionRatio: savings > 0 ? Math.round((savings / originalSizeKB) * 100) + '%' : '0%'
    });

    // 3. Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = optimizedFile.name.split('.').pop();
    const fileName = `${folder}/${timestamp}_${randomStr}.${extension}`;

    console.log('📝 mediaStorage: Nombre de archivo generado:', fileName);

    // 4. Preparar FormData para la subida
    const formData = new FormData();
    formData.append('file', optimizedFile);
    formData.append('fileName', fileName);

    console.log('📤 mediaStorage: Enviando archivo optimizado a edge function...');

    if (onProgress) {
      onProgress({ loaded: 0, total: optimizedFile.size, percentage: 0 });
    }

    // 5. Subir archivo usando la edge function
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
      onProgress({ loaded: optimizedFile.size, total: optimizedFile.size, percentage: 100 });
    }

    console.log('✅ mediaStorage: Archivo subido exitosamente con optimización:', {
      fileId: uploadData.fileId,
      finalSizeKB: optimizedSizeKB,
      originalSizeKB,
      savingsKB: savings,
      costOptimized: '💰'
    });

    return {
      success: true,
      fileId: uploadData.fileId
    };

  } catch (error) {
    console.error('💥 mediaStorage: Error crítico durante la subida optimizada:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Sube avatar de usuario con compresión ultra-agresiva (100KB max)
 */
export const uploadAvatar = async (
  file: File,
  userId: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  return uploadMedia(file, `avatars/${userId}`, onProgress);
};

/**
 * Sube múltiples archivos con compresión ultra-agresiva
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
 * MÉTODOS DE OBTENCIÓN DE MEDIOS CON CACHE INTELIGENTE
 */

/**
 * Genera URL firmada temporal con tiempo extendido para evitar errores 406
 * Solo para fileIds privados, no para URLs públicas
 */
export const getSignedMediaUrl = async (
  fileId: string,
  expiresIn: number = 3900 // 65 minutos por defecto (más tiempo para evitar 406)
): Promise<string> => {
  try {
    // Si es una URL pública, devolverla directamente sin procesamiento
    if (isPublicUrl(fileId)) {
      console.log('🌐 mediaStorage: Es URL pública, devolviendo directamente:', 
        fileId.substring(0, 50) + '...');
      return fileId;
    }

    console.log('🔗 mediaStorage: Generando URL firmada con tiempo extendido:', {
      fileId: fileId.substring(0, 30) + '...',
      expiresIn,
      expirationTime: new Date(Date.now() + expiresIn * 1000).toISOString()
    });

    // Usar cache inteligente con tiempo de vida extendido
    const cachedUrl = await imageCache.get(fileId, async () => {
      console.log('📡 mediaStorage: Solicitando nueva URL firmada a edge function con tiempo extendido...');
      
      const { data, error } = await supabase.functions.invoke('b2-signed-url', {
        body: {
          fileId,
          expiresIn // Tiempo extendido para evitar expiración rápida
        }
      });

      if (error) {
        console.error('❌ mediaStorage: Error obteniendo URL firmada:', {
          error,
          fileId: fileId.substring(0, 30) + '...',
          requestedExpiry: expiresIn
        });
        throw new Error(`Error obteniendo URL firmada: ${error.message}`);
      }

      if (!data || !data.signedUrl) {
        console.error('❌ mediaStorage: Respuesta inválida de edge function:', data);
        throw new Error('Respuesta inválida del servidor');
      }

      console.log('✅ mediaStorage: Nueva URL firmada generada desde edge function:', {
        fileId: fileId.substring(0, 30) + '...',
        urlPreview: data.signedUrl.substring(0, 100) + '...',
        hasAuthParam: data.signedUrl.includes('Authorization='),
        expiresIn,
        generatedAt: data.generatedAt
      });
      
      return data.signedUrl;
    });

    console.log('✅ mediaStorage: URL firmada obtenida (con cache optimizado y tiempo extendido)');
    return cachedUrl;
  } catch (error) {
    console.error('💥 mediaStorage: Error crítico obteniendo URL firmada:', {
      fileId: fileId.substring(0, 30) + '...',
      error: error.message,
      errorType: error.constructor.name
    });
    throw error;
  }
};

/**
 * Genera URL segura para mostrar un archivo con cache optimizado
 */
export const getMediaUrl = async (
  fileId: string,
  options: {
    userId?: string;
    isPrivate?: boolean;
    expiresIn?: number;
  } = {}
): Promise<string> => {
  const { userId, isPrivate = false, expiresIn = 3600 } = options;

  try {
    // Si es una URL pública, devolverla directamente
    if (isPublicUrl(fileId)) {
      console.log('🌐 mediaStorage: Es URL pública, devolviendo directamente:', fileId);
      return fileId;
    }

    if (isPrivate && userId) {
      // Para archivos privados, usar cache inteligente
      return await imageCache.get(fileId, async () => {
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
      });
    }
    
    // Para archivos públicos, URL directa (sin cache innecesario)
    return `https://s3.us-east-005.backblazeb2.com/comicomi-media/${fileId}`;
  } catch (error) {
    console.error('Error obteniendo URL de media con cache:', error);
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
 * Elimina un archivo del almacenamiento en Backblaze B2
 */
export const deleteMedia = async (fileId: string): Promise<boolean> => {
  try {
    console.log('🗑️ mediaStorage: Iniciando eliminación de archivo:', fileId);

    // Si es una URL pública, no necesitamos eliminarla de B2
    if (isPublicUrl(fileId)) {
      console.log('🌐 mediaStorage: Es URL pública, no se puede eliminar:', fileId);
      return true;
    }

    // Usar edge function para eliminar el archivo de B2
    const { data: deleteData, error: deleteError } = await supabase.functions.invoke('b2-delete', {
      body: { fileId }
    });

    if (deleteError) {
      console.error('❌ mediaStorage: Error en edge function de eliminación:', deleteError);
      throw new Error(`Error eliminando archivo: ${deleteError.message}`);
    }

    if (!deleteData || !deleteData.success) {
      console.error('❌ mediaStorage: Respuesta de error de edge function:', deleteData);
      throw new Error(deleteData?.error || 'Error desconocido eliminando archivo');
    }

    console.log('✅ mediaStorage: Archivo eliminado exitosamente de B2:', fileId);
    
    // Limpiar del cache también (sin argumentos)
    imageCache.clear();
    
    return true;
  } catch (error) {
    console.error('💥 mediaStorage: Error crítico eliminando archivo:', error);
    return false;
  }
};

/**
 * Elimina múltiples archivos del almacenamiento
 */
export const deleteMultipleMedia = async (fileIds: string[]): Promise<{ success: string[]; failed: string[] }> => {
  const results = { success: [], failed: [] };
  
  for (const fileId of fileIds) {
    const deleted = await deleteMedia(fileId);
    if (deleted) {
      results.success.push(fileId);
    } else {
      results.failed.push(fileId);
    }
  }
  
  console.log('📊 mediaStorage: Resultados de eliminación múltiple:', {
    eliminados: results.success.length,
    fallidos: results.failed.length,
    total: fileIds.length
  });
  
  return results;
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
