
import { Clock, Star, Bookmark, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LazyImage } from '@/components/ui/LazyImage';

interface RecipeCardProps {
  id: string;
  title: string;
  author: string;
  image: string;
  prepTime: number;
  difficulty: string;
  rating: number;
  saves: number;
}

const RecipeCard = ({ title, author, image, prepTime, difficulty, rating, saves }: RecipeCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      <div className="relative">
        <LazyImage 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
            <Bookmark className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <Badge className="absolute bottom-2 left-2" variant="secondary">
          {difficulty}
        </Badge>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">{author.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{author}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {prepTime} min
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {rating}
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
