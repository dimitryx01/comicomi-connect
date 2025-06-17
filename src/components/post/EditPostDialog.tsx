
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { MediaUploader } from './MediaUploader';

interface EditPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    content: string;
    location?: string;
    mediaUrls?: {
      images?: string[];
      videos?: string[];
    };
  };
  onPostUpdated?: () => void;
}

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video';
  originalName: string;
  preview?: string;
}

export const EditPostDialog = ({ isOpen, onClose, post, onPostUpdated }: EditPostDialogProps) => {
  const [content, setContent] = useState(post.content || '');
  const [location, setLocation] = useState(post.location || '');
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updatePost } = usePosts();
  const { uploadFile, uploading } = useMediaUpload();
  const { toast } = useToast();

  // Reset form when post changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      setContent(post.content || '');
      setLocation(post.location || '');
      setSelectedMedia([]);
    }
  }, [isOpen, post]);

  const handleMediaAdded = (media: MediaFile) => {
    console.log('📷 EditPostDialog: Media file added:', media.originalName);
    setSelectedMedia(prev => [...prev, media]);
  };

  const handleMediaRemoved = (id: string) => {
    console.log('🗑️ EditPostDialog: Media file removed:', id);
    setSelectedMedia(prev => prev.filter(media => media.id !== id));
  };

  const uploadNewMedia = async (): Promise<{ images?: string[]; videos?: string[] } | null> => {
    if (selectedMedia.length === 0) return null;

    console.log('📤 EditPostDialog: Subiendo nuevos archivos multimedia...', selectedMedia.length);
    
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
      console.error('❌ EditPostDialog: Errores subiendo archivos:', failedUploads);
      throw new Error(`Error subiendo algunos archivos: ${failedUploads[0]}`);
    }

    // Organizar por tipo
    const images = successfulUploads
      .filter(upload => upload.type === 'image')
      .map(upload => upload.fileId);
    
    const videos = successfulUploads
      .filter(upload => upload.type === 'video')
      .map(upload => upload.fileId);

    console.log('✅ EditPostDialog: Nuevos archivos subidos:', {
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
    
    if (!content.trim() && !post.mediaUrls && selectedMedia.length === 0) {
      toast({
        title: "Error",
        description: "El post debe tener contenido o medios",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('✏️ EditPostDialog: Actualizando post:', post.id);

      // Subir nuevos archivos multimedia si hay alguno
      const newMediaUrls = await uploadNewMedia();

      // Combinar medios existentes con los nuevos
      let finalMediaUrls = post.mediaUrls;
      
      if (newMediaUrls) {
        finalMediaUrls = {
          images: [
            ...(post.mediaUrls?.images || []),
            ...(newMediaUrls.images || [])
          ],
          videos: [
            ...(post.mediaUrls?.videos || []),
            ...(newMediaUrls.videos || [])
          ]
        };

        // Limpiar arrays vacíos
        if (finalMediaUrls.images?.length === 0) delete finalMediaUrls.images;
        if (finalMediaUrls.videos?.length === 0) delete finalMediaUrls.videos;
        if (Object.keys(finalMediaUrls).length === 0) finalMediaUrls = undefined;
      }

      const success = await updatePost(
        post.id,
        content,
        location || undefined,
        finalMediaUrls
      );

      if (success) {
        console.log('✅ EditPostDialog: Post actualizado exitosamente');
        
        toast({
          title: "Post actualizado",
          description: "Los cambios se han guardado correctamente",
        });

        // Notificar al componente padre y cerrar el diálogo
        onPostUpdated?.();
        onClose();
      }
    } catch (error) {
      console.error('❌ EditPostDialog: Error actualizando post:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el post",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || uploading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar post</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">Contenido</Label>
            <Textarea
              id="content"
              placeholder="¿Qué estás pensando?"
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

          {/* Mostrar medios existentes */}
          {post.mediaUrls && (post.mediaUrls.images?.length || post.mediaUrls.videos?.length) && (
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4" />
                Medios actuales
              </Label>
              <div className="grid grid-cols-2 gap-2 p-2 border rounded-lg bg-muted/50">
                {post.mediaUrls.images?.map((imageId, index) => (
                  <div key={imageId} className="text-xs text-muted-foreground">
                    📸 Imagen {index + 1}
                  </div>
                ))}
                {post.mediaUrls.videos?.map((videoId, index) => (
                  <div key={videoId} className="text-xs text-muted-foreground">
                    🎥 Video {index + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-4 w-4" />
              Agregar nuevos medios (opcional)
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
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {uploading ? 'Subiendo...' : 'Guardando...'}
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
