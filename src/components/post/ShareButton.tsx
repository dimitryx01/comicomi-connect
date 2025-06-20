
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Share2, Loader2 } from 'lucide-react';
import { useSharedPosts } from '@/hooks/useSharedPosts';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface ShareButtonProps {
  contentType: 'post' | 'recipe' | 'restaurant';
  contentId: string;
  contentTitle?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  asMenuItem?: boolean;
}

export const ShareButton = ({ 
  contentType, 
  contentId, 
  contentTitle = '', 
  className = '',
  size = 'sm',
  asMenuItem = true
}: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState('');
  const { shareContent, loading } = useSharedPosts();

  const handleShare = async () => {
    const success = await shareContent(contentType, contentId, comment.trim() || undefined);
    if (success) {
      setComment('');
      setIsOpen(false);
    }
  };

  const getContentTypeText = () => {
    switch (contentType) {
      case 'post': return 'post';
      case 'recipe': return 'receta';
      case 'restaurant': return 'restaurante';
      default: return 'contenido';
    }
  };

  const TriggerComponent = asMenuItem ? (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      <Share2 className="mr-2 h-4 w-4" />
      Compartir en perfil
    </DropdownMenuItem>
  ) : (
    <Button
      variant="ghost"
      size={size}
      className={`text-muted-foreground hover:text-foreground ${className}`}
    >
      <Share2 className="h-4 w-4 mr-1" />
      Compartir
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {TriggerComponent}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir {getContentTypeText()}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Vas a compartir {contentTitle ? `"${contentTitle}"` : `este ${getContentTypeText()}`} en tu perfil.
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comment">Agrega un comentario (opcional)</Label>
            <Textarea
              id="comment"
              placeholder={`¿Qué opinas sobre ${contentTitle ? `"${contentTitle}"` : `este ${getContentTypeText()}`}?`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px] resize-none"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleShare}
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Compartiendo...
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
