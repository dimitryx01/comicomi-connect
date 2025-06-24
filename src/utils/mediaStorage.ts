/**
 * Utilidades para gestión de almacenamiento de medios - Versión optimizada para B2
 */

import { applyIntelligentCompression } from './intelligentCompression';
import { imageCache } from './imageCache';
import { supabase } from '@/integrations/supabase/client';
import { b2TransactionMonitor } from './B2TransactionMonitor';
import { optimizedB2Cache } from './OptimizedB2Cache';

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
  const maxSize = 15 * 1024 * 1024; // 15MB
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/mov', 'video/avi'
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'El archivo es demasiado grande. Máximo 15MB.' };
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
 * Sube un archivo a Backblaze B2 con compresión inteligente
 */
export const uploadMedia = async (
  file: File,
  folder: string = 'general',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  try {
    console.log('📁 mediaStorage: Iniciando subida con compresión:', {
      fileName: file.name,
      fileSizeKB: Math.round(file.size / 1024),
      fileType: file.type,
      folder
    });

    // Registrar transacción de subida
    b2TransactionMonitor.logTransactionB('mediaStorage', 'upload', file.name, 'file_upload');

    // 1. Validar archivo
    const validation = validateMediaFile(file);
    if (!validation.valid) {
      console.error('❌ mediaStorage: Validación fallida:', validation.error);
      return { success: false, error: validation.error };
    }

    // 2. Aplicar compresión inteligente
    const optimizedFile = await compressMediaIntelligently(file, folder);
    
    const originalSizeKB = Math.round(file.size / 1024);
    const optimizedSizeKB = Math.round(optimizedFile.size / 1024);
    const savings = originalSizeKB - optimizedSizeKB;
    
    console.log('✅ mediaStorage: Archivo optimizado:', {
      originalSizeKB,
      optimizedSizeKB,
      savingsKB: savings
    });

    // 3. Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const extension = optimizedFile.name.split('.').pop();
    const fileName = `${folder}/${timestamp}_${randomStr}.${extension}`;

    // 4. Preparar FormData para la subida
    const formData = new FormData();
    formData.append('file', optimizedFile);
    formData.append('fileName', fileName);

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

    console.log('✅ mediaStorage: Archivo subido exitosamente:', {
      fileId: uploadData.fileId,
      finalSizeKB: optimizedSizeKB
    });

    return {
      success: true,
      fileId: uploadData.fileId
    };

  } catch (error) {
    console.error('💥 mediaStorage: Error durante la subida:', error);
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
  b2TransactionMonitor.logTransactionB('mediaStorage', 'upload_avatar', `${userId}/${file.name}`, 'avatar_upload');
  return uploadMedia(file, `avatars/${userId}`, onProgress);
};

/**
 * Sube múltiples archivos
 */
export const uploadMultipleMedia = async (
  files: File[],
  folder: string = 'posts',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];
  
  b2TransactionMonitor.logTransactionB('mediaStorage', 'upload_multiple', `${files.length}_files`, 'batch_upload');
  
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
 * Genera URL firmada con cache optimizado
 */
export const getSignedMediaUrl = async (
  fileId: string,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    // Si es una URL pública, devolverla directamente
    if (isPublicUrl(fileId)) {
      console.log('🌐 mediaStorage: Es URL pública:', fileId.substring(0, 50) + '...');
      return fileId;
    }

    console.log('🔗 mediaStorage: Generando URL firmada con cache optimizado:', fileId.substring(0, 30) + '...');

    // Usar cache optimizado para evitar transacciones redundantes
    const cacheKey = `signed_url_${fileId}_${expiresIn}`;
    
    const cachedUrl = await optimizedB2Cache.get(cacheKey, async () => {
      // Registrar transacción B2 solo cuando no hay cache
      b2TransactionMonitor.logTransactionB('mediaStorage', 'signed_url', fileId, 'cache_miss');
      
      const { data, error } = await supabase.functions.invoke('b2-signed-url', {
        body: { fileId, expiresIn }
      });

      if (error) {
        console.error('❌ mediaStorage: Error obteniendo URL:', error);
        throw new Error(`Error obteniendo URL: ${error.message}`);
      }

      if (!data || !data.signedUrl) {
        throw new Error('Respuesta inválida del servidor');
      }

      console.log('✅ mediaStorage: URL firmada obtenida');
      return data.signedUrl;
    }, {
      component: 'mediaStorage',
      ttl: Math.min(expiresIn * 1000, 30 * 60 * 1000), // TTL no mayor a 30 min
      priority: 'high'
    });

    return cachedUrl;
  } catch (error) {
    console.error('💥 mediaStorage: Error obteniendo URL:', error);
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
    component?: string;
  } = {}
): Promise<string> => {
  const { userId, isPrivate = false, expiresIn = 3600, component = 'unknown' } = options;

  try {
    // Si es una URL pública, devolverla directamente
    if (isPublicUrl(fileId)) {
      return fileId;
    }

    if (isPrivate && userId) {
      const cacheKey = `private_url_${fileId}_${userId}_${expiresIn}`;
      
      return await optimizedB2Cache.get(cacheKey, async () => {
        b2TransactionMonitor.logTransactionB(component, 'private_signed_url', fileId, 'private_url_request');
        
        const { data, error } = await supabase.functions.invoke('b2-signed-url', {
          body: { fileId, userId, expiresIn }
        });

        if (error) {
          throw new Error('Error obteniendo URL firmada');
        }

        return data.signedUrl;
      }, {
        component,
        ttl: Math.min(expiresIn * 1000, 30 * 60 * 1000),
        priority: 'medium'
      });
    }
    
    // Para archivos públicos, URL directa sin transacciones
    return `https://s3.us-east-005.backblazeb2.com/comicomi-media/${fileId}`;
  } catch (error) {
    console.error('Error obteniendo URL de media:', error);
    // Fallback a URL directa
    return `https://s3.us-east-005.backblazeb2.com/comicomi-media/${fileId}`;
  }
};

