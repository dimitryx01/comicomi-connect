
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

  const handleEdit = () => {
    console.log('🖊️ PostOptionsMenu: Editando post:', postId);
    onEdit?.();
    setIsOpen(false);
  };

  const handleDelete = () => {
    console.log('🗑️ PostOptionsMenu: Eliminando post:', postId);
    onDelete?.();
    setIsOpen(false);
  };

  const handleSave = () => {
    console.log('💾 PostOptionsMenu: Guardando post:', postId);
    onSave?.();
    setIsOpen(false);
    toast({
      title: "Post guardado",
      description: "El post se ha guardado en tus favoritos",
    });
  };

  const handleReport = () => {
    console.log('🚩 PostOptionsMenu: Reportando post:', postId);
    onReport?.();
    setIsOpen(false);
    toast({
      title: "Reporte enviado",
      description: "Hemos recibido tu reporte y lo revisaremos pronto",
    });
  };

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
        {isAuthor && (
          <>
            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
              <Edit className="mr-2 h-4 w-4" />
              Editar post
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar post
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {!isAuthor && (
          <>
            <DropdownMenuItem onClick={handleSave} className="cursor-pointer">
              <Bookmark className="mr-2 h-4 w-4" />
              Guardar en favoritos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleReport} className="cursor-pointer">
              <Flag className="mr-2 h-4 w-4" />
              Denunciar post
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
