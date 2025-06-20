
import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useComments } from '@/hooks/useComments';
import { useCheers } from '@/hooks/useCheers';
import { useAuth } from '@/contexts/AuthContext';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostActions } from './PostActions';
import { PostComments } from './PostComments';
import { SharedPostCard } from './SharedPostCard';
import { useSharedPosts } from '@/hooks/useSharedPosts';

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
  
  const { user: authUser } = useAuth();
  const { comments, commentsCount, loading: commentsLoading, addComment } = useComments(id);
  const { cheersCount, hasCheered, loading: cheersLoading, toggleCheer } = useCheers(id);
  const { fetchSharedPosts } = useSharedPosts();

  // Si es una publicación compartida, usar SharedPostCard
  if (is_shared && shared_data) {
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
      sharer: {
        id: user.id,
        full_name: user.name,
        username: user.username,
        avatar_url: user.avatar || ''
      },
      original_content: null // Se cargará dinámicamente en SharedPostCard
    };

    return <SharedPostCard sharedPost={sharedPost} />;
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
    // El hook useCheers y useComments se actualizarán automáticamente
    // gracias a las suscripciones en tiempo real de Supabase
  };

  // Convert authUser to match the expected interface
  const currentUser: AuthUser | null = authUser ? {
    id: authUser.id,
    name: authUser.name || authUser.full_name || 'Usuario',
    username: authUser.username || 'usuario',
    avatar: authUser.avatar_url
  } : null;

  return (
    <Card className="border-none shadow-sm overflow-hidden animate-scale-in mb-4 w-full">
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

      {/* Comments Section */}
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
