
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
    console.log('📤 useOptimizedUpload: Subida individual optimizada:', {
      fileName: file.name,
      fileSize: Math.round(file.size / 1024) + 'KB',
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
          description: "El archivo se ha optimizado y subido correctamente"
        });
      } else {
        throw new Error(result.error || 'Error desconocido durante la subida');
      }
      
      return result;
    } catch (error) {
      console.error('❌ useOptimizedUpload: Error en subida individual:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      toast({
        title: "Error al subir archivo",
        description: errorMessage,
        variant: "destructive"
      });
      
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
    console.log('📦 useOptimizedUpload: Batch upload iniciado:', {
      totalFiles: files.length,
      types: files.map(f => f.type)
    });

    setUploading(true);
    setProgress(null);
    
    try {
      const result = await batchUploadFiles(files, (batchProgress) => {
        console.log('📊 useOptimizedUpload: Progreso batch:', batchProgress);
        setProgress(batchProgress);
      });

      // Mostrar resultado del batch
      if (result.success) {
        const message = result.skippedFiles > 0 
          ? `${result.successfulUploads} archivos subidos, ${result.skippedFiles} omitidos por duplicados`
          : `${result.successfulUploads} archivos subidos correctamente`;
          
        toast({
          title: "¡Batch upload completado!",
          description: `${message}. Transacciones ahorradas: ${result.transactionsSaved}`
        });
      } else {
        toast({
          title: "Batch upload con errores",
          description: `${result.successfulUploads}/${result.totalFiles} archivos subidos correctamente`,
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ useOptimizedUpload: Error en batch upload:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      toast({
        title: "Error en batch upload",
        description: errorMessage,
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
    console.log('👤 useOptimizedUpload: Subida de avatar optimizada para usuario:', userId);
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
