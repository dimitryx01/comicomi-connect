
import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useComments } from '@/hooks/useComments';
import { useCheers } from '@/hooks/useCheers';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostActions } from './PostActions';
import { PostComments } from './PostComments';
import { SharedPostCard } from './SharedPostCard';

interface PostUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

interface AuthUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface PostProps {
  id: string;
  user: PostUser;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaUrls?: {
    images?: string[];
    videos?: string[];
  };
  likes: number;
  comments: number;
  createdAt: string;
  location?: string;
  restaurant?: {
    id: string;
    name: string;
  };
  isLiked?: boolean;
  onPostDeleted?: (postId: string) => void;
  is_shared?: boolean;
  shared_data?: {
    shared_type: 'post' | 'recipe' | 'restaurant';
    shared_post_id?: string;
    shared_recipe_id?: string;
    shared_restaurant_id?: string;
    original_content?: any;
  };
}

const PostCard = ({
  id,
  user,
  content,
  imageUrl,
  videoUrl,
  mediaUrls,
  createdAt,
  location,
  restaurant,
  onPostDeleted,
  is_shared = false,
  shared_data
}: PostProps) => {
  const [showComments, setShowComments] = useState(false);
  const navigate = useNavigate();
  
  const { user: authUser } = useAuth();
  const { comments, commentsCount, loading: commentsLoading, addComment } = useComments(id);
  const { cheersCount, hasCheered, loading: cheersLoading, toggleCheer } = useCheers(id);

  console.log('🔍 PostCard: Renderizando post:', {
    id,
    isShared: is_shared,
    hasSharedData: !!shared_data,
    sharedType: shared_data?.shared_type,
    userName: user.name,
    originalContent: shared_data?.original_content
  });

  // Si es una publicación compartida, usar SharedPostCard
  if (is_shared && shared_data) {
    console.log('🔄 PostCard: Usando SharedPostCard para publicación compartida:', { 
      id, 
      sharedType: shared_data.shared_type,
      hasOriginalContent: !!shared_data.original_content,
      originalContentDetails: shared_data.original_content
    });
    
    // Crear el objeto SharedPost para el componente SharedPostCard
    const sharedPost = {
      id,
      sharer_id: user.id,
      shared_type: shared_data.shared_type,
      shared_post_id: shared_data.shared_post_id,
      shared_recipe_id: shared_data.shared_recipe_id,
      shared_restaurant_id: shared_data.shared_restaurant_id,
      comment: content,
      created_at: createdAt,
      updated_at: createdAt,
      sharer: {
        id: user.id,
        full_name: user.name,
        username: user.username,
        avatar_url: user.avatar || ''
      },
      original_content: shared_data.original_content,
      cheers_count: cheersCount,
      comments_count: commentsCount,
      has_cheered: hasCheered
    };

    return (
      <SharedPostCard 
        sharedPost={sharedPost} 
        onPostDeleted={onPostDeleted}
        onPostUpdated={() => console.log('🔄 PostCard: Post compartido actualizado:', id)}
      />
    );
  }

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handlePostDeleted = () => {
    console.log('🔔 PostCard: Post eliminado, notificando al padre:', id);
    onPostDeleted?.(id);
  };

  const handlePostUpdated = () => {
    console.log('🔄 PostCard: Post actualizado, refrescando datos...');
  };

  // Navegar a página de detalle al hacer clic en la tarjeta
  const handleCardClick = (e: React.MouseEvent) => {
    // Evitar navegación si se hace clic en botones interactivos
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
      return;
    }
    navigate(`/post/${id}`);
  };

  // Convert authUser to match the expected interface
  const currentUser: AuthUser | null = authUser ? {
    id: authUser.id,
    name: (authUser as any).user_metadata?.full_name || (authUser as any).user_metadata?.name || authUser.email?.split('@')[0] || 'Usuario',
    username: (authUser as any).user_metadata?.username || authUser.email?.split('@')[0] || 'usuario',
    avatar: (authUser as any).user_metadata?.avatar_url
  } : null;

  console.log('✅ PostCard: Renderizando post normal:', {
    id,
    userName: user.name,
    hasMedia: !!(mediaUrls?.images?.length || mediaUrls?.videos?.length)
  });

  return (
    <Card 
      className="border-none shadow-sm overflow-hidden animate-scale-in mb-4 w-full cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <PostHeader 
          user={user} 
          restaurant={restaurant} 
          createdAt={createdAt}
          postId={id}
          postContent={content}
          postLocation={location}
          postMediaUrls={mediaUrls}
          onPostDeleted={handlePostDeleted}
          onPostUpdated={handlePostUpdated}
        />
        <PostContent 
          content={content} 
          imageUrl={imageUrl} 
          videoUrl={videoUrl}
          mediaUrls={mediaUrls}
        />
      </CardContent>

      <CardFooter className="p-0">
        <PostActions
          cheersCount={cheersCount}
          hasCheered={hasCheered}
          cheersLoading={cheersLoading}
          commentsCount={commentsCount}
          showComments={showComments}
          createdAt={createdAt}
          currentUser={currentUser}
          onToggleCheer={toggleCheer}
          onToggleComments={handleToggleComments}
          postId={id}
          postContent={content}
          authorName={user.name}
        />
      </CardFooter>

      {showComments && (
        <PostComments
          comments={comments}
          currentUser={currentUser}
          commentsLoading={commentsLoading}
          onAddComment={addComment}
        />
      )}
    </Card>
  );
};

export default PostCard;
