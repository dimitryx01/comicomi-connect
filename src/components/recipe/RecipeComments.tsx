
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { UserLink } from '@/components/ui/UserLink';
import { useAuth } from '@/contexts/AuthContext';
import { useRecipeComments, RecipeComment } from '@/hooks/useRecipeComments';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface RecipeCommentsProps {
  recipeId: string;
}

export const RecipeComments = ({ recipeId }: RecipeCommentsProps) => {
  const { user } = useAuth();
  const { comments, loading, addComment } = useRecipeComments(recipeId);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    const success = await addComment(newComment);
    
    if (success) {
      setNewComment('');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div className="text-center py-4">Cargando comentarios...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Add comment form */}
      {user && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe tu comentario..."
            className="min-h-[80px]"
          />
          <Button 
            type="submit" 
            disabled={!newComment.trim() || submitting}
            size="sm"
          >
            {submitting ? 'Enviando...' : 'Comentar'}
          </Button>
        </form>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No hay comentarios aún. ¡Sé el primero en comentar!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
};

const CommentItem = ({ comment }: { comment: RecipeComment }) => {
  return (
    <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
      <UserLink username={comment.user_username || ''}>
        <AvatarWithSignedUrl
          fileId={comment.user_avatar_url}
          fallbackText={comment.user_full_name || comment.user_username || 'U'}
          size="sm"
        />
      </UserLink>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <UserLink username={comment.user_username || ''}>
            <span className="font-medium text-sm">
              {comment.user_full_name || comment.user_username || 'Usuario'}
            </span>
          </UserLink>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { 
              addSuffix: true, 
              locale: es 
            })}
          </span>
        </div>
        <p className="text-sm">{comment.content}</p>
      </div>
    </div>
  );
};
