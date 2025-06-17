
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ImageCropper } from '@/components/ui/ImageCropper';
import { useToast } from '@/hooks/use-toast';
import { Image, Video, X, Upload } from 'lucide-react';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video';
  originalName: string;
  preview?: string;
}

interface MediaUploaderProps {
  onMediaAdded: (media: MediaFile) => void;
  onMediaRemoved: (id: string) => void;
  selectedMedia: MediaFile[];
  maxFiles?: number;
  uploading?: boolean;
}

export const MediaUploader = ({ 
  onMediaAdded, 
  onMediaRemoved, 
  selectedMedia,
  maxFiles = 5,
  uploading = false
}: MediaUploaderProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageCropperOpen, setIsImageCropperOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();

  const generateId = () => Date.now().toString() + Math.random().toString(36).substring(7);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📎 MediaUploader: Archivo seleccionado (no subido aún):', {
      name: file.name,
      size: Math.round(file.size / 1024) + 'KB',
      type: file.type
    });

    // Validar número máximo de archivos
    if (selectedMedia.length >= maxFiles) {
      toast({
        title: "Límite alcanzado",
        description: `Solo puedes agregar máximo ${maxFiles} archivos`,
        variant: "destructive"
      });
      return;
    }

    // Validar tamaño (máximo 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Archivo muy grande",
        description: "El archivo no puede superar los 50MB",
        variant: "destructive"
      });
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/mov', 'video/avi'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se permiten imágenes (JPG, PNG, WebP, GIF) y videos (MP4, WebM, MOV, AVI)",
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
      // Para videos, agregar directamente sin subir
      handleMediaAdded(file);
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

    console.log('✂️ MediaUploader: Imagen recortada (preparada para subir):', {
      originalSize: Math.round(currentFile.size / 1024) + 'KB',
      croppedSize: Math.round(croppedFile.size / 1024) + 'KB'
    });

    handleMediaAdded(croppedFile);
    
    // Limpiar estados
    setIsImageCropperOpen(false);
    setSelectedImage(null);
    setCurrentFile(null);
  };

  const handleMediaAdded = (file: File) => {
    const mediaFile: MediaFile = {
      id: generateId(),
      file,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      originalName: file.name,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    };
    
    console.log('📂 MediaUploader: Archivo agregado a la lista (pendiente de subir):', mediaFile.originalName);
    onMediaAdded(mediaFile);
    
    toast({
      title: "Archivo agregado",
      description: `${file.name} está listo para subir`
    });
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveMedia = (id: string) => {
    const mediaFile = selectedMedia.find(m => m.id === id);
    if (mediaFile?.preview) {
      URL.revokeObjectURL(mediaFile.preview);
    }
    console.log('🗑️ MediaUploader: Archivo eliminado de la lista:', id);
    onMediaRemoved(id);
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
        disabled={uploading || selectedMedia.length >= maxFiles}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploading ? 'Subiendo archivos...' : 'Agregar foto o video'}
      </Button>

      {/* Lista de medios seleccionados */}
      {selectedMedia.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Archivos seleccionados ({selectedMedia.length}/{maxFiles})
            {!uploading && <span className="text-muted-foreground"> - Se subirán al publicar</span>}
          </p>
          <div className="space-y-2">
            {selectedMedia.map((media) => (
              <div 
                key={media.id}
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
                  <span className="text-xs text-muted-foreground">
                    ({Math.round(media.file.size / 1024)} KB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMedia(media.id)}
                  disabled={uploading}
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
