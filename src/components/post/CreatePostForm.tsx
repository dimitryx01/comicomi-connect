
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image, MapPin, ChefHat } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';

interface CreatePostFormProps {
  onSuccess?: () => void;
}

const CreatePostForm = ({ onSuccess }: CreatePostFormProps) => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('general');
  const [location, setLocation] = useState('');
  const { createPost, loading } = usePosts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    const success = await createPost(content, location);
    if (success) {
      setContent('');
      setLocation('');
      setPostType('general');
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="content">¿Qué estás cocinando?</Label>
        <Textarea
          id="content"
          placeholder="Comparte tu última aventura culinaria, receta o experiencia en restaurante..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postType">Tipo de Post</Label>
          <Select value={postType} onValueChange={setPostType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">Post General</SelectItem>
              <SelectItem value="food_photo">Foto de Comida</SelectItem>
              <SelectItem value="experience">Experiencia Restaurante</SelectItem>
              <SelectItem value="tip">Consejo de Cocina</SelectItem>
              <SelectItem value="story">Historia Culinaria</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location">Ubicación (opcional)</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Agregar ubicación"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm">
            <Image className="h-4 w-4 mr-2" />
            Foto
          </Button>
          <Button type="button" variant="outline" size="sm">
            <ChefHat className="h-4 w-4 mr-2" />
            Receta
          </Button>
        </div>
        
        <Button type="submit" disabled={!content.trim() || loading}>
          {loading ? 'Publicando...' : 'Publicar Post'}
        </Button>
      </div>
    </form>
  );
};

export default CreatePostForm;
