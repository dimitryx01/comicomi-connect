
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { MapPin } from 'lucide-react';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { MediaUploader } from './MediaUploader';
import { TagSelector } from './TagSelector';
import { useToast } from '@/hooks/use-toast';
import { usePostCreation } from '@/hooks/posts/usePostCreation';

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { createPost } = usePostCreation();
  const { uploadFile } = useMediaUpload();
  const { toast } = useToast();

  const handleMediaAdded = (media: MediaFile) => {
    console.log('📎 CreatePostForm: Media agregado a la lista:', media.originalName);
    setSelectedMedia(prev => [...prev, media]);
  };

  const handleMediaRemoved = (id: string) => {
    console.log('🗑️ CreatePostForm: Media eliminado de la lista:', id);
    setSelectedMedia(prev => {
      const updated = prev.filter(m => m.id !== id);
      // Limpiar preview URLs para evitar memory leaks
      const removed = prev.find(m => m.id === id);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return updated;
    });
  };

  const validateForm = () => {
    // Debe tener contenido o medios
    if (!content.trim() && selectedMedia.length === 0) {
      toast({
        title: "Contenido requerido",
        description: "Debes agregar texto o seleccionar una imagen/video",
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

  const uploadMediaFiles = async (): Promise<{ images: string[]; videos: string[] } | null> => {
    if (selectedMedia.length === 0) return null;

    const results = { images: [] as string[], videos: [] as string[] };
    
    console.log('📤 CreatePostForm: Iniciando subida de', selectedMedia.length, 'archivos...');
    
    for (let i = 0; i < selectedMedia.length; i++) {
      const media = selectedMedia[i];
      
      try {
        console.log(`📤 Subiendo archivo ${i + 1}/${selectedMedia.length}:`, media.originalName);
        
        // Actualizar progreso
        const baseProgress = (i / selectedMedia.length) * 100;
        setUploadProgress(baseProgress);
        
        const result = await uploadFile(media.file, 'posts');
        
        if (result.success && result.fileId) {
          if (media.type === 'image') {
            results.images.push(result.fileId);
          } else {
            results.videos.push(result.fileId);
          }
          
          console.log(`✅ Archivo ${i + 1} subido exitosamente:`, result.fileId);
        } else {
          throw new Error(result.error || 'Error en la subida');
        }
        
        // Progreso completado para este archivo
        setUploadProgress(((i + 1) / selectedMedia.length) * 100);
        
      } catch (error) {
        console.error(`❌ Error subiendo archivo ${i + 1}:`, error);
        throw new Error(`Error subiendo ${media.originalName}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
    
    console.log('✅ CreatePostForm: Todos los archivos subidos exitosamente:', results);
    return results;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      console.log('📝 CreatePostForm: Iniciando proceso de publicación...');

      // 1. Subir archivos de medios si los hay
      let mediaUrls = null;
      if (selectedMedia.length > 0) {
        console.log('📤 CreatePostForm: Subiendo archivos de medios...');
        mediaUrls = await uploadMediaFiles();
      }

      // 2. Crear el post con las URLs de los medios subidos
      console.log('💾 CreatePostForm: Creando post en la base de datos...');
      
      const success = await createPost(
        content.trim(), 
        location.trim() || undefined,
        selectedRestaurant?.id,
        selectedRecipe?.id,
        mediaUrls
      );

      if (success) {
        // Limpiar formulario y preview URLs
        selectedMedia.forEach(media => {
          if (media.preview) {
            URL.revokeObjectURL(media.preview);
          }
        });
        
        setContent('');
        setLocation('');
        setSelectedMedia([]);
        setSelectedRestaurant(null);
        setSelectedRecipe(null);
        onSuccess?.();
        
        toast({
          title: "¡Post publicado!",
          description: "Tu post se ha publicado correctamente"
        });
      }
    } catch (error) {
      console.error('❌ CreatePostForm: Error en el proceso de publicación:', error);
      toast({
        title: "Error al publicar",
        description: error instanceof Error ? error.message : "No se pudo publicar el post. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const canSubmit = !isUploading && (content.trim() || selectedMedia.length > 0);
  const charactersLeft = 2000 - content.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-label="Crear nuevo post">
      <div>
        <Label htmlFor="content" className="text-base font-medium">
          ¿Qué quieres compartir?
        </Label>
        <Textarea
          id="content"
          placeholder="Comparte tu experiencia culinaria, receta favorita, recomendación de restaurante..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="resize-none mt-2"
          maxLength={2000}
          aria-describedby="content-help content-counter"
          aria-required={selectedMedia.length === 0}
          disabled={isUploading}
        />
        <div className="flex justify-between items-center mt-2">
          <span 
            id="content-counter" 
            className={`text-sm ${charactersLeft >= 0 ? 'text-muted-foreground' : 'text-destructive'}`}
            aria-live="polite"
          >
            {charactersLeft >= 0 ? `${charactersLeft} caracteres restantes` : `${Math.abs(charactersLeft)} caracteres de más`}
          </span>
          {charactersLeft < 0 && (
            <span className="text-sm text-destructive font-medium" role="alert">
              Límite excedido
            </span>
          )}
        </div>
        <div id="content-help" className="text-sm text-muted-foreground mt-1">
          Requerido si no agregas imágenes o videos
        </div>
      </div>

      {/* Subida de medios */}
      <fieldset disabled={isUploading}>
        <legend className="text-base font-medium mb-2">Agregar fotos o videos</legend>
        <MediaUploader
          onMediaAdded={handleMediaAdded}
          onMediaRemoved={handleMediaRemoved}
          selectedMedia={selectedMedia}
          maxFiles={5}
          uploading={isUploading}
        />
      </fieldset>

      {/* Progreso de subida */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subiendo archivos y publicando post...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Etiquetado */}
      <fieldset disabled={isUploading}>
        <legend className="text-base font-medium mb-2">Etiquetar (opcional)</legend>
        <TagSelector
          selectedRestaurant={selectedRestaurant}
          selectedRecipe={selectedRecipe}
          onRestaurantSelect={setSelectedRestaurant}
          onRecipeSelect={setSelectedRecipe}
        />
      </fieldset>

      {/* Ubicación */}
      <div>
        <Label htmlFor="location" className="text-base font-medium">
          Ubicación (opcional)
        </Label>
        <div className="relative mt-2">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            id="location"
            placeholder="¿Dónde estás?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10"
            maxLength={100}
            aria-describedby="location-help"
            disabled={isUploading}
          />
        </div>
        <div id="location-help" className="text-sm text-muted-foreground mt-1">
          Agrega tu ubicación actual para que otros puedan encontrarte
        </div>
      </div>

      {/* Botón de publicar */}
      <div className="flex justify-end pt-4 border-t">
        <Button 
          type="submit" 
          disabled={!canSubmit || charactersLeft < 0}
          className="min-w-[120px]"
          aria-describedby={!canSubmit ? "submit-help" : undefined}
        >
          {isUploading ? 'Publicando...' : 'Publicar Post'}
        </Button>
        {!canSubmit && charactersLeft >= 0 && !isUploading && (
          <div id="submit-help" className="sr-only">
            Agrega contenido o selecciona una imagen para poder publicar
          </div>
        )}
      </div>
    </form>
  );
};

export default CreatePostForm;
