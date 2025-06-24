
import { useState, memo } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Share2, MapPin, MoreHorizontal, MessageCircle } from 'lucide-react';
import { SharedPost } from '@/types/sharedPost';
import { useSharedPostInteractions } from '@/hooks/useSharedPostInteractions';
import { useAuth } from '@/contexts/AuthContext';
import { PostOptionsMenu } from './PostOptionsMenu';
import { EditSharedPostDialog } from './EditSharedPostDialog';
import { SharedPostComments } from './SharedPostComments';
import { OriginalContentImage } from './OriginalContentImage';
import { CheersIcon } from './CheersIcon';
import { UserLink } from '@/components/ui/UserLink';

interface SharedPostCardProps {
  sharedPost: SharedPost;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (postId: string) => void;
}

export const SharedPostCard = memo(({ 
  sharedPost, 
  onPostDeleted, 
  onPostUpdated 
}: SharedPostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { user: currentUser } = useAuth();
  
  const {
    cheersCount,
    commentsCount,
    hasCheered,
    cheersLoading,
    toggleCheer
  } = useSharedPostInteractions(sharedPost.id);

  console.log('🔄 SharedPostCard: Renderizando shared post:', {
    id: sharedPost.id,
    type: sharedPost.shared_type,
    hasOriginalContent: !!sharedPost.original_content,
    sharerName: sharedPost.sharer?.full_name
  });

  if (!sharedPost.original_content) {
    console.warn('⚠️ SharedPostCard: No hay contenido original para mostrar');
    return null;
  }

  const timeAgo = formatDistanceToNow(new Date(sharedPost.created_at), { 
    addSuffix: true, 
    locale: es 
  });

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleEditPost = () => {
    setShowEditDialog(true);
  };

  const handlePostUpdated = () => {
    setShowEditDialog(false);
    onPostUpdated?.(sharedPost.id);
  };

  const handlePostDeleted = () => {
    console.log('🔔 SharedPostCard: Post compartido eliminado, notificando al padre:', sharedPost.id);
    onPostDeleted?.(sharedPost.id);
  };

  const renderOriginalContent = () => {
    const content = sharedPost.original_content;
    
    if (sharedPost.shared_type === 'post') {
      return (
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={content.author?.avatar_url} alt={content.author?.full_name} />
              <AvatarFallback>
                {content.author?.full_name?.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <UserLink 
                username={content.author?.username || ''}
                displayName={content.author?.full_name || 'Usuario'}
                className="font-medium text-sm hover:underline"
              />
              <UserLink 
                username={content.author?.username || ''}
                className="text-muted-foreground text-sm hover:underline ml-2"
                showAt
              />
            </div>
          </div>
          
          {content.content && (
            <p className="text-sm mb-3">{content.content}</p>
          )}
          
          {content.media_urls && (
            <OriginalContentImage mediaUrls={content.media_urls} />
          )}
          
          {content.location && (
            <div className="flex items-center space-x-1 mt-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{content.location}</span>
            </div>
          )}
        </div>
      );
    }

    if (sharedPost.shared_type === 'recipe') {
      return (
        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={content.author?.avatar_url} alt={content.author?.full_name} />
              <AvatarFallback>
                {content.author?.full_name?.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <UserLink 
                username={content.author?.username || ''}
                displayName={content.author?.full_name || 'Usuario'}
                className="font-medium text-sm hover:underline"
              />
              <span className="text-muted-foreground text-sm ml-2">receta</span>
            </div>
          </div>
          
          <h3 className="font-semibold text-sm mb-2">{content.title}</h3>
          {content.description && (
            <p className="text-sm text-muted-foreground mb-3">{content.description}</p>
          )}
          
          {content.image_url && (
            <div className="mt-3">
              <img 
                src={content.image_url} 
                alt={content.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      );
    }

    if (sharedPost.shared_type === 'restaurant') {
      return (
        <div className="border rounded-lg p-4 bg-muted/50">
          <h3 className="font-semibold text-sm mb-2">🍽️ {content.name}</h3>
          {content.description && (
            <p className="text-sm text-muted-foreground mb-3">{content.description}</p>
          )}
          {content.cuisine_type && (
            <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded">
              {content.cuisine_type}
            </span>
          )}
          {content.location && (
            <div className="flex items-center space-x-1 mt-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{content.location}</span>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // Convert currentUser to match the expected interface
  const currentUserForComments = currentUser ? {
    id: currentUser.id,
    name: (currentUser as any).user_metadata?.full_name || (currentUser as any).user_metadata?.name || currentUser.email?.split('@')[0] || 'Usuario',
    username: (currentUser as any).user_metadata?.username || currentUser.email?.split('@')[0] || 'usuario',
    avatar: (currentUser as any).user_metadata?.avatar_url
  } : null;

  return (
    <>
      <Card className="border-none shadow-sm overflow-hidden animate-scale-in mb-4 w-full">
        <CardContent className="p-0">
          {/* Header del post compartido */}
          <div className="flex items-start justify-between p-4">
            <div className="flex items-center space-x-3 flex-1">
              <UserLink username={sharedPost.sharer?.username || ''}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={sharedPost.sharer?.avatar_url} alt={sharedPost.sharer?.full_name} />
                  <AvatarFallback>
                    {sharedPost.sharer?.full_name?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </UserLink>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 flex-wrap">
                  <UserLink 
                    username={sharedPost.sharer?.username || ''}
                    displayName={sharedPost.sharer?.full_name || 'Usuario'}
                    className="font-semibold text-sm hover:underline"
                  />
                  <span className="text-muted-foreground text-sm">compartió</span>
                  <Share2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">•</span>
                  <span className="text-muted-foreground text-sm">{timeAgo}</span>
                </div>
              </div>
            </div>

            <PostOptionsMenu
              postId={sharedPost.id}
              authorId={sharedPost.sharer_id}
              onEdit={handleEditPost}
              onDelete={handlePostDeleted}
              isSharedPost
            />
          </div>

          {/* Comentario del usuario que compartió */}
          {sharedPost.comment && (
            <div className="px-4 pb-3">
              <p className="text-sm">{sharedPost.comment}</p>
            </div>
          )}

          {/* Contenido original */}
          <div className="px-4 pb-4">
            {renderOriginalContent()}
          </div>
        </CardContent>

        <CardFooter className="p-0">
          <div className="w-full px-4 py-3 border-t bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleCheer}
                  disabled={cheersLoading}
                  className={`p-0 h-auto ${hasCheered ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500 transition-colors`}
                >
                  <CheersIcon filled={hasCheered} className="h-5 w-5 mr-2" />
                  <span className="text-sm">{cheersCount}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleComments}
                  className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  <span className="text-sm">{commentsCount}</span>
                </Button>
              </div>

              <span className="text-xs text-muted-foreground">
                {timeAgo}
              </span>
            </div>
          </div>
        </CardFooter>

        {showComments && (
          <SharedPostComments
            sharedPostId={sharedPost.id}
            currentUser={currentUserForComments}
          />
        )}
      </Card>

      <EditSharedPostDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        sharedPostId={sharedPost.id}
        initialComment={sharedPost.comment || ''}
        onPostUpdated={handlePostUpdated}
      />
    </>
  );
});

SharedPostCard.displayName = 'SharedPostCard';
