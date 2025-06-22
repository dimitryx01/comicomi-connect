
/**
 * Hook optimizado para subidas con batch processing y deduplicación
 * Reemplaza useMediaUpload con funcionalidades mejoradas
 */

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  batchUploadFiles, 
  uploadSingleFileOptimized, 
  BatchUploadFile, 
  BatchUploadResult, 
  BatchUploadProgress 
} from '@/utils/batchUpload';
import { UploadResult, UploadProgress } from '@/utils/mediaStorage';

interface UseOptimizedUploadReturn {
  uploading: boolean;
  progress: BatchUploadProgress | UploadProgress | null;
  uploadFile: (file: File, folder?: string, type?: 'avatar' | 'media') => Promise<UploadResult>;
  uploadMultipleFiles: (files: BatchUploadFile[]) => Promise<BatchUploadResult>;
  uploadUserAvatar: (file: File, userId: string) => Promise<UploadResult>;
}

export const useOptimizedUpload = (): UseOptimizedUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<BatchUploadProgress | UploadProgress | null>(null);
  const { toast } = useToast();

  const uploadFile = async (
    file: File, 
    folder: string = 'general',
    type: 'avatar' | 'media' = 'media'
  ): Promise<UploadResult> => {
    console.log('📤 useOptimizedUpload: Subida individual con compresión obligatoria:', {
      fileName: file.name,
      fileSize: Math.round(file.size / 1024) + 'KB',
      fileSizeMB: Math.round((file.size / (1024 * 1024)) * 100) / 100 + 'MB',
      folder,
      type
    });

    setUploading(true);
    setProgress(null);
    
    try {
      const result = await uploadSingleFileOptimized(
        file, 
        folder, 
        type,
        (uploadProgress) => {
          console.log('📊 useOptimizedUpload: Progreso:', uploadProgress);
          setProgress(uploadProgress);
        }
      );

      if (result.success) {
        toast({
          title: "¡Archivo subido!",
          description: "El archivo se ha comprimido y subido correctamente"
        });
      } else {
        // Categorizar errores para mostrar mensajes más específicos
        const errorMessage = result.error || 'Error desconocido durante la subida';
        let userFriendlyTitle = "Error al subir archivo";
        let userFriendlyDescription = errorMessage;
        
        if (errorMessage.includes('9MB')) {
          userFriendlyTitle = "Archivo muy grande";
          userFriendlyDescription = "El archivo supera los 9MB permitidos. Reduce el tamaño del archivo original.";
        } else if (errorMessage.includes('no se pudo comprimir')) {
          userFriendlyTitle = "No se pudo comprimir";
          userFriendlyDescription = "La imagen contiene demasiada información para comprimir efectivamente. Usa una imagen más simple.";
        } else if (errorMessage.includes('formato') || errorMessage.includes('no soportado')) {
          userFriendlyTitle = "Formato no soportado";
          userFriendlyDescription = "Usa archivos JPG, PNG, WebP o GIF para mejores resultados.";
        } else if (errorMessage.includes('no es una imagen')) {
          userFriendlyTitle = "Solo imágenes";
          userFriendlyDescription = "Solo se pueden procesar archivos de imagen para esta operación.";
        }
        
        console.error('❌ useOptimizedUpload: Error en subida individual:', {
          originalError: errorMessage,
          userMessage: userFriendlyDescription
        });
        
        toast({
          title: userFriendlyTitle,
          description: userFriendlyDescription,
          variant: "destructive"
        });
        
        throw new Error(errorMessage);
      }
      
      return result;
    } catch (error) {
      console.error('❌ useOptimizedUpload: Error crítico en subida individual:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Si no se mostró ya un toast de error más específico, mostrar uno genérico
      if (!errorMessage.includes('9MB') && 
          !errorMessage.includes('no se pudo comprimir') && 
          !errorMessage.includes('formato') &&
          !errorMessage.includes('no es una imagen')) {
        toast({
          title: "Error al subir archivo",
          description: "Hubo un problema inesperado. Intenta de nuevo.",
          variant: "destructive"
        });
      }
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const uploadMultipleFiles = async (files: BatchUploadFile[]): Promise<BatchUploadResult> => {
    console.log('📦 useOptimizedUpload: Batch upload con compresión obligatoria:', {
      totalFiles: files.length,
      types: files.map(f => f.type),
      totalSizeMB: Math.round((files.reduce((sum, f) => sum + f.file.size, 0) / (1024 * 1024)) * 100) / 100
    });

    setUploading(true);
    setProgress(null);
    
    try {
      const result = await batchUploadFiles(files, (batchProgress) => {
        console.log('📊 useOptimizedUpload: Progreso batch:', batchProgress);
        setProgress(batchProgress);
      });

      // Analizar resultados para mostrar mensajes apropiados
      const failedFiles = result.results.filter(r => !r.success);
      const has9MBErrors = failedFiles.some(f => 
        f.error?.includes('9MB')
      );
      const hasCompressionErrors = failedFiles.some(f => 
        f.error?.includes('no se pudo comprimir')
      );
      
      // Mostrar resultado del batch
      if (result.success) {
        let message = `${result.successfulUploads} archivos procesados y subidos correctamente`;
        
        if (result.skippedFiles > 0) {
          message += `, ${result.skippedFiles} omitidos por duplicados`;
        }
        
        if (failedFiles.length > 0) {
          message += `, ${failedFiles.length} fallaron`;
        }
          
        toast({
          title: "¡Batch upload completado!",
          description: `${message}. Transacciones ahorradas: ${result.transactionsSaved}`,
          variant: failedFiles.length > 0 ? "destructive" : "default"
        });
      } else {
        let errorTitle = "Batch upload con errores";
        let errorDescription = `${result.successfulUploads}/${result.totalFiles} archivos procesados correctamente`;
        
        if (has9MBErrors) {
          errorTitle = "Algunos archivos son muy grandes";
          errorDescription += ". Algunos archivos superan los 9MB permitidos.";
        } else if (hasCompressionErrors) {
          errorTitle = "Algunas imágenes no se pudieron comprimir";
          errorDescription += ". Algunas imágenes contienen demasiada información para comprimir efectivamente.";
        }
        
        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ useOptimizedUpload: Error crítico en batch upload:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      toast({
        title: "Error en batch upload",
        description: "Hubo un problema procesando los archivos. Revisa los logs para más detalles.",
        variant: "destructive"
      });
      
      return {
        success: false,
        results: [],
        totalFiles: files.length,
        successfulUploads: 0,
        skippedFiles: 0,
        transactionsSaved: 0
      };
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const uploadUserAvatar = async (file: File, userId: string): Promise<UploadResult> => {
    console.log('👤 useOptimizedUpload: Subida de avatar con compresión obligatoria para usuario:', userId);
    return uploadFile(file, `avatars/${userId}`, 'avatar');
  };

  return {
    uploading,
    progress,
    uploadFile,
    uploadMultipleFiles,
    uploadUserAvatar
  };
};
