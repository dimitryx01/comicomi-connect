
import { useState } from 'react';
import { uploadMedia, uploadAvatar, UploadResult, UploadProgress } from '@/utils/mediaStorage';
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
    setUploading(true);
    setProgress(null);
    
    try {
      const result = await uploadMedia(file, folder, (progress) => {
        setProgress(progress);
      });
      
      if (result.success) {
        toast({
          title: "¡Archivo subido!",
          description: "El archivo se ha subido correctamente"
        });
      } else {
        toast({
          title: "Error al subir archivo",
          description: result.error || "Error desconocido",
          variant: "destructive"
        });
      }
      
      return result;
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const uploadUserAvatar = async (file: File, userId: string): Promise<UploadResult> => {
    setUploading(true);
    setProgress(null);
    
    try {
      const result = await uploadAvatar(file, userId, (progress) => {
        setProgress(progress);
      });
      
      if (result.success) {
        toast({
          title: "¡Avatar actualizado!",
          description: "Tu foto de perfil se ha actualizado correctamente"
        });
      } else {
        toast({
          title: "Error al actualizar avatar",
          description: result.error || "Error desconocido",
          variant: "destructive"
        });
      }
      
      return result;
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  return {
    uploading,
    progress,
    uploadFile,
    uploadUserAvatar
  };
};
