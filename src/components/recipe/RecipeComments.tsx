
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { UserLink } from '@/components/ui/UserLink';
import { CommentCheersButton } from '@/components/ui/CommentCheersButton';
import { useAuth } from '@/contexts/AuthContext';
import { useRecipeComments, RecipeComment } from '@/hooks/useRecipeComments';
import { useRecipeCommentCheers } from '@/hooks/useRecipeCommentCheers';
import { CommentOptionsMenu } from '@/components/post/CommentOptionsMenu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  const { user } = useAuth();
  const { toast } = useToast();

  const handleReportComment = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para reportar",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          comment_id: comment.id,
          report_type: 'inappropriate_content',
          description: 'Comentario de receta reportado desde la interfaz',
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Reporte enviado",
        description: "Hemos recibido tu reporte y será revisado por nuestro equipo"
      });
    } catch (error) {
      console.error('Error reporting recipe comment:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte",
        variant: "destructive"
      });
    }
  };

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
        <div className="flex items-center justify-between">
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
          
          {/* Options menu for recipe comments */}
          <CommentOptionsMenu
            commentId={comment.id}
            commentUserId={comment.user_id}
            currentUserId={user?.id}
            onReport={user?.id !== comment.user_id ? handleReportComment : undefined}
          />
        </div>
        <p className="text-sm">{comment.content}</p>
        
        {/* Cheers button for recipe comments */}
        <div className="mt-2">
          <RecipeCommentCheersActions commentId={comment.id} />
        </div>
      </div>
    </div>
  );
};

// Component for recipe comment cheers actions
const RecipeCommentCheersActions = ({ commentId }: { commentId: string }) => {
  const { cheersCount, hasCheered, toggleCheer, loading } = useRecipeCommentCheers(commentId);
  
  return (
    <CommentCheersButton
      cheersCount={cheersCount}
      hasCheered={hasCheered}
      onClick={toggleCheer}
      loading={loading}
    />
  );
};
