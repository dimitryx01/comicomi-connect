
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

export interface PostProps {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
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
  
  const { user: currentUser } = useAuth();
  const { comments, commentsCount, loading: commentsLoading, addComment } = useComments(id);
  const { cheersCount, hasCheered, loading: cheersLoading, toggleCheer } = useCheers(id);
  const { fetchSharedPosts } = useSharedPosts();

  // Si es una publicación compartida, usar SharedPostCard
  if (is_shared && shared_data) {
    // Necesitamos obtener los datos completos de la publicación compartida
    const [sharedPostData, setSharedPostData] = useState(null);
    
    // En una implementación real, esto debería obtenerse del hook usePosts
    // Por ahora, mostramos un placeholder
    return (
      <Card className="border-none shadow-sm overflow-hidden animate-scale-in mb-4 w-full">
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            <p>Publicación compartida - Funcionalidad en desarrollo</p>
            <p className="text-sm">Tipo: {shared_data.shared_type}</p>
          </div>
        </CardContent>
      </Card>
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
    // El hook useCheers y useComments se actualizarán automáticamente
    // gracias a las suscripciones en tiempo real de Supabase
  };

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
