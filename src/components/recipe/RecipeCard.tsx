
import { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, ChefHat, Eye, PlayCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRecipeActions } from "@/hooks/useRecipeActions";
import { useToast } from "@/hooks/use-toast";
import { CheersIcon } from "@/components/post/CheersIcon";
import { SaveButton } from "@/components/ui/SaveButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface RecipeCardProps {
  id: string;
  title: string;
  author: string;
  authorUsername: string;
  authorAvatar?: string;
  authorId: string;
  image?: string;
  prepTime: number;
  difficulty: string;
  rating: number;
  saves: number;
  cheersCount: number;
  hasVideo?: boolean;
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
  image = "/placeholder.svg",
  prepTime,
  difficulty,
  rating,
  saves,
  cheersCount,
  hasVideo = false,
  onRecipeDeleted,
  onRecipeEdit
}: RecipeCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deleteRecipe } = useRecipeActions();
  const { toast } = useToast();

  const isOwner = user && user.id === authorId;

  const handleViewRecipe = () => {
    navigate(`/recipe/${id}`);
  };

  const handleEditRecipe = () => {
    if (onRecipeEdit) {
      onRecipeEdit(id);
    }
  };

  const handleDeleteRecipe = async () => {
    if (!user || user.id !== authorId) {
      toast({
        title: "Error",
        description: "No tienes permisos para eliminar esta receta",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    try {
      const success = await deleteRecipe(id);
      if (success && onRecipeDeleted) {
        onRecipeDeleted();
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'fácil':
        return 'bg-green-100 text-green-800';
      case 'medio':
        return 'bg-yellow-100 text-yellow-800';
      case 'difícil':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {hasVideo && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-black/50 text-white">
              <PlayCircle className="h-3 w-3 mr-1" />
              Video
            </Badge>
          </div>
        )}
        
        <div className="absolute top-2 left-2">
          <Badge className={getDifficultyColor(difficulty)}>
            {difficulty}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Avatar className="h-6 w-6">
                <AvatarImage src={authorAvatar} />
                <AvatarFallback className="text-xs">
                  {author.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{author}</span>
            </div>
          </div>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditRecipe}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDeleteRecipe}
                  disabled={isDeleting}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{prepTime} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <ChefHat className="h-4 w-4" />
              <span>{saves} guardadas</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <CheersIcon className="h-4 w-4" />
            <span>{cheersCount}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button onClick={handleViewRecipe} className="flex-1 mr-2">
            <Eye className="h-4 w-4 mr-2" />
            Ver receta
          </Button>
          
          <SaveButton
            contentId={id}
            contentType="recipe"
            authorId={authorId}
            variant="outline"
            showText={false}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
