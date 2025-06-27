
import { MoreVertical, Edit, Trash2, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface RecipeOptionsMenuProps {
  recipeId: string;
  authorId: string;
  onDelete?: () => void;
  onEdit?: (recipeId: string) => void;
}

export const RecipeOptionsMenu = ({ recipeId, authorId, onDelete, onEdit }: RecipeOptionsMenuProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.id === authorId;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    if (!user || user.id !== authorId) {
      toast.error('No tienes permisos para editar esta receta');
      return;
    }
    
    if (onEdit) {
      onEdit(recipeId);
    } else {
      toast.info('Función de editar próximamente');
    }
  };

  const handleDelete = async () => {
    if (!user || user.id !== authorId) {
      toast.error('No tienes permisos para eliminar esta receta');
      return;
    }

    setIsDeleting(true);

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

      toast.success('Receta eliminada exitosamente');
      setIsDeleteDialogOpen(false);
      onDelete?.();
      
      // If we're on the recipe detail page, navigate back to recipes
      if (window.location.pathname.includes('/recipe/')) {
        navigate('/recipes');
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast.error('Error al eliminar la receta');
    } finally {
      setIsDeleting(false);
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
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente esta receta y todos sus datos asociados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete} 
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
