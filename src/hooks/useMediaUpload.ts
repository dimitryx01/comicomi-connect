
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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

    setUploading(true);
    setProgress(null);
    
    try {
      // Validar archivo antes de subirlo
      if (!file) {
        throw new Error('No se ha seleccionado ningún archivo');
      }

      // Validar tamaño (máximo 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande. Máximo 50MB.');
      }

      // Validar tipo de archivo
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/webm', 'video/mov', 'video/avi'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPG, PNG, WebP, GIF) y videos (MP4, WebM, MOV, AVI).');
      }

      console.log('✅ useMediaUpload: Archivo validado correctamente');

      // Usar la función uploadMedia que maneja toda la lógica
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
    return uploadFile(file, `avatars/${userId}`);
  };

  return {
    uploading,
    progress,
    uploadFile,
    uploadUserAvatar
  };
};
