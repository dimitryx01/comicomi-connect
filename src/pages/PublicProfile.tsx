
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
          .from('profiles')
          .select('*')
          .eq('username', cleanUsername)
          .single();

        if (error || !data) {
          setError('Este perfil no está disponible');
          return;
        }

        setUserProfile(data);
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
      const { data, error } = await supabase
        .rpc('get_user_posts_public', {
          target_user_id: userProfile.id,
          limit_count: limit,
          offset_count: pageParam * limit
        });

      if (error) throw error;

      return {
        posts: data || [],
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
                  <span className="font-semibold">{userProfile.posts_count || 0}</span>
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
            {allPosts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                user={{
                  id: post.user_id,
                  name: post.user_full_name,
                  username: post.user_username,
                  avatar: post.user_avatar_url
                }}
                content={post.content}
                mediaUrls={{
                  images: post.image_urls || [],
                  videos: post.video_urls || []
                }}
                likes={post.cheers_count || 0}
                comments={post.comments_count || 0}
                createdAt={post.created_at}
                location={post.location}
                restaurant={post.restaurant ? {
                  id: post.restaurant.id,
                  name: post.restaurant.name
                } : undefined}
                is_shared={post.is_shared}
                shared_data={post.shared_data}
              />
            ))}
            
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
