
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { MapPin, Calendar, Settings, LogOut, User, Edit } from "lucide-react";
import PostCard from '@/components/post/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { usePosts } from '@/hooks/usePosts';
import EditInterestsDialog from '@/components/profile/EditInterestsDialog';

const Profile = () => {
  const [showEditInterests, setShowEditInterests] = useState(false);
  const { logout, user } = useAuth();
  const { toast } = useToast();
  const { profile, loading } = useUserProfile();
  const { posts } = usePosts();

  // Filtrar posts del usuario actual
  const userPosts = posts.filter(post => post.author_id === user?.id);

  const handleLogout = () => {
    logout();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente."
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Cargando perfil...</p>
      </div>
    );
  }

  if (!profile) {
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative mb-6">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-r from-primary/30 to-primary/10"></div>

        {/* Profile Info */}
        <div className="relative flex flex-col md:flex-row md:items-end px-4 -mt-16 md:-mt-20">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
            <AvatarFallback>
              <User className="h-16 w-16" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 mt-4 md:mt-0 md:ml-6 md:pb-4">
            <h1 className="text-2xl font-bold">{profile.full_name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
          </div>
          
          <div className="mt-4 md:mt-0 md:pb-4 flex space-x-3">
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

              {profile.interests && profile.interests.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Intereses culinarios</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowEditInterests(true)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.interests.map((interest) => (
                      <span 
                        key={interest.id}
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                      >
                        {interest.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
                  <p className="text-2xl font-bold">{userPosts.length}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Reseñas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="reviews">Reseñas</TabsTrigger>
              <TabsTrigger value="saved">Guardados</TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-6">
              {userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <PostCard 
                      key={post.id} 
                      id={post.id}
                      user={{
                        id: post.author_id,
                        name: post.author_name,
                        username: post.author_username,
                        avatar: post.author_avatar
                      }}
                      content={post.content}
                      imageUrl={post.media_urls?.[0]?.url || null}
                      likes={post.cheers_count}
                      comments={post.comments_count}
                      createdAt={post.created_at}
                      isLiked={false}
                      restaurant={post.restaurant_id ? {
                        id: post.restaurant_id,
                        name: post.restaurant_name
                      } : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No tienes posts aún.</p>
                  <Button className="mt-4" asChild>
                    <Link to="/create">Crear Post</Link>
                  </Button>
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
