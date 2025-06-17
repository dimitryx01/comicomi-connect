
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';
import { MediaUploader } from './MediaUploader';
import { TagSelector } from './TagSelector';
import { useToast } from '@/hooks/use-toast';

interface CreatePostFormProps {
  onSuccess?: () => void;
}

interface MediaUploadResult {
  type: 'image' | 'video';
  fileId: string;
  originalName: string;
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
  const [uploadedMedia, setUploadedMedia] = useState<MediaUploadResult[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  const { createPost, loading } = usePosts();
  const { toast } = useToast();

  const handleMediaUploaded = (media: MediaUploadResult) => {
    console.log('📎 CreatePostForm: Media agregado:', media);
    setUploadedMedia(prev => [...prev, media]);
  };

  const handleMediaRemoved = (index: number) => {
    console.log('🗑️ CreatePostForm: Media eliminado en índice:', index);
    setUploadedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    // Debe tener contenido o medios
    if (!content.trim() && uploadedMedia.length === 0) {
      toast({
        title: "Contenido requerido",
        description: "Debes agregar texto o subir una imagen/video",
        variant: "destructive"
      });
      return false;
    }

    // Validar longitud del contenido
    if (content.length > 2000) {
      toast({
        title: "Contenido muy largo",
        description: "El contenido no puede superar los 2000 caracteres",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      console.log('📝 CreatePostForm: Creando post con datos:', {
        content: content.trim(),
        location,
        mediaCount: uploadedMedia.length,
        restaurant: selectedRestaurant?.name,
        recipe: selectedRecipe?.title
      });

      // Preparar URLs de medios en el formato esperado
      const mediaUrls = uploadedMedia.length > 0 ? {
        images: uploadedMedia.filter(m => m.type === 'image').map(m => m.fileId),
        videos: uploadedMedia.filter(m => m.type === 'video').map(m => m.fileId)
      } : null;

      console.log('🎬 CreatePostForm: URLs de medios preparadas:', mediaUrls);

      const success = await createPost(
        content.trim(), 
        location.trim() || undefined,
        selectedRestaurant?.id,
        selectedRecipe?.id,
        mediaUrls
      );

      if (success) {
        // Limpiar formulario
        setContent('');
        setLocation('');
        setUploadedMedia([]);
        setSelectedRestaurant(null);
        setSelectedRecipe(null);
        onSuccess?.();
        
        toast({
          title: "¡Post publicado!",
          description: "Tu post se ha publicado correctamente"
        });
      }
    } catch (error) {
      console.error('❌ CreatePostForm: Error creando post:', error);
      toast({
        title: "Error al publicar",
        description: "No se pudo publicar el post. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  };

  const canSubmit = !loading && (content.trim() || uploadedMedia.length > 0);
  const charactersLeft = 2000 - content.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="content">¿Qué quieres compartir?</Label>
        <Textarea
          id="content"
          placeholder="Comparte tu experiencia culinaria, receta favorita, recomendación de restaurante..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="resize-none"
          maxLength={2000}
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-muted-foreground">
            {charactersLeft >= 0 ? `${charactersLeft} caracteres restantes` : `${Math.abs(charactersLeft)} caracteres de más`}
          </span>
          {charactersLeft < 0 && (
            <span className="text-xs text-destructive">
              Límite excedido
            </span>
          )}
        </div>
      </div>

      {/* Subida de medios */}
      <div>
        <Label>Agregar fotos o videos</Label>
        <MediaUploader
          onMediaUploaded={handleMediaUploaded}
          onMediaRemoved={handleMediaRemoved}
          uploadedMedia={uploadedMedia}
          maxFiles={5}
        />
      </div>

      {/* Etiquetado */}
      <TagSelector
        selectedRestaurant={selectedRestaurant}
        selectedRecipe={selectedRecipe}
        onRestaurantSelect={setSelectedRestaurant}
        onRecipeSelect={setSelectedRecipe}
      />

      {/* Ubicación */}
      <div>
        <Label htmlFor="location">Ubicación (opcional)</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="location"
            placeholder="¿Dónde estás?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10"
            maxLength={100}
          />
        </div>
      </div>

      {/* Botón de publicar */}
      <div className="flex justify-end pt-4 border-t">
        <Button 
          type="submit" 
          disabled={!canSubmit || charactersLeft < 0}
          className="min-w-[120px]"
        >
          {loading ? 'Publicando...' : 'Publicar Post'}
        </Button>
      </div>
    </form>
  );
};

export default CreatePostForm;
