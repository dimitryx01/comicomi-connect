
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/hooks/usePosts';
import { MediaUploader } from './MediaUploader';

interface CreatePostFormProps {
  onSuccess?: () => void;
}

const CreatePostForm = ({ onSuccess }: CreatePostFormProps) => {
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [mediaUrls, setMediaUrls] = useState<{ images?: string[]; videos?: string[] } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createPost } = usePosts();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleMediaUpload = (urls: { images?: string[]; videos?: string[] }) => {
    console.log('📷 CreatePostForm: Media URLs received:', urls);
    setMediaUrls(urls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && (!mediaUrls || ((!mediaUrls.images || mediaUrls.images.length === 0) && (!mediaUrls.videos || mediaUrls.videos.length === 0)))) {
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
        mediaUrls
      });

      const success = await createPost(
        content,
        location || undefined,
        undefined, // restaurantId
        undefined, // recipeId
        mediaUrls
      );

      if (success) {
        console.log('✅ CreatePostForm: Post creado exitosamente, navegando al feed...');
        
        // Cerrar el diálogo primero si existe
        if (onSuccess) {
          onSuccess();
        }
        
        // Navegar al feed con un pequeño delay para asegurar que el diálogo se cierre
        setTimeout(() => {
          navigate('/feed', { replace: true });
          // Forzar recarga adicional del feed
          window.location.reload();
        }, 100);
        
        // Limpiar el formulario
        setContent('');
        setLocation('');
        setMediaUrls(null);
      }
    } catch (error) {
      console.error('❌ CreatePostForm: Error creando post:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el post",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-4 w-4" />
              Fotos y videos (opcional)
            </Label>
            <MediaUploader 
              onUpload={handleMediaUpload}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publicando...
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
