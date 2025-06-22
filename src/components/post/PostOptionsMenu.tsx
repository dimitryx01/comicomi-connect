
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
  
  // ANÁLISIS CRÍTICO: Verificar si authorId está definido y hacer comparación
  const isAuthor = currentUserId && authorId && String(currentUserId) === String(authorId);

  console.log('📋 PostOptionsMenu: ANÁLISIS CRÍTICO DE PROPS RECIBIDAS:', {
    postId,
    authorId,
    currentUserId,
    authorIdType: typeof authorId,
    currentUserIdType: typeof currentUserId,
    authorIdDefined: authorId !== undefined && authorId !== null,
    currentUserIdDefined: currentUserId !== undefined && currentUserId !== null,
    rawComparison: currentUserId === authorId,
    stringComparison: String(currentUserId) === String(authorId),
    isAuthor,
    hasEditHandler: !!onEdit,
    hasDeleteHandler: !!onDelete,
    hasSaveHandler: !!onSave,
    hasReportHandler: !!onReport
  });

  // Verificar si authorId está undefined
  if (!authorId) {
    console.error('❌ PostOptionsMenu: AUTHOR_ID ES UNDEFINED - Esto es el problema principal:', {
      postId,
      authorId,
      propsReceived: { postId, authorId, currentUserId, onEdit: !!onEdit, onDelete: !!onDelete, onSave: !!onSave, onReport: !!onReport }
    });
  }

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

  // El menú siempre debe mostrarse si hay al menos una opción disponible
  const hasAnyOption = onEdit || onDelete || onSave || onReport;
  
  if (!hasAnyOption) {
    console.log('⚠️ PostOptionsMenu: No hay opciones disponibles, ocultando menú');
    return null;
  }

  // Contar opciones que se mostrarán
  const optionsToShow = {
    edit: isAuthor && !!onEdit,
    delete: isAuthor && !!onDelete,
    save: !!onSave,
    report: !!onReport
  };

  console.log('👁️ PostOptionsMenu: OPCIONES FINALES QUE SE MOSTRARÁN:', {
    ...optionsToShow,
    totalOptionsToShow: Object.values(optionsToShow).filter(Boolean).length,
    isAuthorCalculation: isAuthor,
    authorIdStatus: authorId ? 'DEFINED' : 'UNDEFINED',
    currentUserIdStatus: currentUserId ? 'DEFINED' : 'UNDEFINED'
  });

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
      <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50">
        {/* Opciones para el autor/dueño */}
        {optionsToShow.edit && (
          <DropdownMenuItem onClick={handleEdit} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
        )}
        
        {optionsToShow.delete && (
          <DropdownMenuItem
            onClick={handleDelete}
            className="cursor-pointer text-destructive focus:text-destructive hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        )}
        
        {/* Separador si hay opciones de autor y opciones generales */}
        {(optionsToShow.edit || optionsToShow.delete) && (optionsToShow.save || optionsToShow.report) && (
          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
        )}
        
        {/* Opciones para todos los usuarios */}
        {optionsToShow.save && (
          <DropdownMenuItem onClick={handleSave} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
            <Bookmark className="mr-2 h-4 w-4" />
            Guardar en favoritos
          </DropdownMenuItem>
        )}
        
        {optionsToShow.report && (
          <DropdownMenuItem onClick={handleReport} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
            <Flag className="mr-2 h-4 w-4" />
            Denunciar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
