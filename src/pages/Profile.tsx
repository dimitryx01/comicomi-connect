import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar, Settings, LogOut, User, Edit, RefreshCw, Plus, PenTool } from "lucide-react";
import CreatePostForm from '@/components/post/CreatePostForm';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserFeed } from '@/hooks/useUserFeed';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import EditInterestsDialog from '@/components/profile/EditInterestsDialog';
import { UserFeedSection } from '@/components/profile/UserFeedSection';
import { useIntelligentPreload } from '@/hooks/useIntelligentPreload';

const Profile = () => {
  const [showEditInterests, setShowEditInterests] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const { profile, loading: profileLoading } = useUserProfile();
  const { 
    combinedFeed, 
    loading: feedLoading, 
    refreshFeed, 
    isEmpty,
    postsCount,
    sharedPostsCount 
  } = useUserFeed();

  console.log('👤 Profile: Renderizado con estado:', {
    userId: user?.id,
    profileLoaded: !!profile,
    profileLoading,
    feedItemsCount: combinedFeed.length,
    feedLoading,
    postsCount,
    sharedPostsCount,
    hasInitialized
  });

  // Solo ejecutar el refresh inicial una vez cuando el perfil esté cargado
  useEffect(() => {
    if (profile && !hasInitialized && !feedLoading) {
      console.log('👤 Profile: Inicializando feed por primera vez...');
      setHasInitialized(true);
      refreshFeed();
    }
  }, [profile, hasInitialized, feedLoading, refreshFeed]);

  // Preparar datos para precarga inteligente del feed del usuario
  const userFeedDataForPreload = combinedFeed.map(item => {
    if (item.type === 'post') {
      const post = item.data as any;
      return {
        images: post.media_urls?.images || [],
        videos: post.media_urls?.videos || [],
        authorAvatar: profile?.avatar_url
      };
    } else {
      const sharedPost = item.data as any;
      return {
        images: sharedPost.original_content?.media_urls?.images || [],
        videos: sharedPost.original_content?.media_urls?.videos || [],
        authorAvatar: profile?.avatar_url
      };
    }
  });

  // Hook de precarga inteligente para el perfil
  const { getCacheMetrics, preloadUserAvatars } = useIntelligentPreload(userFeedDataForPreload, {
    enabled: !feedLoading && combinedFeed.length > 0,
    preloadDistance: 10, // Menor distancia en perfil
    priorityThreshold: 3
  });

  // Precargar avatar del usuario actual
  useEffect(() => {
    if (profile?.id) {
      preloadUserAvatars([profile.id]);
    }
  }, [profile?.id, preloadUserAvatars]);

  const handleLogout = useCallback(() => {
    logout();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente."
    });
  }, [logout, toast]);

  const handleRefreshFeed = useCallback(() => {
    console.log('🔄 Profile: Refresh manual solicitado...');
    refreshFeed();
    toast({
      title: "Actualizando",
      description: "Refrescando tu contenido...",
    });
  }, [refreshFeed, toast]);

  const handlePostCreated = useCallback(() => {
    console.log('📝 Profile: Post creado, cerrando dialog y refrescando...');
    setShowCreatePost(false);
    refreshFeed();
    toast({
      title: "¡Éxito!",
      description: "Post creado correctamente"
    });
  }, [refreshFeed, toast]);

  const handlePostDeleted = useCallback((postId: string) => {
    console.log('🗑️ Profile: Post eliminado, refrescando feed:', postId);
    refreshFeed();
  }, [refreshFeed]);

  const handlePostUpdated = useCallback((postId: string) => {
    console.log('✏️ Profile: Post actualizado, refrescando feed:', postId);
    refreshFeed();
  }, [refreshFeed]);

  if (profileLoading) {
    console.log('⏳ Profile: Mostrando loading del perfil...');
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Cargando perfil...</p>
      </div>
    );
  }

  if (!profile) {
    console.log('❌ Profile: Perfil no encontrado');
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h2 className="text-2xl font-medium mb-2">Perfil no encontrado</h2>
        <p className="text-muted-foreground text-center">
          Parece que tu perfil no está completo. Completa el proceso de onboarding.
        </p>
        <Button asChild>
          <Link to="/onboarding">Completar perfil</Link>
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('es-ES', {
      month: 'long',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const getCookingLevelLabel = (level: string) => {
    const levels = {
      'beginner': 'Principiante',
      'intermediate': 'Intermedio', 
      'advanced': 'Avanzado',
      'expert': 'Experto'
    };
    return levels[level as keyof typeof levels] || level;
  };

  // Función para mostrar métricas del cache en desarrollo
  const logCacheMetrics = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      const metrics = getCacheMetrics();
      console.log('📊 Profile: Métricas del cache unificado:', metrics);
    }
  }, [getCacheMetrics]);

  // Log de métricas cada 30 segundos en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(logCacheMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [logCacheMetrics]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative mb-6">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-r from-primary/30 to-primary/10"></div>

        {/* Profile Info */}
        <div className="relative flex flex-col md:flex-row md:items-end px-4 -mt-16 md:-mt-20">
          <AvatarWithSignedUrl 
            fileId={profile.avatar_url}
            fallbackText={profile.full_name}
            size="xl"
            className="h-32 w-32 border-4 border-background"
          />
          
          <div className="flex-1 mt-4 md:mt-0 md:ml-6 md:pb-4">
            <h1 className="text-2xl font-bold">{profile.full_name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>
          
          <div className="mt-4 md:mt-0 md:pb-4 flex space-x-3">
            <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
              <DialogTrigger asChild>
                <Button className="rounded-full">
                  <PenTool className="h-4 w-4 mr-2" />
                  Crear Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <CreatePostForm onSuccess={handlePostCreated} />
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Editar Perfil
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-1 border-none shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h2 className="font-medium">Sobre mí</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {profile.bio || 'No hay biografía disponible'}
                </p>
              </div>
              
              {profile.location && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Miembro desde {formatDate(profile.created_at)}</span>
              </div>

              {profile.cooking_level && (
                <div>
                  <h3 className="font-medium text-sm">Nivel de cocina</h3>
                  <p className="text-sm text-muted-foreground">
                    {getCookingLevelLabel(profile.cooking_level)}
                  </p>
                </div>
              )}

              {profile.dietary_restrictions && profile.dietary_restrictions.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm">Restricciones dietéticas</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.dietary_restrictions.map((restriction) => (
                      <span 
                        key={restriction}
                        className="text-xs bg-secondary px-2 py-1 rounded-full"
                      >
                        {restriction}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profile.favorite_cuisines && profile.favorite_cuisines.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm">Cocinas favoritas</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.favorite_cuisines.map((cuisine) => (
                      <span 
                        key={cuisine}
                        className="text-xs bg-secondary px-2 py-1 rounded-full"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">Intereses culinarios</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowEditInterests(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
                {profile.interests && profile.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {profile.interests.map((interest) => (
                      <span 
                        key={interest.id}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                      >
                        {interest.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No tienes intereses seleccionados. Haz clic en editar para agregar algunos.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h2 className="font-medium mb-4">Estadísticas</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Seguidores</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Siguiendo</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{postsCount}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{sharedPostsCount}</p>
                  <p className="text-sm text-muted-foreground">Compartidos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="posts">Publicaciones</TabsTrigger>
              <TabsTrigger value="reviews">Reseñas</TabsTrigger>
              <TabsTrigger value="saved">Guardados</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Mis Publicaciones</h3>
                <div className="flex gap-2">
                  <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <CreatePostForm onSuccess={handlePostCreated} />
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRefreshFeed}
                    disabled={feedLoading}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${feedLoading ? 'animate-spin' : ''}`} />
                    Actualizar
                  </Button>
                </div>
              </div>
              
              {!isEmpty || feedLoading ? (
                <UserFeedSection
                  feedItems={combinedFeed}
                  loading={feedLoading}
                  onPostDeleted={handlePostDeleted}
                  onPostUpdated={handlePostUpdated}
                />
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">No tienes publicaciones aún.</p>
                  <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Crear tu primera publicación
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <CreatePostForm onSuccess={handlePostCreated} />
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="text-center py-10">
                <p className="text-muted-foreground">No tienes reseñas aún.</p>
                <Button className="mt-4" asChild>
                  <Link to="/discover">Descubrir Restaurantes</Link>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="saved" className="mt-6">
              <div className="text-center py-10">
                <p className="text-muted-foreground">No tienes contenido guardado aún.</p>
                <Button className="mt-4" asChild>
                  <Link to="/feed">Explorar Feed</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <EditInterestsDialog 
        open={showEditInterests}
        onOpenChange={setShowEditInterests}
        currentInterests={profile.interests?.map(i => i.id) || []}
      />
    </div>
  );
};

export default Profile;
