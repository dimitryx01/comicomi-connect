
import { Clock, Star, Bookmark, Heart, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { UserLink } from '@/components/ui/UserLink';
import { LazyImage } from '@/components/ui/LazyImage';
import { RecipeOptionsMenu } from './RecipeOptionsMenu';
import { useNavigate } from 'react-router-dom';
import { useRecipeCheers } from '@/hooks/useRecipeCheers';

interface RecipeCardProps {
  id: string;
  title: string;
  author: string;
  authorUsername: string;
  authorAvatar: string | null;
  authorId: string;
  image: string;
  prepTime: number;
  difficulty: string;
  rating?: number;
  saves: number;
  cheersCount: number;
  hasVideo?: boolean;
  onRecipeDeleted?: () => void;
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
  rating = 0, 
  saves,
  cheersCount: initialCheersCount,
  hasVideo = false,
  onRecipeDeleted
}: RecipeCardProps) => {
  const navigate = useNavigate();
  const { cheersCount, hasCheered, toggleCheer } = useRecipeCheers(id);

  const handleCardClick = () => {
    navigate(`/recipes/${id}`);
  };

  console.log('🎨 RecipeCard render:', {
    title,
    author,
    authorUsername,
    authorAvatar,
    hasAuthorData: !!authorUsername
  });

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
      <div className="relative" onClick={handleCardClick}>
        <LazyImage 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          {hasVideo && (
            <Badge className="bg-black/70 text-white flex items-center gap-1">
              <Play className="h-3 w-3" />
              Video
            </Badge>
          )}
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-8 w-8 p-0 opacity-80 hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="secondary" 
            className="h-8 w-8 p-0 opacity-80 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              toggleCheer();
            }}
          >
            <Heart className={`h-4 w-4 ${hasCheered ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>
        <div className="absolute top-2 left-2">
          <div onClick={(e) => e.stopPropagation()}>
            <RecipeOptionsMenu 
              recipeId={id} 
              authorId={authorId} 
              onDelete={onRecipeDeleted}
            />
          </div>
        </div>
        <Badge className="absolute bottom-2 left-2" variant="secondary">
          {difficulty}
        </Badge>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div onClick={handleCardClick}>
          <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
            {title}
          </h3>
          {/* Solo mostrar información del autor si tenemos username */}
          {authorUsername ? (
            <UserLink username={authorUsername} className="flex items-center gap-2 mt-2">
              <AvatarWithSignedUrl
                fileId={authorAvatar}
                fallbackText={author || authorUsername}
                size="sm"
              />
              <span className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {author || authorUsername}
              </span>
            </UserLink>
          ) : (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-500">?</span>
              </div>
              <span className="text-sm text-muted-foreground">
                Autor desconocido
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {prepTime} min
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {rating}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {cheersCount}
          </div>
          <div className="flex items-center gap-1">
            <Bookmark className="h-4 w-4" />
            {saves}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
