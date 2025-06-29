
import { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { OriginalContentImage } from './OriginalContentImage';
import { SharedPost } from '@/types/sharedPost';
import { useSharedPostInteractions } from '@/hooks/useSharedPostInteractions';
import { useAuth } from '@/contexts/AuthContext';
import { EditSharedPostDialog } from './EditSharedPostDialog';
import { useNavigate } from 'react-router-dom';

interface SharedPostCardProps {
  sharedPost: SharedPost;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: () => void;
}

export const SharedPostCard = ({ sharedPost, onPostDeleted, onPostUpdated }: SharedPostCardProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { 
    cheersCount, 
    hasCheered, 
    commentsCount, 
    loading, 
    toggleCheer 
  } = useSharedPostInteractions(sharedPost.id);

  const isOwnPost = user?.id === sharedPost.sharer_id;

  const handleOriginalContentClick = (e: React.MouseEvent) => {
    // Prevent event bubbling to avoid triggering parent click handlers
    e.stopPropagation();
    
    if (sharedPost.shared_type === 'post' && sharedPost.shared_post_id) {
      navigate(`/post/${sharedPost.shared_post_id}`);
    } else if (sharedPost.shared_type === 'recipe' && sharedPost.shared_recipe_id) {
      navigate(`/recipes/${sharedPost.shared_recipe_id}`);
    } else if (sharedPost.shared_type === 'restaurant' && sharedPost.shared_restaurant_id) {
      navigate(`/restaurants/${sharedPost.shared_restaurant_id}`);
    }
  };

  const renderOriginalContent = () => {
    if (!sharedPost.original_content) {
      return (
        <div className="text-center text-gray-500 py-4">
          <p>Contenido original no disponible</p>
        </div>
      );
    }

    const { original_content } = sharedPost;

    // Render based on shared type
    if (sharedPost.shared_type === 'post') {
      return (
        <div 
          className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={handleOriginalContentClick}
        >
          {/* Original Post Author */}
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={original_content.author?.avatar_url} />
              <AvatarFallback>
                {original_content.author?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{original_content.author?.full_name}</p>
              <p className="text-xs text-gray-500">@{original_content.author?.username}</p>
            </div>
          </div>

          {/* Original Post Content */}
          {original_content.content && (
            <p className="text-sm mb-3">{original_content.content}</p>
          )}

          {/* Original Post Media */}
          {original_content.media_urls?.images?.[0] && (
            <AspectRatio ratio={16/9} className="mb-3">
              <OriginalContentImage
                fileId={original_content.media_urls.images[0]}
                alt="Contenido original"
                className="object-cover w-full h-full rounded-lg"
              />
            </AspectRatio>
          )}

          {/* Original Post Location */}
          {original_content.location && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              <span>{original_content.location}</span>
            </div>
          )}
        </div>
      );
    }

    if (sharedPost.shared_type === 'recipe') {
      return (
        <div 
          className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={handleOriginalContentClick}
        >
          {/* Recipe Author */}
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={original_content.author?.avatar_url} />
              <AvatarFallback>
                {original_content.author?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{original_content.author?.full_name}</p>
              <p className="text-xs text-gray-500">@{original_content.author?.username}</p>
            </div>
          </div>

          {/* Recipe Content */}
          <h3 className="font-semibold mb-2">{original_content.title}</h3>
          {original_content.description && (
            <p className="text-sm text-gray-600 mb-3">{original_content.description}</p>
          )}

          {/* Recipe Image */}
          {original_content.image_url && (
            <AspectRatio ratio={16/9}>
              <OriginalContentImage
                fileId={original_content.image_url}
                alt={original_content.title}
                className="object-cover w-full h-full rounded-lg"
              />
            </AspectRatio>
          )}
        </div>
      );
    }

    if (sharedPost.shared_type === 'restaurant') {
      return (
        <div 
          className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={handleOriginalContentClick}
        >
          <h3 className="font-semibold mb-2">{original_content.name}</h3>
          {original_content.description && (
            <p className="text-sm text-gray-600 mb-3">{original_content.description}</p>
          )}

          {/* Restaurant Image */}
          {original_content.cover_image_url && (
            <AspectRatio ratio={16/9} className="mb-3">
              <OriginalContentImage
                fileId={original_content.cover_image_url}
                alt={original_content.name}
                className="object-cover w-full h-full rounded-lg"
              />
            </AspectRatio>
          )}

          {/* Restaurant Info */}
          <div className="space-y-1">
            {original_content.location && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                <span>{original_content.location}</span>
              </div>
            )}
            {original_content.cuisine_type && (
              <Badge variant="secondary" className="text-xs">
                {original_content.cuisine_type}
              </Badge>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Card className="w-full border-none shadow-sm overflow-hidden animate-scale-in mb-4">
        <CardHeader className="pb-3">
          {/* Sharer Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={sharedPost.sharer.avatar_url} />
                <AvatarFallback>
                  {sharedPost.sharer.full_name[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-sm">{sharedPost.sharer.full_name}</p>
                  <Badge variant="outline" className="text-xs">
                    Compartió {sharedPost.shared_type === 'post' ? 'una publicación' : 
                              sharedPost.shared_type === 'recipe' ? 'una receta' : 'un restaurante'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  @{sharedPost.sharer.username} · {formatDistanceToNow(new Date(sharedPost.created_at), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </p>
              </div>
            </div>

            {isOwnPost && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditDialog(true)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Sharer Comment */}
          {sharedPost.comment && (
            <div className="mt-3">
              <p className="text-sm">{sharedPost.comment}</p>
            </div>
          )}
        </CardHeader>

        <CardContent className="px-4 pb-4">
          {/* Original Content */}
          {renderOriginalContent()}

          {/* Interactions */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCheer}
                disabled={loading}
                className={`flex items-center space-x-1 ${hasCheered ? 'text-red-500' : 'text-gray-500'}`}
              >
                <Heart className={`h-4 w-4 ${hasCheered ? 'fill-current' : ''}`} />
                <span className="text-xs">{cheersCount}</span>
              </Button>

              <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-500">
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">{commentsCount}</span>
              </Button>

              <Button variant="ghost" size="sm" className="text-gray-500">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <Button variant="ghost" size="sm" className="text-gray-500">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {showEditDialog && (
        <EditSharedPostDialog
          sharedPost={sharedPost}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onPostDeleted={onPostDeleted}
          onPostUpdated={onPostUpdated}
        />
      )}
    </>
  );
};
