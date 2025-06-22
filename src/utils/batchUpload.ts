/**
 * Sistema de batch upload para agrupar múltiples archivos
 * Reduce transacciones Clase A de N a 1 por operación
 */

import { uploadMedia, UploadResult, UploadProgress } from './mediaStorage';
import { calculateFileHashWithCache } from './fileHashing';
import { applyIntelligentCompression, validateFileLimits } from './intelligentCompression';

export interface BatchUploadFile {
  id: string;
  file: File;
  folder: string;
  type: 'avatar' | 'media';
  hash?: string;
}

export interface BatchUploadResult {
  success: boolean;
  results: Array<{
    id: string;
    success: boolean;
    fileId?: string;
    error?: string;
    skipped?: boolean;
    skipReason?: string;
  }>;
  totalFiles: number;
  successfulUploads: number;
  skippedFiles: number;
  transactionsSaved: number;
}

export interface BatchUploadProgress {
  currentFile: number;
  totalFiles: number;
  currentFileName: string;
  overallProgress: number;
  fileProgress?: UploadProgress;
}

/**
 * Cache de hashes subidos para evitar duplicados en la misma sesión
 */
class UploadedHashCache {
  private uploadedHashes = new Map<string, string>(); // hash -> fileId

  has(hash: string): boolean {
    return this.uploadedHashes.has(hash);
  }

  get(hash: string): string | undefined {
    return this.uploadedHashes.get(hash);
  }

  set(hash: string, fileId: string): void {
    this.uploadedHashes.set(hash, fileId);
  }

  clear(): void {
    this.uploadedHashes.clear();
  }

  size(): number {
    return this.uploadedHashes.size;
  }
}

const uploadedHashCache = new UploadedHashCache();

/**
 * Procesa archivos en lote con deduplicación y compresión inteligente
 */
