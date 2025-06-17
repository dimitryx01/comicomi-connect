
import { useState } from 'react';
import { uploadMedia, uploadAvatar, UploadResult, UploadProgress } from '@/utils/mediaStorage';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      // Obtener URL de subida desde edge function
      const { data: uploadData, error: uploadError } = await supabase.functions.invoke('b2-upload', {
        body: {
          fileName: `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`,
          contentType: file.type
        }
      });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Subir archivo usando la URL firmada
      const uploadResponse = await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Authorization': uploadData.authorizationToken,
          'Content-Type': file.type,
          'X-Bz-File-Name': encodeURIComponent(uploadData.fileName),
          'X-Bz-Content-Sha1': 'unverified'
        }
      });

      if (!uploadResponse.ok) {
        throw new Error('Error subiendo archivo a B2');
      }

      const result: UploadResult = {
        success: true,
        url: uploadData.fileUrl,
        fileId: uploadData.fileName
      };
      
      toast({
        title: "¡Archivo subido!",
        description: "El archivo se ha subido correctamente"
      });
      
      return result;
    } catch (error) {
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
    return uploadFile(file, `avatars/${userId}`);
  };

  return {
    uploading,
    progress,
    uploadFile,
    uploadUserAvatar
  };
};
