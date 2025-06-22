
import { useState } from 'react';
import { MoreHorizontal, Edit, Flag, Bookmark, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PostOptionsMenuProps {
  postId: string;
  authorId: string;
  currentUserId?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onSave?: () => void;
  onReport?: () => void;
}

export const PostOptionsMenu = ({
  postId,
  authorId,
  currentUserId,
  onEdit,
  onDelete,
  onSave,
  onReport
}: PostOptionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const isAuthor = currentUserId === authorId;

  console.log('📋 PostOptionsMenu: Renderizando menú de opciones:', {
    postId,
    authorId,
    currentUserId,
    isAuthor,
    hasEditHandler: !!onEdit,
    hasDeleteHandler: !!onDelete,
    hasSaveHandler: !!onSave,
    hasReportHandler: !!onReport
  });

  const handleEdit = () => {
    console.log('🖊️ PostOptionsMenu: Ejecutando edición para post:', postId);
    onEdit?.();
    setIsOpen(false);
  };

  const handleDelete = () => {
    console.log('🗑️ PostOptionsMenu: Ejecutando eliminación para post:', postId);
    onDelete?.();
    setIsOpen(false);
  };

  const handleSave = () => {
    console.log('💾 PostOptionsMenu: Ejecutando guardado para post:', postId);
    onSave?.();
    setIsOpen(false);
    toast({
      title: "Post guardado",
      description: "El post se ha guardado en tus favoritos",
    });
  };

  const handleReport = () => {
    console.log('🚩 PostOptionsMenu: Ejecutando reporte para post:', postId);
    onReport?.();
    setIsOpen(false);
    toast({
      title: "Reporte enviado",
      description: "Hemos recibido tu reporte y lo revisaremos pronto",
    });
  };

  // Si no hay handlers disponibles, no mostrar el menú
  const hasAnyOption = onEdit || onDelete || onSave || onReport;
  
  if (!hasAnyOption) {
    console.log('⚠️ PostOptionsMenu: No hay opciones disponibles, ocultando menú');
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-accent"
          aria-label="Opciones del post"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Opciones para el autor/dueño */}
        {isAuthor && onEdit && (
          <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
        )}
        
        {isAuthor && onDelete && (
          <DropdownMenuItem
            onClick={handleDelete}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        )}
        
        {/* Separador si hay opciones de autor y opciones generales */}
        {isAuthor && (onEdit || onDelete) && (onSave || onReport) && (
          <DropdownMenuSeparator />
        )}
        
        {/* Opciones para todos los usuarios */}
        {onSave && (
          <DropdownMenuItem onClick={handleSave} className="cursor-pointer">
            <Bookmark className="mr-2 h-4 w-4" />
            Guardar en favoritos
          </DropdownMenuItem>
        )}
        
        {onReport && (
          <DropdownMenuItem onClick={handleReport} className="cursor-pointer">
            <Flag className="mr-2 h-4 w-4" />
            Denunciar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
