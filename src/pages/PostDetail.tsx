import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, X } from 'lucide-react';
import { PostHeader } from '@/components/post/PostHeader';
import { PostContent } from '@/components/post/PostContent';
import { PostActions } from '@/components/post/PostActions';
import { PostComments } from '@/components/post/PostComments';
import { OriginalContentImage } from '@/components/post/OriginalContentImage';
import { useAuth } from '@/contexts/AuthContext';
import { useCheers } from '@/hooks/useCheers';
import { useComments } from '@/hooks/useComments';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PostDetailData {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_username: string;
  author_avatar: string;
  media_urls?: {
    images?: string[];
    videos?: string[];
  };
  location?: string;
  restaurant_id?: string;
  restaurant_name?: string;
  is_public?: boolean;
}

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [post, setPost] = useState<PostDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [unavailable, setUnavailable] = useState(false);

  const { comments, commentsCount, loading: commentsLoading, addComment, refreshComments } = useComments(postId || '');
  const { cheersCount, hasCheered, loading: cheersLoading, toggleCheer } = useCheers(postId || '');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!postId) {
      navigate('/feed');
      return;
    }
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          author_id,
          is_public,
          media_urls,
          location,
          restaurant_id,
          users!posts_author_id_fkey (
            id,
            full_name,
            username,
            avatar_url
          ),
          restaurants (
            id,
            name
          )
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;

      if (data) {
        // Safely parse media_urls from Json to our expected type
        let parsedMediaUrls: { images?: string[]; videos?: string[] } | undefined;
        if (data.media_urls) {
          try {
            // Handle both object and string cases
            if (typeof data.media_urls === 'string') {
              parsedMediaUrls = JSON.parse(data.media_urls);
            } else if (typeof data.media_urls === 'object') {
              parsedMediaUrls = data.media_urls as { images?: string[]; videos?: string[] };
            }
            
            console.log('📱 PostDetail: Media URLs parseadas:', {
              originalMediaUrls: data.media_urls,
              parsedMediaUrls,
              hasImages: !!(parsedMediaUrls?.images?.length),
              hasVideos: !!(parsedMediaUrls?.videos?.length)
            });
          } catch (parseError) {
            console.warn('⚠️ PostDetail: Error parsing media_urls:', parseError);
            parsedMediaUrls = undefined;
          }
        }

        setPost({
          id: data.id,
          content: data.content,
          created_at: data.created_at,
          author_id: data.author_id,
          author_name: data.users?.full_name || 'Usuario',
          author_username: data.users?.username || 'usuario',
          author_avatar: data.users?.avatar_url || '',
          media_urls: parsedMediaUrls,
          location: data.location,
          restaurant_id: data.restaurants?.id,
          restaurant_name: data.restaurants?.name,
          is_public: data.is_public,
        });
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la publicación",
        variant: "destructive"
      });
      navigate('/feed');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handlePostDeleted = () => {
    toast({
      title: "Publicación eliminada",
      description: "La publicación ha sido eliminada exitosamente"
    });
    navigate('/feed');
  };

  const handlePostUpdated = () => {
    fetchPost();
  };

  const currentUser = user ? {
    id: user.id,
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
    username: user.user_metadata?.username || user.email?.split('@')[0] || 'usuario',
    avatar: user.user_metadata?.avatar_url
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Contenido eliminado (moderación): mostrar mensaje en lugar de redirigir
  if (post && post.is_public === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold mb-2">Contenido no disponible</h2>
          <p className="mb-6 text-sm text-muted-foreground">Esta publicación fue eliminada por infringir nuestras normas de la comunidad.</p>
          <Button onClick={handleBack}>Volver</Button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Publicación no encontrada</h2>
          <Button onClick={handleBack}>Volver</Button>
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-background border-b p-4 flex items-center">
          <Button variant="ghost" size="sm" onClick={handleBack} className="mr-3">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Publicación</h1>
        </div>

        {/* Mobile Content */}
        <div className="pb-6">
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <PostHeader
                user={{
                  id: post.author_id,
                  name: post.author_name,
                  username: post.author_username,
                  avatar: post.author_avatar
                }}
                restaurant={post.restaurant_name ? {
                  id: post.restaurant_id || '',
                  name: post.restaurant_name
                } : undefined}
                createdAt={post.created_at}
                postId={post.id}
                postContent={post.content}
                postLocation={post.location}
                postMediaUrls={post.media_urls}
                onPostDeleted={handlePostDeleted}
                onPostUpdated={handlePostUpdated}
              />
              
              <PostContent
                content={post.content}
                mediaUrls={post.media_urls}
              />
            </CardContent>

            <PostActions
              cheersCount={cheersCount}
              hasCheered={hasCheered}
              cheersLoading={cheersLoading}
              commentsCount={commentsCount}
              showComments={true}
              createdAt={post.created_at}
              currentUser={currentUser}
              onToggleCheer={toggleCheer}
              onToggleComments={() => {}}
              postId={post.id}
              postContent={post.content}
              authorName={post.author_name}
              authorId={post.author_id}
            />

            <PostComments
              comments={comments}
              currentUser={currentUser}
              commentsLoading={commentsLoading}
              onAddComment={addComment}
              onRefreshComments={refreshComments}
            />
          </Card>
        </div>
      </div>
    );
  }

  // Desktop Layout - Modal Style
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Left Side - Media Content */}
        <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
          {post.media_urls?.images?.length || post.media_urls?.videos?.length ? (
            <div className="w-full h-full flex items-center justify-center">
              {post.media_urls?.images?.[0] && (
                <OriginalContentImage
                  fileId={post.media_urls.images[0]}
                  alt="Imagen del post"
                  className="max-w-full max-h-full object-contain"
                />
              )}
              {post.media_urls?.videos?.[0] && !post.media_urls?.images?.[0] && (
                <video
                  src={post.media_urls.videos[0]}
                  controls
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="text-center text-white max-w-md">
                <h3 className="text-2xl font-bold mb-4">{post.author_name}</h3>
                <p className="text-lg leading-relaxed">{post.content}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side - Post Details */}
        <div className="w-96 flex flex-col bg-background">
          <div className="flex-1 overflow-y-auto">
            <Card className="border-0 shadow-none h-full">
              <CardContent className="p-0 h-full flex flex-col">
                <PostHeader
                  user={{
                    id: post.author_id,
                    name: post.author_name,
                    username: post.author_username,
                    avatar: post.author_avatar
                  }}
                  restaurant={post.restaurant_name ? {
                    id: post.restaurant_id || '',
                    name: post.restaurant_name
                  } : undefined}
                  createdAt={post.created_at}
                  postId={post.id}
                  postContent={post.content}
                  postLocation={post.location}
                  postMediaUrls={post.media_urls}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                />
                
                {post.content && !post.media_urls?.images?.length && !post.media_urls?.videos?.length && (
                  <div className="px-4 pb-3">
                    <p className="text-sm">{post.content}</p>
                  </div>
                )}

                <PostActions
                  cheersCount={cheersCount}
                  hasCheered={hasCheered}
                  cheersLoading={cheersLoading}
                  commentsCount={commentsCount}
                  showComments={true}
                  createdAt={post.created_at}
                  currentUser={currentUser}
                  onToggleCheer={toggleCheer}
                  onToggleComments={() => {}}
                  postId={post.id}
                  postContent={post.content}
                  authorName={post.author_name}
                  authorId={post.author_id}
                />

                <div className="flex-1">
                  <PostComments
                    comments={comments}
                    currentUser={currentUser}
                    commentsLoading={commentsLoading}
                    onAddComment={addComment}
                    onRefreshComments={refreshComments}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
