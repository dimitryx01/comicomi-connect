
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useSaveContent, ContentType } from '@/hooks/useSaveContent';
import { useAuth } from '@/contexts/AuthContext';

interface SaveButtonProps {
  contentId: string;
  contentType: ContentType;
  authorId?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
  showText?: boolean;
  className?: string;
}

export const SaveButton = ({
  contentId,
  contentType,
  authorId,
  variant = 'ghost',
  size = 'sm',
  showText = false,
  className = ''
}: SaveButtonProps) => {
  const [isSaved, setIsSaved] = useState(false);
  const { user } = useAuth();
  const { saveContent, unsaveContent, checkIfSaved, loading } = useSaveContent();

  // No mostrar el botón si el usuario es el autor
  const isOwnContent = authorId && user && authorId === user.id;

  useEffect(() => {
    if (!user || isOwnContent) return;

    const checkSavedStatus = async () => {
      const saved = await checkIfSaved(contentId, contentType);
      setIsSaved(saved);
    };

    checkSavedStatus();
  }, [user, contentId, contentType, checkIfSaved, isOwnContent]);

  const handleToggleSave = async () => {
    if (!user) return;

    const success = isSaved 
      ? await unsaveContent({ contentId, contentType })
      : await saveContent({ contentId, contentType, authorId });

    if (success) {
      setIsSaved(!isSaved);
    }
  };

  // No renderizar si es contenido propio
  if (isOwnContent) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleSave}
      disabled={loading || !user}
      className={`text-muted-foreground hover:text-foreground transition-colors ${
        isSaved ? 'text-blue-600 hover:text-blue-700' : ''
      } ${className}`}
    >
      {isSaved ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-1 text-sm">
          {isSaved ? 'Guardado' : 'Guardar'}
        </span>
      )}
    </Button>
  );
};
