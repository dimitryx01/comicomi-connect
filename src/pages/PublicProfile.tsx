
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { Loader2, MapPin, Calendar, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import PostCard from '@/components/post/PostCard';
import { useInfiniteQuery } from '@tanstack/react-query';

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  bio: string;
  location: string;
  avatar_url: string;
  created_at: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  media_urls: any;
  location: string;
  restaurant_id: string;
  cheers_count: number;
  comments_count: number;
  users: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
  restaurants?: {
    id: string;
    name: string;
  };
}

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Limpiar el username removiendo @ si existe
  const cleanUsername = username?.replace('@', '');

  // Cargar perfil del usuario
  useEffect(() => {
    if (!cleanUsername) {
      setError('Usuario no encontrado');
      setLoading(false);
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', cleanUsername)
          .single();

        if (error || !data) {
          setError('Este perfil no está disponible');
          return;
        }

        // Simular contadores por ahora
        const profileData: UserProfile = {
          id: data.id,
          full_name: data.full_name || 'Usuario',
          username: data.username || 'usuario',
          bio: data.bio || '',
          location: data.location || '',
          avatar_url: data.avatar_url || '',
          created_at: data.created_at,
          followers_count: 0,
          following_count: 0,
          posts_count: 0
        };

        setUserProfile(profileData);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [cleanUsername]);

  // Query para posts del usuario
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading
  } = useInfiniteQuery({
    queryKey: ['publicUserPosts', userProfile?.id],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userProfile?.id) return { posts: [], hasMore: false };

      const limit = 10;
      const offset = pageParam * limit;

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          users!posts_author_id_fkey(full_name, username, avatar_url),
          restaurants(id, name)
        `)
        .eq('author_id', userProfile.id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Get cheers and comments counts for each post
      const postsWithCounts = await Promise.all((data || []).map(async (post) => {
        const { count: cheersCount } = await supabase
          .from('cheers')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id);

        return {
          ...post,
          cheers_count: cheersCount || 0,
          comments_count: commentsCount || 0
        };
      }));

      return {
        posts: postsWithCounts,
        hasMore: (data || []).length === limit
      };
    },
    enabled: !!userProfile?.id,
    getNextPageParam: (lastPage, pages) => 
      lastPage.hasMore ? pages.length : undefined,
    initialPageParam: 0
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Perfil no disponible</h1>
          <p className="text-muted-foreground">
            {error || 'Este perfil no está disponible o no existe.'}
          </p>
        </div>
      </div>
    );
  }

  const allPosts = postsData?.pages.flatMap(page => page.posts) || [];

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header del perfil */}
      <Card>
        <CardHeader>
          <div className="flex items-start space-x-4">
            <AvatarWithSignedUrl
              fileId={userProfile.avatar_url}
              fallbackText={userProfile.full_name}
              size="xl"
            />
            <div className="flex-1 space-y-2">
              <div>
                <h1 className="text-2xl font-bold">{userProfile.full_name}</h1>
                <p className="text-muted-foreground">@{userProfile.username}</p>
              </div>
              
              {userProfile.bio && (
                <p className="text-sm">{userProfile.bio}</p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {userProfile.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{userProfile.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Se unió {formatDistanceToNow(new Date(userProfile.created_at), { 
                    addSuffix: true, 
                    locale: es 
                  })}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <span className="font-semibold">{userProfile.posts_count || allPosts.length}</span>
                  <span className="text-muted-foreground">publicaciones</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold">{userProfile.followers_count || 0}</span>
                  <span className="text-muted-foreground">seguidores</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold">{userProfile.following_count || 0}</span>
                  <span className="text-muted-foreground">siguiendo</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Publicaciones */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Publicaciones</h2>
        
        {postsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : allPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                Este usuario aún no ha publicado nada.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {allPosts.map((post) => {
              // Safely parse media_urls
              let mediaUrls = { images: [], videos: [] };
              if (post.media_urls && typeof post.media_urls === 'object') {
                mediaUrls = {
                  images: (post.media_urls as any)?.images || [],
                  videos: (post.media_urls as any)?.videos || []
                };
              }

              return (
                <PostCard
                  key={post.id}
                  id={post.id}
                  user={{
                    id: post.author_id,
                    name: post.users?.full_name || 'Usuario',
                    username: post.users?.username || 'usuario',
                    avatar: post.users?.avatar_url
                  }}
                  content={post.content}
                  mediaUrls={mediaUrls}
                  likes={post.cheers_count || 0}
                  comments={post.comments_count || 0}
                  createdAt={post.created_at}
                  location={post.location}
                  restaurant={post.restaurants ? {
                    id: post.restaurants.id,
                    name: post.restaurants.name
                  } : undefined}
                />
              );
            })}
            
            {hasNextPage && (
              <div className="flex justify-center py-4">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="outline"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    'Cargar más publicaciones'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
