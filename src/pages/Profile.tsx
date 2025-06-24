
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserFeed } from '@/hooks/useUserFeed';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { UserFeedSection } from '@/components/profile/UserFeedSection';
import EditInterestsDialog from '@/components/profile/EditInterestsDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Users, Heart, MessageCircle, Settings, Edit } from 'lucide-react';
import { useState } from 'react';

export default function Profile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const [showEditInterests, setShowEditInterests] = useState(false);

  // Usar el hook del feed del usuario
  const { 
    combinedFeed, 
    loading: feedLoading, 
    refreshFeed,
    isEmpty,
    postsCount,
    sharedPostsCount
  } = useUserFeed(userId);

  console.log('🎨 Profile: Componente Profile renderizado:', {
    userId,
    currentUserId: user?.id,
    isOwnProfile: !userId || userId === user?.id,
    profileExists: !!profile,
    feedItemsCount: combinedFeed.length,
    postsCount,
    sharedPostsCount,
    profileLoading,
    feedLoading
  });

  // Mostrar skeleton loading mientras se carga el perfil
  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no se encuentra el perfil
  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Usuario no encontrado
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            El perfil que buscas no existe o no está disponible.
          </p>
        </div>
      </div>
    );
  }

  const isOwnProfile = !userId || userId === user?.id;
  const displayName = profile.full_name || profile.first_name || 'Usuario';

  const handlePostDeleted = (postId: string) => {
    console.log('🗑️ Profile: Post eliminado del feed:', postId);
    refreshFeed();
  };

  const handlePostUpdated = (postId: string) => {
    console.log('🔄 Profile: Post actualizado en feed:', postId);
    refreshFeed();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header del perfil */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar y info básica */}
            <div className="flex flex-col items-center md:items-start">
              <AvatarWithSignedUrl 
                fileId={profile.avatar_url} 
                fallbackText={displayName}
                size="xl"
                className="mb-4"
              />
              {isOwnProfile && (
                <Button variant="outline" size="sm" className="mb-2">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar perfil
                </Button>
              )}
            </div>

            {/* Información del usuario */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {displayName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">@{profile.username}</p>
              </div>

              {profile.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Información adicional */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                {profile.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profile.location}
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Miembro desde {new Date(profile.created_at).toLocaleDateString('es-ES', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </div>
              </div>

              {/* Estadísticas */}
              <div className="flex gap-6 mb-4">
                <div className="text-center">
                  <div className="font-bold text-lg">{postsCount}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">{sharedPostsCount}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Compartidos</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Seguidores</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Siguiendo</div>
                </div>
              </div>

              {/* Intereses */}
              {profile.interests && profile.interests.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Intereses</h3>
                    {isOwnProfile && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowEditInterests(true)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <Badge key={interest.id} variant="secondary">
                        {interest.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferencias culinarias */}
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {profile.cooking_level && (
                  <div>
                    <span className="font-medium">Nivel de cocina:</span> {profile.cooking_level}
                  </div>
                )}
                {profile.dietary_restrictions && profile.dietary_restrictions.length > 0 && (
                  <div>
                    <span className="font-medium">Restricciones:</span> {profile.dietary_restrictions.join(', ')}
                  </div>
                )}
                {profile.favorite_cuisines && profile.favorite_cuisines.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="font-medium">Cocinas favoritas:</span> {profile.favorite_cuisines.join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Feed del usuario */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {isOwnProfile ? 'Mis publicaciones' : `Publicaciones de ${displayName}`}
        </h2>
        
        <UserFeedSection 
          feedItems={combinedFeed}
          loading={feedLoading}
          onPostDeleted={handlePostDeleted}
          onPostUpdated={handlePostUpdated}
        />
      </div>

      {/* Dialog para editar intereses */}
      <EditInterestsDialog
        open={showEditInterests}
        onOpenChange={setShowEditInterests}
        currentInterests={profile.interests?.map(i => i.id) || []}
      />
    </div>
  );
}
