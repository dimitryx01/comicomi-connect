
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit2, X, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { CommentOptionsMenu } from './CommentOptionsMenu';
import { useSharedPostCommentActions } from '@/hooks/useSharedPostCommentActions';
import { SharedPostComment } from '@/types/sharedPost';

interface AuthUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

interface SharedPostCommentsProps {
  comments: SharedPostComment[];
  currentUser: AuthUser | null;
  commentsLoading: boolean;
  onAddComment: (content: string) => Promise<boolean>;
}

export const SharedPostComments = ({ 
  comments, 
  currentUser, 
  commentsLoading, 
  onAddComment 
}: SharedPostCommentsProps) => {
  const [newComment, setNewComment] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  const { deleteComment, editComment, reportComment, loading: actionLoading } = useSharedPostCommentActions();

  console.log('💬 SharedPostComments: Renderizando comentarios:', {
    commentsCount: comments.length,
    currentUser: currentUser?.name,
    commentsLoading
  });

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setAddingComment(true);
    const success = await onAddComment(newComment.trim());
    if (success) {
      setNewComment('');
    }
    setAddingComment(false);
  };

  const handleEditStart = (comment: SharedPostComment) => {
    console.log('✏️ SharedPostComments: Iniciando edición de comentario:', comment.id);
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleEditSave = async (commentId: string) => {
    if (!editContent.trim()) return;

    console.log('💾 SharedPostComments: Guardando edición de comentario:', commentId);
    const success = await editComment(commentId, editContent.trim());
    if (success) {
      setEditingCommentId(null);
      setEditContent('');
    }
  };

  const handleEditCancel = () => {
    console.log('❌ SharedPostComments: Cancelando edición');
    setEditingCommentId(null);
    setEditContent('');
  };

  const handleDelete = async (commentId: string) => {
    console.log('🗑️ SharedPostComments: Eliminando comentario:', commentId);
    await deleteComment(commentId);
  };

  const handleReport = async (commentId: string) => {
    console.log('🚩 SharedPostComments: Reportando comentario:', commentId);
    await reportComment(commentId);
  };

  return (
    <Card className="border-t border-gray-200 dark:border-gray-700 rounded-none">
      <CardContent className="p-4 space-y-4">
        {/* Lista de comentarios */}
        {commentsLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No hay comentarios aún. ¡Sé el primero en comentar!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="group flex space-x-3">
                <AvatarWithSignedUrl 
                  fileId={comment.user_avatar_url} 
                  fallbackText={comment.user_full_name}
                  className="h-8 w-8 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {comment.user_full_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        @{comment.user_username}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">·</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: es
                        })}
                      </p>
                    </div>
                    
                    {/* Menu de opciones */}
                    <CommentOptionsMenu
                      commentId={comment.id}
                      commentUserId={comment.user_id}
                      currentUserId={currentUser?.id}
                      onEdit={currentUser?.id === comment.user_id ? () => handleEditStart(comment) : undefined}
                      onDelete={currentUser?.id === comment.user_id ? () => handleDelete(comment.id) : undefined}
                      onReport={currentUser?.id !== comment.user_id ? () => handleReport(comment.id) : undefined}
                    />
                  </div>
                  
                  {/* Contenido del comentario */}
                  {editingCommentId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="text-sm resize-none"
                        rows={2}
                        placeholder="Editar comentario..."
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleEditSave(comment.id)}
                          disabled={!editContent.trim() || actionLoading}
                          className="h-7 px-2"
                        >
                          {actionLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3 mr-1" />
                          )}
                          Guardar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEditCancel}
                          disabled={actionLoading}
                          className="h-7 px-2"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-800 dark:text-gray-200 break-words">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulario para agregar nuevo comentario */}
        {currentUser && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex space-x-3">
              <AvatarWithSignedUrl 
                fileId={currentUser.avatar} 
                fallbackText={currentUser.name}
                className="h-8 w-8 flex-shrink-0"
              />
              <div className="flex-1 space-y-3">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="resize-none"
                  rows={2}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addingComment}
                    size="sm"
                  >
                    {addingComment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Comentando...
                      </>
                    ) : (
                      'Comentar'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
