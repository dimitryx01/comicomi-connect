
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, ChevronUp } from "lucide-react";
import { CheersIcon } from './CheersIcon';
import { CommentOptionsMenu } from './CommentOptionsMenu';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { useCommentsPagination } from '@/hooks/useCommentsPagination';
import { useCommentActions } from '@/hooks/useCommentActions';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_full_name: string;
  user_username: string;
  user_avatar_url: string;
  cheers_count: number;
}

interface PostCommentsProps {
  comments: Comment[];
  currentUser: any;
  commentsLoading: boolean;
  onAddComment: (content: string) => Promise<boolean>;
  onRefreshComments?: () => void;
}

export const PostComments = ({ 
  comments, 
  currentUser, 
  commentsLoading, 
  onAddComment,
  onRefreshComments 
}: PostCommentsProps) => {
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const { user } = useAuth();
  
  const {
    visibleComments,
    hasMore,
    hiddenCount,
    loadMore,
    totalCount
  } = useCommentsPagination({
    comments,
    initialPageSize: 5,
    pageSize: 5
  });

  const { deleteComment, editComment, reportComment, loading: actionLoading } = useCommentActions();

  console.log('📝 PostComments: Renderizando con:', {
    totalComments: comments.length,
    visibleComments: visibleComments.length,
    currentUserId: user?.id,
    editingCommentId,
    actionLoading
  });

  const handleAddComment = async () => {
    if (newComment.trim() && currentUser) {
      console.log('➕ PostComments: Agregando nuevo comentario');
      const success = await onAddComment(newComment);
      if (success) {
        setNewComment('');
        console.log('✅ PostComments: Comentario agregado, refrescando lista');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleEditComment = (commentId: string, currentContent: string) => {
    console.log('✏️ PostComments: Iniciando edición:', { commentId, currentContent: currentContent.substring(0, 50) + '...' });
    setEditingCommentId(commentId);
    setEditingContent(currentContent);
  };

  const handleSaveEdit = async () => {
    if (!editingCommentId || !editingContent.trim()) {
      console.warn('⚠️ PostComments: Intento de guardar sin ID o contenido');
      return;
    }

    console.log('💾 PostComments: Guardando edición:', { editingCommentId, newContent: editingContent.substring(0, 50) + '...' });
    
    const success = await editComment(editingCommentId, editingContent);
    if (success) {
      console.log('✅ PostComments: Edición guardada exitosamente');
      setEditingCommentId(null);
      setEditingContent('');
      
      // Forzar actualización de comentarios
      if (onRefreshComments) {
        console.log('🔄 PostComments: Refrescando lista de comentarios');
        onRefreshComments();
      }
    } else {
      console.error('❌ PostComments: Error al guardar edición');
    }
  };

  const handleCancelEdit = () => {
    console.log('❌ PostComments: Cancelando edición');
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleDeleteComment = async (commentId: string) => {
    console.log('🗑️ PostComments: Eliminando comentario:', commentId);
    
    const success = await deleteComment(commentId);
    if (success) {
      console.log('✅ PostComments: Comentario eliminado exitosamente');
      
      // Forzar actualización de comentarios
      if (onRefreshComments) {
        console.log('🔄 PostComments: Refrescando lista de comentarios');
        onRefreshComments();
      }
    } else {
      console.error('❌ PostComments: Error al eliminar comentario');
    }
  };

  const handleReportComment = async (commentId: string) => {
    console.log('🚩 PostComments: Reportando comentario:', commentId);
    await reportComment(commentId);
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'ahora';
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  return (
    <div className="border-t bg-muted/30 animate-accordion-down">
      <div className="p-3 sm:p-4">
        {/* Add Comment Input - Only show if user is authenticated */}
        {currentUser && (
          <div className="flex items-center space-x-2 mb-4">
            <AvatarWithSignedUrl
              fileId={currentUser.user_metadata?.avatar_url}
              fallbackText={currentUser.user_metadata?.full_name}
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
                disabled={commentsLoading}
              />
              <Button 
                size="sm" 
                onClick={handleAddComment}
                disabled={!newComment.trim() || commentsLoading}
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Load More Button - Show at top if there are hidden comments */}
        {hasMore && (
          <div className="flex justify-center mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={loadMore}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronUp className="h-3 w-3 mr-1" />
              Ver {hiddenCount} comentarios anteriores
            </Button>
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-3">
          {visibleComments.map((comment) => (
            <div key={comment.id} className="flex space-x-2 group">
              <AvatarWithSignedUrl
                fileId={comment.user_avatar_url}
                fallbackText={comment.user_full_name}
                size="sm"
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="bg-background rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs sm:text-sm font-medium truncate">{comment.user_full_name}</h4>
                      <span className="text-xs text-muted-foreground">{formatCommentDate(comment.created_at)}</span>
                    </div>
                    <CommentOptionsMenu
                      commentId={comment.id}
                      commentUserId={comment.user_id}
                      currentUserId={user?.id}
                      onEdit={() => handleEditComment(comment.id, comment.content)}
                      onDelete={() => handleDeleteComment(comment.id)}
                      onReport={() => handleReportComment(comment.id)}
                    />
                  </div>
                  
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="text-xs sm:text-sm min-h-[60px]"
                        disabled={actionLoading}
                        placeholder="Escribe tu comentario..."
                      />
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          onClick={handleSaveEdit}
                          disabled={!editingContent.trim() || actionLoading}
                        >
                          {actionLoading ? 'Guardando...' : 'Guardar'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={actionLoading}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-muted-foreground">{comment.content}</p>
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-1 px-3">
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-xs text-muted-foreground">
                    <CheersIcon className="h-3 w-3 mr-1 transform rotate-12" />
                    {comment.cheers_count}
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0 h-auto text-xs text-muted-foreground">
                    Responder
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {totalCount === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No hay comentarios aún. ¡Sé el primero en comentar!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
