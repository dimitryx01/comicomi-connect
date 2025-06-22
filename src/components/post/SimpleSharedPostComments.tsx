
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SharedPostComment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_full_name: string;
  user_username: string;
  user_avatar_url: string;
}

interface SimpleSharedPostCommentsProps {
  sharedPostId: string;
}

export const SimpleSharedPostComments = ({ sharedPostId }: SimpleSharedPostCommentsProps) => {
  const [comments, setComments] = useState<SharedPostComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      setLoading(true);
      console.log('🔄 SimpleSharedPostComments: Fetching comments for:', sharedPostId);
      
      const { data, error } = await supabase.rpc('get_shared_post_comments', {
        shared_post_uuid: sharedPostId
      });

      if (error) {
        console.error('❌ Error fetching comments:', error);
        return;
      }
      
      console.log('✅ Comments fetched:', data?.length || 0);
      setComments(data || []);
    } catch (error) {
      console.error('❌ Error in fetchComments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !user) return;

    try {
      setLoading(true);
      console.log('➕ Adding comment:', newComment.substring(0, 50));
      
      const { error } = await supabase
        .from('shared_post_comments')
        .insert({
          shared_post_id: sharedPostId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) {
        console.error('❌ Error adding comment:', error);
        toast({
          title: "Error",
          description: "No se pudo agregar el comentario",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Comment added successfully');
      setNewComment('');
      await fetchComments(); // Refresh comments
      
      toast({
        title: "Éxito",
        description: "Comentario agregado",
      });
    } catch (error) {
      console.error('❌ Error in addComment:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el comentario",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addComment();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'ahora';
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  useEffect(() => {
    if (sharedPostId) {
      fetchComments();
    }
  }, [sharedPostId]);

  return (
    <div className="space-y-4">
      {/* Add Comment Input */}
      {user && (
        <div className="flex items-center space-x-2">
          <AvatarWithSignedUrl
            fileId={user.user_metadata?.avatar_url}
            fallbackText={user.user_metadata?.full_name}
            size="sm"
            className="flex-shrink-0"
          />
          <div className="flex-1 flex items-center space-x-2">
            <Input
              placeholder="Agregar un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-sm"
              disabled={loading}
            />
            <Button 
              size="sm" 
              onClick={addComment}
              disabled={!newComment.trim() || loading}
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {loading && comments.length === 0 ? (
          <div className="flex justify-center py-4">
            <div className="text-sm text-muted-foreground">Cargando comentarios...</div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-4">
            No hay comentarios aún. ¡Sé el primero en comentar!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-2">
              <AvatarWithSignedUrl
                fileId={comment.user_avatar_url}
                fallbackText={comment.user_full_name}
                size="sm"
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="bg-background rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium truncate">{comment.user_full_name}</h4>
                    <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
