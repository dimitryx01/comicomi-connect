import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { Loader2, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserFeedSection } from '@/components/profile/UserFeedSection';
import { useUserFeedPaginated } from '@/hooks/useUserFeedPaginated';
import { useAuth } from '@/contexts/AuthContext';
import { FollowButton } from '@/components/follow/FollowButton';
import { useUserFollowStats } from '@/hooks/useFollowStats';

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  bio: string;
  location: string;
  avatar_url: string;
  created_at: string;
}

const PublicProfile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // El username ya viene limpio sin @ desde la URL
  const cleanUsername = username;

  // Hook para estadísticas de seguimiento
  const { followersCount, followingCount, isFollowing, loading: followStatsLoading, refreshStats } = useUserFollowStats(userProfile?.id);

  // Verificar si es el usuario actual y redirigir a perfil privado
  useEffect(() => {
    console.log('🔍 PublicProfile: Verificando usuario actual:', {
      userUsername: user?.user_metadata?.username,
      urlUsername: cleanUsername,
      isCurrentUser: user?.user_metadata?.username === cleanUsername
    });

    if (user?.user_metadata?.username === cleanUsername) {
      console.log('🔄 PublicProfile: Es el usuario actual, redirigiendo a perfil privado');
      navigate('/profile', { replace: true });
      return;
    }
  }, [user, cleanUsername, navigate]);

  // Cargar perfil del usuario
  useEffect(() => {
    if (!cleanUsername) {
      setError('Usuario no encontrado');
      setLoading(false);
      return;
    }

    // No cargar si es el usuario actual (ya se redirigió)
    if (user?.user_metadata?.username === cleanUsername) {
      return;
    }

    const fetchUserProfile = async () => {
      try {
        console.log('📡 PublicProfile: Buscando usuario:', cleanUsername);
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', cleanUsername)
          .single();

        if (error || !data) {
          console.error('❌ PublicProfile: Error o usuario no encontrado:', error);
          setError('Este perfil no está disponible');
          return;
        }

        console.log('✅ PublicProfile: Usuario encontrado:', data);
        setUserProfile(data);
      } catch (err) {
        console.error('❌ PublicProfile: Error fetching user profile:', err);
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [cleanUsername, user]);

  // Hook para obtener el feed del usuario
  const {
    combinedFeed,
    loading: feedLoading,
    hasMore,
    isFetchingNextPage,
    loadMorePosts,
    refreshFeed
  } = useUserFeedPaginated({ userId: userProfile?.id || '' });

  const handleFollowChange = (newFollowingState: boolean) => {
    refreshStats();
  };

  const handlePostDeleted = () => {
    refreshFeed();
  };

  const handlePostUpdated = () => {
    refreshFeed();
  };

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
          <p className="text-muted-foreground mb-4">
            {error || 'Este perfil no está disponible o no existe.'}
          </p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Botón para volver */}
      <Button 
        onClick={() => navigate(-1)} 
        variant="ghost" 
        size="sm" 
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{userProfile.full_name}</h1>
                  <p className="text-muted-foreground">@{userProfile.username}</p>
                </div>
                
                {/* Botón de seguir/siguiendo */}
                {user && user.id !== userProfile.id && (
                  <FollowButton
                    type="user"
                    targetId={userProfile.id}
                    isFollowing={isFollowing}
                    onFollowChange={handleFollowChange}
                  />
                )}
              </div>
              
              {/* Estadísticas de seguimiento */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <span className="font-semibold">{followStatsLoading ? '...' : followersCount}</span>
                  <span className="text-muted-foreground">seguidores</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-semibold">{followStatsLoading ? '...' : followingCount}</span>
                  <span className="text-muted-foreground">siguiendo</span>
                </div>
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
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Publicaciones del usuario */}
      <UserFeedSection 
        feedItems={combinedFeed}
        loading={feedLoading}
        hasMore={hasMore}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={loadMorePosts}
        onPostDeleted={handlePostDeleted}
        onPostUpdated={handlePostUpdated}
      />
    </div>
  );
};

export default PublicProfile;
