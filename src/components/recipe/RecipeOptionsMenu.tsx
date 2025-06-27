
import { MoreVertical, Edit, Trash2, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface RecipeOptionsMenuProps {
  recipeId: string;
  authorId: string;
  onDelete?: () => void;
}

export const RecipeOptionsMenu = ({ recipeId, authorId, onDelete }: RecipeOptionsMenuProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.id === authorId;

  const handleEdit = () => {
    // TODO: Implement edit functionality
    toast.info('Función de editar próximamente');
  };

  const handleDelete = async () => {
    if (!user || user.id !== authorId) {
      toast.error('No tienes permisos para eliminar esta receta');
      return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId)
        .eq('author_id', user.id); // Extra security check

      if (error) {
        console.error('Error deleting recipe:', error);
        toast.error('Error al eliminar la receta');
        return;
      }

      toast.success('Receta eliminada');
      onDelete?.();
      navigate('/recipes');
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast.error('Error al eliminar la receta');
    }
  };

  const handleReport = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para denunciar');
      return;
    }

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          recipe_id: recipeId,
          reporter_id: user.id,
          reported_user_id: authorId,
          report_type: 'inappropriate_content',
          description: 'Contenido inapropiado reportado desde la interfaz'
        });

      if (error) {
        console.error('Error reporting recipe:', error);
        toast.error('Error al enviar la denuncia');
        return;
      }

      toast.success('Denuncia enviada. Será revisada por nuestro equipo.');
    } catch (error) {
      console.error('Error in handleReport:', error);
      toast.error('Error al enviar la denuncia');
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isOwner ? (
          <>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem onClick={handleReport}>
            <Flag className="mr-2 h-4 w-4" />
            Denunciar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
