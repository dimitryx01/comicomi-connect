
import { useState } from 'react';
import { Clock, Users, Star, Heart, MessageCircle, Bookmark, Eye, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { UserLink } from '@/components/ui/UserLink';
import { RecipeOptionsMenu } from './RecipeOptionsMenu';
import { RecipeComments } from './RecipeComments';
import { useRecipeCheers } from '@/hooks/useRecipeCheers';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface RecipeCardProps {
  id: string;
  title: string;
  author: string;
  authorUsername: string;
  authorAvatar?: string | null;
  authorId: string;
  image?: string;
  prepTime: number;
  difficulty: string;
  rating: number;
  saves: number;
  cheersCount: number;
  hasVideo: boolean;
  onRecipeDeleted?: () => void;
  onRecipeEdit?: (recipeId: string) => void;
}

const RecipeCard = ({ 
  id, 
  title, 
  author, 
  authorUsername, 
  authorAvatar, 
  authorId,
  image, 
  prepTime, 
  difficulty, 
  rating, 
  saves, 
  cheersCount: initialCheersCount,
  hasVideo,
  onRecipeDeleted,
  onRecipeEdit
}: RecipeCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const { cheersCount, hasCheered, toggleCheer, loading: cheersLoading } = useRecipeCheers(id);

  const handleCardClick = () => {
    navigate(`/recipe/${id}`);
  };

  const handleCheersClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCheer();
  };

  const handleCommentsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(!showComments);
  };

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'fácil':
      case 'facil':
        return 'bg-green-100 text-green-800';
      case 'medio':
        return 'bg-yellow-100 text-yellow-800';
      case 'difícil':
      case 'dificil':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div onClick={handleCardClick}>
        {/* Image Section */}
        <div className="relative h-48 bg-gray-200">
          {image ? (
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Eye className="h-12 w-12" />
            </div>
          )}
          
          {hasVideo && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-black/50 text-white">
                <Play className="h-3 w-3 mr-1" />
                Video
              </Badge>
            </div>
          )}
          
          <div className="absolute top-2 right-2" onClick={handleOptionsClick}>
            <RecipeOptionsMenu 
              recipeId={id} 
              authorId={authorId} 
              onDelete={onRecipeDeleted}
              onEdit={onRecipeEdit}
            />
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Recipe Info */}
        <div onClick={handleCardClick}>
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-2 flex-1">{title}</h3>
            <Badge className={`ml-2 ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </Badge>
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-2 mb-3">
            <UserLink username={authorUsername}>
              <AvatarWithSignedUrl
                fileId={authorAvatar}
                fallbackText={author}
                size="sm"
              />
            </UserLink>
            <UserLink username={authorUsername}>
              <span className="text-sm text-muted-foreground hover:text-foreground">
                {author}
              </span>
            </UserLink>
          </div>

          {/* Recipe Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {prepTime} min
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              {rating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className="h-4 w-4" />
              {saves}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCheersClick}
              disabled={cheersLoading}
              className={`${hasCheered ? 'text-red-500' : 'text-muted-foreground'}`}
            >
              <Heart className={`h-4 w-4 mr-1 ${hasCheered ? 'fill-current' : ''}`} />
              {cheersCount}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCommentsClick}
              className="text-muted-foreground"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Comentarios
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            <RecipeComments recipeId={id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
