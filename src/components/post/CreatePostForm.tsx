
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image, MapPin, ChefHat } from 'lucide-react';

interface CreatePostFormProps {
  onSuccess?: () => void;
}

const CreatePostForm = ({ onSuccess }: CreatePostFormProps) => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('general');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle post creation
    console.log({ content, postType, location });
    setContent('');
    setLocation('');
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="content">What's cooking?</Label>
        <Textarea
          id="content"
          placeholder="Share your latest food adventure, recipe, or restaurant experience..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postType">Post Type</Label>
          <Select value={postType} onValueChange={setPostType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Post</SelectItem>
              <SelectItem value="food_photo">Food Photo</SelectItem>
              <SelectItem value="experience">Restaurant Experience</SelectItem>
              <SelectItem value="tip">Cooking Tip</SelectItem>
              <SelectItem value="story">Food Story</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location">Location (optional)</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Add location"
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
            Photo
          </Button>
          <Button type="button" variant="outline" size="sm">
            <ChefHat className="h-4 w-4 mr-2" />
            Recipe
          </Button>
        </div>
        
        <Button type="submit" disabled={!content.trim()}>
          Share Post
        </Button>
      </div>
    </form>
  );
};

export default CreatePostForm;
