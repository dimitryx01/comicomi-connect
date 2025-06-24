import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, User } from 'lucide-react';
import { ImageCropper } from './ImageCropper';
import { AvatarWithSignedUrl } from './AvatarWithSignedUrl';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useToast } from '@/hooks/use-toast';
import { compressAvatarImage } from '@/utils/advancedImageCompression';

interface AvatarUploaderProps {
  currentFileId?: string | null;
  onUploadComplete: (fileId: string) => void;
  userId?: string;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AvatarUploader = ({
  currentFileId,
  onUploadComplete,
  userId,
  fallbackText,
  size = 'xl',
  className = ''
}: AvatarUploaderProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadFile, uploading } = useMediaUpload();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Archivo inválido",
          description: "Por favor selecciona una imagen",
          variant: "destructive"
        });
        return;
      }

      // Validar tamaño (máximo 15MB antes de procesar)
      if (file.size > 15 * 1024 * 1024) {
        toast({
          title: "Archivo demasiado grande",
          description: "La imagen debe ser menor a 15MB",
          variant: "destructive"
        });
        return;
      }

      console.log('📸 AvatarUploader: Archivo seleccionado:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Crear URL para mostrar en el cropper
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setShowCropper(true);
    }

    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    try {
      setProcessing(true);
      console.log('✂️ AvatarUploader: Procesando imagen recortada...');

      // Convertir blob a File
      const croppedFile = new File([croppedBlob], 'avatar.webp', {
        type: 'image/webp',
        lastModified: Date.now()
      });

      console.log('🗜️ AvatarUploader: Aplicando compresión avanzada...');
      
      // Aplicar compresión avanzada específica para avatares
      const compressedFile = await compressAvatarImage(croppedFile);

      console.log('📤 AvatarUploader: Subiendo avatar comprimido:', {
        originalSize: croppedBlob.size,
        compressedSize: compressedFile.size,
        compressionRatio: Math.round((1 - compressedFile.size / croppedBlob.size) * 100) + '%'
      });

      // Subir archivo
      const folder = userId ? `avatars/${userId}` : 'avatars';
      const result = await uploadFile(compressedFile, folder);

      if (result.success && result.fileId) {
        onUploadComplete(result.fileId);
        toast({
          title: "¡Avatar actualizado!",
          description: "Tu foto de perfil se ha actualizado correctamente"
        });
      } else {
        throw new Error(result.error || 'Error desconocido en la subida');
      }

    } catch (error) {
      console.error('❌ AvatarUploader: Error procesando avatar:', error);
      toast({
        title: "Error al procesar imagen",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
      setShowCropper(false);
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
        setSelectedImage(null);
      }
    }
  };

  const handleCloseCropper = () => {
    setShowCropper(false);
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
      setSelectedImage(null);
    }
  };

  const isLoading = uploading || processing;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Avatar Display */}
      <div className="relative">
        <AvatarWithSignedUrl 
          fileId={currentFileId}
          fallbackText={fallbackText}
          size={size}
        />
        
        {/* Upload Button Overlay */}
        <Button
          size="sm"
          variant="outline"
          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-background border-2 border-background shadow-md hover:shadow-lg transition-shadow"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </Button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Status Text */}
      <p className="text-sm text-muted-foreground text-center">
        {isLoading && processing && 'Procesando imagen...'}
        {isLoading && uploading && 'Subiendo avatar...'}
        {!isLoading && 'Haz clic para cambiar tu foto de perfil'}
      </p>

      {/* Alternative Upload Button (Optional) */}
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Seleccionar Imagen
      </Button>

      {/* Image Cropper Dialog */}
      {selectedImage && (
        <ImageCropper
          open={showCropper}
          onOpenChange={setShowCropper}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
          aspectRatio={1}
          cropShape="round"
          title="Recortar foto de perfil"
        />
      )}
    </div>
  );
};
