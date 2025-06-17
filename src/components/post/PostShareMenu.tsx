
import { useState } from 'react';
import { Share2, Copy, Mail, Facebook, Twitter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PostShareMenuProps {
  postId: string;
  postContent: string;
  authorName: string;
}

export const PostShareMenu = ({
  postId,
  postContent,
  authorName
}: PostShareMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const postUrl = `${window.location.origin}/post/${postId}`;
  const shareText = `Mira este post de ${authorName}: ${postContent.slice(0, 100)}${postContent.length > 100 ? '...' : ''}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      toast({
        title: "Enlace copiado",
        description: "El enlace del post se ha copiado al portapapeles",
      });
    } catch (error) {
      console.error('Error copiando al portapapeles:', error);
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive"
      });
    }
    setIsOpen(false);
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareByEmail = () => {
    const subject = `Post compartido de ${authorName}`;
    const body = `${shareText}\n\nVe el post completo aquí: ${postUrl}`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
    setIsOpen(false);
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post de ${authorName}`,
          text: shareText,
          url: postUrl,
        });
      } catch (error) {
        console.error('Error compartiendo:', error);
      }
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          aria-label="Compartir post"
        >
          <Share2 className="h-4 w-4 mr-1" />
          Compartir
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
          <Copy className="mr-2 h-4 w-4" />
          Copiar enlace
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareByEmail} className="cursor-pointer">
          <Mail className="mr-2 h-4 w-4" />
          Compartir por email
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareOnFacebook} className="cursor-pointer">
          <Facebook className="mr-2 h-4 w-4" />
          Compartir en Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={shareOnTwitter} className="cursor-pointer">
          <Twitter className="mr-2 h-4 w-4" />
          Compartir en Twitter
        </DropdownMenuItem>

        {navigator.share && (
          <DropdownMenuItem onClick={shareNative} className="cursor-pointer">
            <Share2 className="mr-2 h-4 w-4" />
            Compartir...
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
