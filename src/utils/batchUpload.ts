
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
      console.log(`📁 batchUpload: Procesando archivo ${i + 1}/${files.length}:`, batchFile.file.name);

      // 1. Validar límites del archivo
      const validation = validateFileLimits(batchFile.file, batchFile.type);
      if (!validation.valid) {
        results.push({
          id: batchFile.id,
          success: false,
          error: validation.error
        });
        continue;
      }

      // 2. Calcular hash para deduplicación
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

      // 4. Aplicar compresión inteligente
      const compressionResult = await applyIntelligentCompression(batchFile.file, batchFile.type);
      
      console.log('🗜️ batchUpload: Resultado de compresión:', {
        fileName: batchFile.file.name,
        wasCompressed: compressionResult.wasCompressed,
        originalKB: compressionResult.originalSizeKB,
        finalKB: compressionResult.finalSizeKB,
        savedKB: compressionResult.originalSizeKB - compressionResult.finalSizeKB
      });

      // 5. Subir archivo optimizado
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
          finalSizeKB: compressionResult.finalSizeKB
        });
      } else {
        results.push({
          id: batchFile.id,
          success: false,
          error: uploadResult.error || 'Error desconocido en subida'
        });
      }

    } catch (error) {
      console.error(`❌ batchUpload: Error procesando archivo ${batchFile.file.name}:`, error);
      
      results.push({
        id: batchFile.id,
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
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
    cacheSize: uploadedHashCache.size()
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
  
  return {
    success: singleResult.success,
    fileId: singleResult.fileId,
    error: singleResult.error
  };
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
