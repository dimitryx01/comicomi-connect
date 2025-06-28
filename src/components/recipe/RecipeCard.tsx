
import { useState } from 'react';
import { Clock, Users, Star, Heart, MessageCircle, Bookmark, Eye, Play, ChefHat } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { UserLink } from '@/components/ui/UserLink';
import { RecipeOptionsMenu } from './RecipeOptionsMenu';
import { RecipeComments } from './RecipeComments';
import { SaveButton } from '@/components/ui/SaveButton';
import { useRecipeCheers } from '@/hooks/useRecipeCheers';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
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
  const { toggleSave, isSaved } = useSavedRecipes();

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
    e.preventDefault();
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave(id);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'fácil':
      case 'facil':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'medio':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'difícil':
      case 'dificil':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // No mostrar botón de guardar si es la propia receta del usuario
  const showSaveButton = user && authorId && user.id !== authorId;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-sm bg-white">
      <div onClick={handleCardClick}>
        {/* Image Section with Overlay */}
        <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {image ? (
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
              <ChefHat className="h-16 w-16" />
            </div>
          )}
          
          {/* Video Badge */}
          {hasVideo && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-black/80 text-white border-0 backdrop-blur-sm">
                <Play className="h-3 w-3 mr-1" />
                Video
              </Badge>
            </div>
          )}
          
          {/* Difficulty Badge */}
          <div className="absolute top-3 right-12">
            <Badge className={`${getDifficultyColor(difficulty)} border backdrop-blur-sm font-medium`}>
              {difficulty}
            </Badge>
          </div>
          
          {/* Options Menu */}
          <div className="absolute top-3 right-3" onClick={handleOptionsClick}>
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm">
              <RecipeOptionsMenu 
                recipeId={id} 
                authorId={authorId} 
                onDelete={onRecipeDeleted}
                onEdit={onRecipeEdit}
              />
            </div>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Recipe Title */}
        <div onClick={handleCardClick}>
          <h3 className="font-bold text-xl text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-3">
          <UserLink username={authorUsername}>
            <AvatarWithSignedUrl
              fileId={authorAvatar}
              fallbackText={author}
              size="sm"
              className="ring-2 ring-white shadow-sm"
            />
          </UserLink>
          <div className="flex-1">
            <UserLink username={authorUsername}>
              <span className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                {author}
              </span>
            </UserLink>
          </div>
        </div>

        {/* Recipe Stats */}
        <div onClick={handleCardClick}>
          <div className="flex items-center justify-between text-sm text-gray-600 py-2 px-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{prepTime} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-amber-500 fill-current" />
              <span className="font-medium">{rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{saves}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCheersClick}
            disabled={cheersLoading}
            className={`${hasCheered ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-600 hover:text-red-500 hover:bg-red-50'} transition-all duration-200 rounded-full px-4`}
          >
            <Heart className={`h-4 w-4 mr-2 ${hasCheered ? 'fill-current' : ''}`} />
            <span className="font-medium">{cheersCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCommentsClick}
            className="text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 rounded-full px-4"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            <span className="font-medium">Comentarios</span>
          </Button>

          {showSaveButton && (
            <div onClick={handleSaveClick}>
              <SaveButton
                isSaved={isSaved(id)}
                onToggle={() => toggleSave(id)}
              />
            </div>
          )}
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <RecipeComments recipeId={id} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
