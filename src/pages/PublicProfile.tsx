import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Users, Heart, MessageCircle, Share2, ArrowLeft } from 'lucide-react';
import { useUserFeedPaginated } from '@/hooks/useUserFeedPaginated';
import { UserFeedSection } from '@/components/profile/UserFeedSection';
import { useAuth } from '@/contexts/AuthContext';
import PublicLayout from '@/components/layout/PublicLayout';

interface PublicUserProfile {
  id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  location: string;
  created_at: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  total_cheers: number;
}

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Limpiar @ del username si viene incluido
  const cleanUsername = username?.replace('@', '') || '';

  console.log('🔍 PublicProfile: Cargando perfil para username:', cleanUsername);

  const {
    combinedFeed,
    loading: feedLoading,
    hasMore,
    isFetchingNextPage,
    loadMorePosts,
    refreshFeed
  } = useUserFeedPaginated({
    userId: profile?.id,
    postsPerPage: 10
  });

  // Cargar datos del perfil
  useEffect(() => {
    const fetchProfile = async () => {
      if (!cleanUsername) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        console.log('📡 PublicProfile: Fetching profile data para:', cleanUsername);

        // Obtener datos básicos del usuario
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, username, full_name, bio, avatar_url, location, created_at')
          .eq('username', cleanUsername)
          .single();

        if (userError || !userData) {
          console.error('❌ PublicProfile: Usuario no encontrado:', userError);
          setNotFound(true);
          setLoading(false);
          return;
        }

        // Obtener contadores
        const [
          { count: followersCount },
          { count: followingCount },
          { count: postsCount }
        ] = await Promise.all([
          supabase
            .from('user_followers')
            .select('*', { count: 'exact', head: true })
            .eq('followed_id', userData.id),
          supabase
            .from('user_followers')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', userData.id),
          supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', userData.id)
        ]);

        // Calcular total de cheers recibidos
        const { data: cheersData } = await supabase
          .from('cheers')
          .select('id')
          .in('post_id', 
            (await supabase
              .from('posts')
              .select('id')
              .eq('author_id', userData.id)).data?.map(p => p.id) || []
          );

        const userProfile: PublicUserProfile = {
          id: userData.id,
          username: userData.username || '',
          full_name: userData.full_name || '',
          bio: userData.bio || '',
          avatar_url: userData.avatar_url || '',
          location: userData.location || '',
          created_at: userData.created_at,
          followers_count: followersCount || 0,
          following_count: followingCount || 0,
          posts_count: postsCount || 0,
          total_cheers: cheersData?.length || 0
        };

        setProfile(userProfile);

        // Verificar si el usuario actual sigue a este perfil
        if (currentUser) {
          const { data: followData } = await supabase
            .from('user_followers')
            .select('id')
            .eq('follower_id', currentUser.id)
            .eq('followed_id', userData.id)
            .single();
          
          setIsFollowing(!!followData);
        }

        console.log('✅ PublicProfile: Perfil cargado exitosamente:', userProfile);
      } catch (error) {
        console.error('❌ PublicProfile: Error cargando perfil:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar el perfil",
          variant: "destructive"
        });
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [cleanUsername, currentUser, toast]);

  const handleFollowToggle = async () => {
    if (!currentUser || !profile) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        // Dejar de seguir
        const { error } = await supabase
          .from('user_followers')
          .delete()
          .eq('follower_id', currentUser.id)
          .eq('followed_id', profile.id);

        if (!error) {
          setIsFollowing(false);
          setProfile(prev => prev ? {
            ...prev,
            followers_count: prev.followers_count - 1
          } : null);
        }
      } else {
        // Seguir
        const { error } = await supabase
          .from('user_followers')
          .insert({
            follower_id: currentUser.id,
            followed_id: profile.id
          });

        if (!error) {
          setIsFollowing(true);
          setProfile(prev => prev ? {
            ...prev,
            followers_count: prev.followers_count + 1
          } : null);
        }
      }
    } catch (error) {
      console.error('❌ PublicProfile: Error al cambiar seguimiento:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el seguimiento",
        variant: "destructive"
      });
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl">👤</div>
              <h1 className="text-2xl font-bold text-gray-700">Perfil no disponible</h1>
              <p className="text-gray-500">
                Este perfil no existe o no está disponible públicamente.
              </p>
              <Button 
                onClick={() => navigate(-1)}
                variant="outline"
                className="mt-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <PublicLayout>
      {/* Header del perfil */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback className="text-lg">
                {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Información del perfil */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-700">{profile.bio}</p>
              )}

              {/* Información adicional */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Se unió en {new Date(profile.created_at).toLocaleDateString('es-ES', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>

              {/* Estadísticas */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-semibold">{profile.followers_count}</span>
                  <span className="text-muted-foreground">seguidores</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="font-semibold">{profile.following_count}</span>
                  <span className="text-muted-foreground">siguiendo</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span className="font-semibold">{profile.posts_count}</span>
                  <span className="text-muted-foreground">publicaciones</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span className="font-semibold">{profile.total_cheers}</span>
                  <span className="text-muted-foreground">cheers recibidos</span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              {!isOwnProfile && currentUser && (
                <Button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  variant={isFollowing ? "outline" : "default"}
                >
                  {followLoading ? (
                    "Cargando..."
                  ) : isFollowing ? (
                    "Siguiendo"
                  ) : (
                    "Seguir"
                  )}
                </Button>
              )}
              
              {isOwnProfile && (
                <Button 
                  onClick={() => navigate('/profile')}
                  variant="outline"
                >
                  Editar perfil
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feed de publicaciones */}
      <div className="space-y-6">
        <div className="border-b pb-2">
          <h2 className="text-xl font-semibold">Publicaciones</h2>
          <p className="text-muted-foreground text-sm">
            {profile.posts_count} publicaciones públicas
          </p>
        </div>

        <UserFeedSection
          feedItems={combinedFeed}
          loading={feedLoading}
          hasMore={hasMore}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={loadMorePosts}
        />
      </div>
    </PublicLayout>
  );
};

export default PublicProfile;
