
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { MediaUploader } from './MediaUploader';

interface CreatePostFormProps {
  onSuccess?: () => void;
}

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video';
  originalName: string;
  preview?: string;
}

const CreatePostForm = ({ onSuccess }: CreatePostFormProps) => {
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createPost } = usePosts();
  const { uploadFile, uploading } = useMediaUpload();
  const { toast } = useToast();

  const handleMediaAdded = (media: MediaFile) => {
    console.log('📷 CreatePostForm: Media file added:', media.originalName);
    setSelectedMedia(prev => [...prev, media]);
  };

  const handleMediaRemoved = (id: string) => {
    console.log('🗑️ CreatePostForm: Media file removed:', id);
    setSelectedMedia(prev => prev.filter(media => media.id !== id));
  };

  const uploadSelectedMedia = async (): Promise<{ images?: string[]; videos?: string[] } | null> => {
    if (selectedMedia.length === 0) return null;

    console.log('📤 CreatePostForm: Subiendo archivos multimedia...', selectedMedia.length);
    
    const uploadResults = await Promise.allSettled(
      selectedMedia.map(async (media) => {
        const folder = media.type === 'image' ? 'posts/images' : 'posts/videos';
        const result = await uploadFile(media.file, folder);
        
        if (!result.success) {
          throw new Error(`Error subiendo ${media.originalName}: ${result.error}`);
        }
        
        return {
          type: media.type,
          fileId: result.fileId!
        };
      })
    );

    const successfulUploads = uploadResults
      .filter((result): result is PromiseFulfilledResult<{type: 'image' | 'video', fileId: string}> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);

    const failedUploads = uploadResults
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason);

    if (failedUploads.length > 0) {
      console.error('❌ CreatePostForm: Errores subiendo archivos:', failedUploads);
      throw new Error(`Error subiendo algunos archivos: ${failedUploads[0]}`);
    }

    // Organizar por tipo
    const images = successfulUploads
      .filter(upload => upload.type === 'image')
      .map(upload => upload.fileId);
    
    const videos = successfulUploads
      .filter(upload => upload.type === 'video')
      .map(upload => upload.fileId);

    console.log('✅ CreatePostForm: Archivos subidos exitosamente:', {
      images: images.length,
      videos: videos.length
    });

    return {
      ...(images.length > 0 && { images }),
      ...(videos.length > 0 && { videos })
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && selectedMedia.length === 0) {
      toast({
        title: "Error",
        description: "Debes agregar contenido o medios al post",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('📝 CreatePostForm: Creando post con:', {
        contentLength: content.length,
        location,
        mediaCount: selectedMedia.length
      });

      // Subir archivos multimedia si hay alguno
      const mediaUrls = await uploadSelectedMedia();

      const success = await createPost(
        content,
        location || undefined,
        undefined, // restaurantId
        undefined, // recipeId
        mediaUrls
      );

      if (success) {
        console.log('✅ CreatePostForm: Post creado exitosamente');
        
        // Limpiar el formulario
        setContent('');
        setLocation('');
        setSelectedMedia([]);
        
        // Cerrar el diálogo si existe
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('❌ CreatePostForm: Error creando post:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el post",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || uploading;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Crear nuevo post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">¿Qué estás pensando?</Label>
            <Textarea
              id="content"
              placeholder="Comparte tu experiencia culinaria..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ubicación (opcional)
            </Label>
            <Input
              id="location"
              placeholder="¿Dónde estás?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-4 w-4" />
              Fotos y videos (opcional)
            </Label>
            <MediaUploader 
              onMediaAdded={handleMediaAdded}
              onMediaRemoved={handleMediaRemoved}
              selectedMedia={selectedMedia}
              maxFiles={5}
              uploading={isLoading}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploading ? 'Subiendo archivos...' : 'Publicando...'}
                </>
              ) : (
                'Publicar'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePostForm;
