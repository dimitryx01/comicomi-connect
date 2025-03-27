
import { useState, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Image, Film, MapPin, X } from "lucide-react";

const CreatePostForm = () => {
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
          setVideoPreview(null);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload an image file."
        });
      }
    }
  };

  const handleVideoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setVideoPreview(reader.result as string);
          setImagePreview(null);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a video file."
        });
      }
    }
  };

  const clearMedia = () => {
    setImagePreview(null);
    setVideoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && !imagePreview && !videoPreview) {
      toast({
        description: "Please add some content to your post."
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call
      setTimeout(() => {
        toast({
          title: "Post created!",
          description: "Your post has been published successfully."
        });
        
        // Reset form
        setContent('');
        setImagePreview(null);
        setVideoPreview(null);
      }, 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create post. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-4">
        <Avatar>
          <AvatarImage src="" alt="Your profile" />
          <AvatarFallback>YP</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="What's cooking?"
            value={content}
            onChange={handleTextChange}
            className="resize-none border-none bg-secondary shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-24"
          />
        </div>
      </div>

      {/* Media Preview */}
      {(imagePreview || videoPreview) && (
        <div className="relative rounded-md overflow-hidden">
          <Button 
            type="button"
            variant="destructive" 
            size="icon" 
            className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full opacity-90"
            onClick={clearMedia}
          >
            <X className="h-4 w-4" />
          </Button>
          
          {imagePreview && (
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-auto max-h-96 object-contain bg-secondary rounded-md" 
            />
          )}
          
          {videoPreview && (
            <video 
              src={videoPreview} 
              controls 
              className="w-full h-auto max-h-96 object-contain bg-secondary rounded-md" 
            />
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex space-x-2">
          <div>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <label htmlFor="image-upload">
              <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" asChild>
                <span>
                  <Image className="h-5 w-5 mr-1" />
                  <span className="sr-only">Upload image</span>
                </span>
              </Button>
            </label>
          </div>
          
          <div>
            <input
              type="file"
              id="video-upload"
              accept="video/*"
              className="hidden"
              onChange={handleVideoUpload}
            />
            <label htmlFor="video-upload">
              <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" asChild>
                <span>
                  <Film className="h-5 w-5 mr-1" />
                  <span className="sr-only">Upload video</span>
                </span>
              </Button>
            </label>
          </div>
          
          <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
            <MapPin className="h-5 w-5 mr-1" />
            <span className="sr-only">Tag location</span>
          </Button>
        </div>
        
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </div>
    </form>
  );
};

export default CreatePostForm;
