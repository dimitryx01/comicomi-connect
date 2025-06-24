
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ImageIcon, Loader2, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePostCreation } from '@/hooks/posts/usePostCreation';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { MediaUploader } from './MediaUploader';
import { TagSelector } from './TagSelector';

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

interface Restaurant {
  id: string;
  name: string;
  location?: string;
}

interface Recipe {
  id: string;
  title: string;
  author_id: string;
}

const CreatePostForm = ({ onSuccess }: CreatePostFormProps) => {
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createPost } = usePostCreation();
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
        selectedRestaurant: selectedRestaurant?.id,
        selectedRecipe: selectedRecipe?.id,
        mediaCount: selectedMedia.length
      });

      // Extract File objects from MediaFile array
      const mediaFiles = selectedMedia.map(media => media.file);

      // Usar el hook de creación de posts con callback optimista
      const success = await createPost(
        content,
        location || undefined,
        selectedRestaurant?.id,
        selectedRecipe?.id,
        mediaFiles, // Pass File[] instead of MediaFile[]
        (newPost) => {
          console.log('✅ CreatePostForm: Post creado optimísticamente:', newPost);
          // El post se agregará automáticamente al feed mediante el callback
        }
      );

      if (success) {
        console.log('✅ CreatePostForm: Post creado exitosamente');
        
        // Limpiar el formulario
        setContent('');
        setLocation('');
        setSelectedMedia([]);
        setSelectedRestaurant(null);
        setSelectedRecipe(null);
        
        // Llamar al callback de éxito para cerrar el diálogo
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <Label className="flex items-center gap-2 mb-4">
              <Tag className="h-4 w-4" />
              Etiquetas (opcional)
            </Label>
            <TagSelector
              selectedRestaurant={selectedRestaurant}
              selectedRecipe={selectedRecipe}
              onRestaurantSelect={setSelectedRestaurant}
              onRecipeSelect={setSelectedRecipe}
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