/**
 * Elimina un archivo del almacenamiento
 */
export const deleteMedia = async (fileId: string): Promise<boolean> => {
  try {
    console.log('🗑️ mediaStorage: Eliminando archivo:', fileId);

    if (isPublicUrl(fileId)) {
      console.log('🌐 mediaStorage: Es URL pública, no se puede eliminar:', fileId);
      return true;
    }

    // Registrar transacción de eliminación
    b2TransactionMonitor.logTransactionB('mediaStorage', 'delete', fileId, 'file_deletion');

    const { data: deleteData, error: deleteError } = await supabase.functions.invoke('b2-delete', {
      body: { fileId }
    });

    if (deleteError) {
      console.error('❌ mediaStorage: Error eliminando:', deleteError);
      throw new Error(`Error eliminando archivo: ${deleteError.message}`);
    }

    if (!deleteData || !deleteData.success) {
      throw new Error(deleteData?.error || 'Error desconocido eliminando archivo');
    }

    console.log('✅ mediaStorage: Archivo eliminado exitosamente');
    
    // Invalidar cache para este archivo
    optimizedB2Cache.invalidate(fileId);
    imageCache.clear();
    
    return true;
  } catch (error) {
    console.error('💥 mediaStorage: Error eliminando archivo:', error);
    return false;
  }
};

/**
 * Elimina múltiples archivos
 */
export const deleteMultipleMedia = async (fileIds: string[]): Promise<{ success: string[]; failed: string[] }> => {
  const results = { success: [], failed: [] };
  
  b2TransactionMonitor.logTransactionB('mediaStorage', 'delete_multiple', `${fileIds.length}_files`, 'batch_deletion');
  
  for (const fileId of fileIds) {
    const deleted = await deleteMedia(fileId);
    if (deleted) {
      results.success.push(fileId);
    } else {
      results.failed.push(fileId);
    }
  }
  
  return results;
};
