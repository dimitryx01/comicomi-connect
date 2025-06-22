
import { useState } from 'react';
import { MoreHorizontal, Edit, Flag, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CommentOptionsMenuProps {
  commentId: string;
  commentUserId: string;
  currentUserId?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}

export const CommentOptionsMenu = ({
  commentId,
  commentUserId,
  currentUserId,
  onEdit,
  onDelete,
  onReport
}: CommentOptionsMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const isOwner = currentUserId && commentUserId && String(currentUserId) === String(commentUserId);

  console.log('📋 CommentOptionsMenu:', {
    commentId,
    commentUserId,
    currentUserId,
    isOwner,
    hasEditHandler: !!onEdit,
    hasDeleteHandler: !!onDelete,
    hasReportHandler: !!onReport
  });

  const handleEdit = () => {
    console.log('🖊️ CommentOptionsMenu: Editando comentario:', commentId);
    onEdit?.();
    setIsOpen(false);
  };

  const handleDelete = () => {
    console.log('🗑️ CommentOptionsMenu: Eliminando comentario:', commentId);
    onDelete?.();
    setIsOpen(false);
  };

  const handleReport = () => {
    console.log('🚩 CommentOptionsMenu: Reportando comentario:', commentId);
    onReport?.();
    setIsOpen(false);
    toast({
      title: "Reporte enviado",
      description: "Hemos recibido tu reporte del comentario",
    });
  };

  // Verificar si hay opciones disponibles
  const hasOwnerOptions = isOwner && (onEdit || onDelete);
  const hasReportOption = !isOwner && onReport;
  
  if (!hasOwnerOptions && !hasReportOption) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Opciones del comentario"
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50">
        {/* Opciones para el propietario */}
        {isOwner && onEdit && (
          <DropdownMenuItem onClick={handleEdit} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
            <Edit className="mr-2 h-3 w-3" />
            Editar
          </DropdownMenuItem>
        )}
        
        {isOwner && onDelete && (
          <DropdownMenuItem
            onClick={handleDelete}
            className="cursor-pointer text-destructive focus:text-destructive hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 className="mr-2 h-3 w-3" />
            Eliminar
          </DropdownMenuItem>
        )}
        
        {/* Opción para reportar (solo si no es el propietario) */}
        {!isOwner && onReport && (
          <DropdownMenuItem onClick={handleReport} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
            <Flag className="mr-2 h-3 w-3" />
            Reportar comentario
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
