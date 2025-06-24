
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { uploadMedia, UploadResult, UploadProgress } from '@/utils/mediaStorage';
import { b2TransactionMonitor } from '@/utils/B2TransactionMonitor';

interface UseMediaUploadReturn {
  uploading: boolean;
  progress: UploadProgress | null;
  uploadFile: (file: File, folder?: string) => Promise<UploadResult>;
  uploadUserAvatar: (file: File, userId: string) => Promise<UploadResult>;
}

export const useMediaUpload = (): UseMediaUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File, folder: string = 'general'): Promise<UploadResult> => {
    console.log('⚠️ useMediaUpload: DEPRECATED - Usa useOptimizedUpload para mejor rendimiento');
    console.log('📁 useMediaUpload: Iniciando subida de archivo:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      folder
    });

    // Registrar el uso del hook deprecado
    b2TransactionMonitor.logTransactionB('useMediaUpload', 'deprecated_upload', file.name, 'deprecated_hook_usage');

    setUploading(true);
    setProgress(null);
    
    try {
      // Validar archivo antes de subirlo
      if (!file) {
        throw new Error('No se ha seleccionado ningún archivo');
      }

      // Validar tamaño (máximo 15MB)
      const maxSize = 15 * 1024 * 1024; // 15MB
      if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande. Máximo 15MB.');
      }

      // Validar tipo de archivo (incluir HEIC/HEIF)
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
        'image/heic', 'image/heif',
        'video/mp4', 'video/webm', 'video/mov', 'video/avi'
      ];
      
      const fileName = file.name.toLowerCase();
      const hasValidExtension = fileName.endsWith('.heic') || fileName.endsWith('.heif') || 
                               allowedTypes.some(type => {
                                 const ext = type.split('/')[1];
                                 return fileName.endsWith(`.${ext}`);
                               });
      
      if (!allowedTypes.includes(file.type) && !hasValidExtension) {
        throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, WebP, GIF, HEIC) y videos (MP4, WebM, MOV, AVI).');
      }

      console.log('✅ useMediaUpload: Archivo validado correctamente');

      // Usar la función uploadMedia que maneja toda la lógica optimizada
      const result = await uploadMedia(file, folder, (uploadProgress) => {
        console.log('📊 useMediaUpload: Progreso de subida:', uploadProgress);
        setProgress(uploadProgress);
      });

      console.log('📤 useMediaUpload: Resultado de subida:', result);

      if (result.success) {
        toast({
          title: "¡Archivo subido!",
          description: "El archivo se ha subido correctamente a Backblaze B2"
        });
      } else {
        throw new Error(result.error || 'Error desconocido durante la subida');
      }
      
      return result;
    } catch (error) {
      console.error('❌ useMediaUpload: Error durante la subida:', error);
      
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

  const uploadUserAvatar = async (file: File, userId: string): Promise<UploadResult> => {
    console.log('👤 useMediaUpload: Iniciando subida de avatar para usuario:', userId);
    b2TransactionMonitor.logTransactionB('useMediaUpload', 'avatar_upload', `${userId}/${file.name}`, 'avatar_upload_deprecated');
    return uploadFile(file, `avatars/${userId}`);
  };

  return {
    uploading,
    progress,
    uploadFile,
    uploadUserAvatar
  };
};
