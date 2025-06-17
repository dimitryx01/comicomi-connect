
import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Crop, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

interface ImageCropperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  aspectRatio?: number;
  cropShape?: 'rect' | 'round';
  title?: string;
}

/**
 * Utility function to create cropped image
 */
const createCroppedImage = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }

      const rotRad = (rotation * Math.PI) / 180;

      // Calculate bounding box of the rotated image
      const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
      );

      // Set canvas size to match the bounding box
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      // Move the crop origin to the canvas origin (0,0)
      ctx.translate(-pixelCrop.x, -pixelCrop.y);

      // Move the origin to the center of the original position
      ctx.translate(bBoxWidth / 2, bBoxHeight / 2);

      // Rotate the canvas around the origin
      ctx.rotate(rotRad);

      // Scale the canvas (flip)
      ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);

      // Draw the image
      ctx.drawImage(image, -image.width / 2, -image.height / 2);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas to blob conversion failed'));
        }
      }, 'image/webp', 0.9);
    });

    image.addEventListener('error', reject);
    image.src = imageSrc;
  });
};

const rotateSize = (width: number, height: number, rotation: number) => {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

export const ImageCropper = ({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
  cropShape = 'round',
  title = 'Recortar imagen'
}: ImageCropperProps) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);

  const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels) return;

    try {
      setLoading(true);
      console.log('🖼️ ImageCropper: Creando imagen recortada...');
      
      const croppedImage = await createCroppedImage(
        imageSrc,
        croppedAreaPixels,
        rotation
      );

      console.log('✅ ImageCropper: Imagen recortada creada:', {
        size: croppedImage.size,
        type: croppedImage.type
      });

      onCropComplete(croppedImage);
      onOpenChange(false);
    } catch (error) {
      console.error('❌ ImageCropper: Error creando imagen recortada:', error);
    } finally {
      setLoading(false);
    }
  }, [croppedAreaPixels, imageSrc, rotation, onCropComplete, onOpenChange]);

  const handleCancel = () => {
    setCrop({ x: 0, y: 0 });
    setRotation(0);
    setZoom(1);
    setCroppedAreaPixels(null);
    onOpenChange(false);
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setRotation(0);
    setZoom(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          {/* Cropper Area */}
          <div className="relative h-96 w-full overflow-hidden rounded-lg bg-black">
            <Cropper
              image={imageSrc}
              crop={crop}
              rotation={rotation}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onRotationChange={setRotation}
              onCropComplete={onCropCompleteHandler}
              onZoomChange={setZoom}
              cropShape={cropShape}
              showGrid={true}
              style={{
                containerStyle: {
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#000'
                }
              }}
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Zoom Control */}
            <div className="flex items-center space-x-4">
              <ZoomOut className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <Slider
                  value={[zoom]}
                  onValueChange={(values) => setZoom(values[0])}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>
              <ZoomIn className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground min-w-[60px]">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Rotation Control */}
            <div className="flex items-center space-x-4">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <Slider
                  value={[rotation]}
                  onValueChange={(values) => setRotation(values[0])}
                  min={-180}
                  max={180}
                  step={1}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-muted-foreground min-w-[60px]">
                {rotation}°
              </span>
            </div>

            {/* Reset Button */}
            <div className="flex justify-center">
              <Button variant="outline" onClick={resetCrop} size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetear
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || !croppedAreaPixels}>
            {loading ? 'Procesando...' : 'Aplicar Recorte'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