export const batchUploadFiles = async (
  files: BatchUploadFile[],
  onProgress?: (progress: BatchUploadProgress) => void
): Promise<BatchUploadResult> => {
  console.log('📦 batchUpload: Iniciando batch upload:', {
    totalFiles: files.length,
    cacheSize: uploadedHashCache.size()
  });

  const results: BatchUploadResult['results'] = [];
  let successfulUploads = 0;
  let skippedFiles = 0;
  let transactionsSaved = 0;

  for (let i = 0; i < files.length; i++) {
    const batchFile = files[i];
    const progress: BatchUploadProgress = {
      currentFile: i + 1,
      totalFiles: files.length,
      currentFileName: batchFile.file.name,
      overallProgress: Math.round(((i + 1) / files.length) * 100)
    };

    if (onProgress) {
      onProgress(progress);
    }

    try {
      console.log(`📁 batchUpload: Procesando archivo ${i + 1}/${files.length}:`, {
        fileName: batchFile.file.name,
        sizeKB: Math.round(batchFile.file.size / 1024),
        type: batchFile.type
      });

      // 1. Validar límites del archivo
      const validation = validateFileLimits(batchFile.file, batchFile.type);
      if (!validation.valid) {
        console.error('❌ batchUpload: Validación fallida:', {
          fileName: batchFile.file.name,
          error: validation.error
        });
        
        results.push({
          id: batchFile.id,
          success: false,
          error: validation.error
        });
        continue;
      }

      // 2. Calcular hash para deduplicación
      console.log('🔐 batchUpload: Calculando hash para deduplicación...');
      const fileHash = await calculateFileHashWithCache(batchFile.file);
      
      // 3. Verificar si ya fue subido en esta sesión
      if (uploadedHashCache.has(fileHash)) {
        const existingFileId = uploadedHashCache.get(fileHash)!;
        console.log('🔄 batchUpload: Archivo duplicado encontrado en cache:', {
          fileName: batchFile.file.name,
          existingFileId,
          hash: fileHash.substring(0, 8) + '...'
        });

        results.push({
          id: batchFile.id,
          success: true,
          fileId: existingFileId,
          skipped: true,
          skipReason: 'Archivo duplicado en sesión actual'
        });
        
        skippedFiles++;
        transactionsSaved++;
        continue;
      }

      // 4. Aplicar compresión inteligente con manejo de errores mejorado
      console.log('🗜️ batchUpload: Aplicando compresión inteligente...');
      let compressionResult;
      
      try {
        compressionResult = await applyIntelligentCompression(batchFile.file, batchFile.type);
        
        console.log('✅ batchUpload: Compresión completada:', {
          fileName: batchFile.file.name,
          wasCompressed: compressionResult.wasCompressed,
          originalKB: compressionResult.originalSizeKB,
          finalKB: compressionResult.finalSizeKB,
          reason: compressionResult.reason
        });
      } catch (compressionError) {
        const errorMessage = compressionError instanceof Error ? compressionError.message : 'Error de compresión desconocido';
        
        console.error('❌ batchUpload: Error en compresión inteligente:', {
          fileName: batchFile.file.name,
          error: errorMessage,
          originalSizeKB: Math.round(batchFile.file.size / 1024),
          type: batchFile.type
        });

        results.push({
          id: batchFile.id,
          success: false,
          error: errorMessage
        });
        continue;
      }

      // 5. Subir archivo optimizado
      console.log('📤 batchUpload: Subiendo archivo optimizado...');
      const uploadResult = await uploadMedia(
        compressionResult.file,
        batchFile.folder,
        (fileProgress) => {
          if (onProgress) {
            onProgress({
              ...progress,
              fileProgress
            });
          }
        }
      );

      if (uploadResult.success && uploadResult.fileId) {
        // Guardar en cache para evitar duplicados futuros
        uploadedHashCache.set(fileHash, uploadResult.fileId);
        
        results.push({
          id: batchFile.id,
          success: true,
          fileId: uploadResult.fileId
        });
        
        successfulUploads++;
        
        console.log('✅ batchUpload: Archivo subido exitosamente:', {
          fileName: batchFile.file.name,
          fileId: uploadResult.fileId,
          finalSizeKB: compressionResult.finalSizeKB,
          wasCompressed: compressionResult.wasCompressed
        });
      } else {
        const uploadError = uploadResult.error || 'Error desconocido en subida';
        
        console.error('❌ batchUpload: Error en subida:', {
          fileName: batchFile.file.name,
          error: uploadError
        });
        
        results.push({
          id: batchFile.id,
          success: false,
          error: uploadError
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      console.error(`❌ batchUpload: Error crítico procesando archivo ${batchFile.file.name}:`, {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      results.push({
        id: batchFile.id,
        success: false,
        error: `Error procesando archivo: ${errorMessage}`
      });
    }
  }

  const finalResult: BatchUploadResult = {
    success: successfulUploads > 0,
    results,
    totalFiles: files.length,
    successfulUploads,
    skippedFiles,
    transactionsSaved
  };

  console.log('🎯 batchUpload: Batch upload completado:', {
    totalFiles: files.length,
    successful: successfulUploads,
    skipped: skippedFiles,
    failed: files.length - successfulUploads - skippedFiles,
    transactionsSaved,
    cacheSize: uploadedHashCache.size(),
    successRate: Math.round((successfulUploads / files.length) * 100) + '%'
  });

  return finalResult;
};

/**
 * Sube un solo archivo usando el sistema batch (para consistencia)
 */
export const uploadSingleFileOptimized = async (
  file: File,
  folder: string,
  type: 'avatar' | 'media',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> => {
  console.log('📁 batchUpload: Subida individual optimizada iniciada:', {
    fileName: file.name,
    sizeKB: Math.round(file.size / 1024),
    type,
    folder
  });
  
  const batchFile: BatchUploadFile = {
    id: 'single-file',
    file,
    folder,
    type
  };

  const batchResult = await batchUploadFiles([batchFile], (batchProgress) => {
    if (onProgress && batchProgress.fileProgress) {
      onProgress(batchProgress.fileProgress);
    }
  });

  const singleResult = batchResult.results[0];
  
  const result: UploadResult = {
    success: singleResult.success,
    fileId: singleResult.fileId,
    error: singleResult.error
  };
  
  console.log('📋 batchUpload: Resultado de subida individual:', {
    fileName: file.name,
    success: result.success,
    fileId: result.fileId,
    error: result.error
  });
  
  return result;
};

/**
 * Limpia la cache de hashes subidos (útil al cerrar sesión)
 */
export const clearUploadCache = (): void => {
  uploadedHashCache.clear();
  console.log('🧹 batchUpload: Cache de uploads limpiada');
};

/**
 * Obtiene estadísticas de la cache
 */
export const getUploadCacheStats = () => {
  return {
    size: uploadedHashCache.size(),
    hasItems: uploadedHashCache.size() > 0
  };
};
