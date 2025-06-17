
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { ImageCropper } from '@/components/ui/ImageCropper';
import { useToast } from '@/hooks/use-toast';
import { Image, Video, X, Upload } from 'lucide-react';

interface MediaUploadResult {
  type: 'image' | 'video';
  fileId: string;
  originalName: string;
}

interface MediaUploaderProps {
  onMediaUploaded: (media: MediaUploadResult) => void;
  onMediaRemoved: (index: number) => void;
  uploadedMedia: MediaUploadResult[];
  maxFiles?: number;
}

export const MediaUploader = ({ 
  onMediaUploaded, 
  onMediaRemoved, 
  uploadedMedia,
  maxFiles = 5 
}: MediaUploaderProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageCropperOpen, setIsImageCropperOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadFile, uploading, progress } = useMediaUpload();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📎 MediaUploader: Archivo seleccionado:', {
      name: file.name,
      size: Math.round(file.size / 1024) + 'KB',
      type: file.type
    });

    // Validar número máximo de archivos
    if (uploadedMedia.length >= maxFiles) {
      toast({
        title: "Límite alcanzado",
        description: `Solo puedes subir máximo ${maxFiles} archivos`,
        variant: "destructive"
      });
      return;
    }

    // Si es imagen, abrir el recortador
    if (file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setCurrentFile(file);
      setIsImageCropperOpen(true);
    } else if (file.type.startsWith('video/')) {
      // Para videos, subir directamente
      handleUpload(file);
    } else {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se permiten imágenes y videos",
        variant: "destructive"
      });
    }

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageCropped = async (croppedImageBlob: Blob) => {
    if (!currentFile) return;

    // Crear un nuevo archivo con la imagen recortada
    const croppedFile = new File([croppedImageBlob], currentFile.name, {
      type: 'image/webp'
    });

    console.log('✂️ MediaUploader: Imagen recortada:', {
      originalSize: Math.round(currentFile.size / 1024) + 'KB',
      croppedSize: Math.round(croppedFile.size / 1024) + 'KB'
    });

    await handleUpload(croppedFile);
    
    // Limpiar estados
    setIsImageCropperOpen(false);
    setSelectedImage(null);
    setCurrentFile(null);
  };

  const handleUpload = async (file: File) => {
    try {
      console.log('📤 MediaUploader: Iniciando subida de archivo:', file.name);
      
      const result = await uploadFile(file, 'posts');
      
      if (result.success && result.fileId) {
        const mediaResult: MediaUploadResult = {
          type: file.type.startsWith('image/') ? 'image' : 'video',
          fileId: result.fileId,
          originalName: file.name
        };
        
        console.log('✅ MediaUploader: Archivo subido exitosamente:', mediaResult);
        onMediaUploaded(mediaResult);
        
        toast({
          title: "Archivo subido",
          description: `${file.name} se ha subido correctamente`
        });
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('❌ MediaUploader: Error subiendo archivo:', error);
      toast({
        title: "Error al subir archivo",
        description: "No se pudo subir el archivo. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveMedia = (index: number) => {
    console.log('🗑️ MediaUploader: Eliminando media en índice:', index);
    onMediaRemoved(index);
  };

  return (
    <div className="space-y-4">
      {/* Input oculto para seleccionar archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Botón para agregar medios */}
      <Button 
        type="button"
        variant="outline" 
        onClick={triggerFileSelect}
        disabled={uploading || uploadedMedia.length >= maxFiles}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploading ? 'Subiendo...' : 'Agregar foto o video'}
      </Button>

      {/* Progreso de subida */}
      {uploading && progress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subiendo archivo...</span>
            <span>{progress.percentage}%</span>
          </div>
          <Progress value={progress.percentage} className="w-full" />
        </div>
      )}

      {/* Lista de medios subidos */}
      {uploadedMedia.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Archivos subidos ({uploadedMedia.length}/{maxFiles}):</p>
          <div className="space-y-2">
            {uploadedMedia.map((media, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded-md"
              >
                <div className="flex items-center space-x-2">
                  {media.type === 'image' ? (
                    <Image className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Video className="h-4 w-4 text-purple-500" />
                  )}
                  <span className="text-sm truncate max-w-[200px]">
                    {media.originalName}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMedia(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recortador de imágenes */}
      {selectedImage && (
        <ImageCropper
          open={isImageCropperOpen}
          onOpenChange={setIsImageCropperOpen}
          imageSrc={selectedImage}
          onCropComplete={handleImageCropped}
          aspectRatio={4/3}
          cropShape="rect"
          title="Recortar imagen para post"
        />
      )}
    </div>
  );
};
