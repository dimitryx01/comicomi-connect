
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSharedPosts } from '@/hooks/useSharedPosts';

interface EditSharedPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sharedPostId: string;
  currentComment: string;
  onSuccess?: () => void;
}

export const EditSharedPostDialog = ({
  open,
  onOpenChange,
  sharedPostId,
  currentComment,
  onSuccess
}: EditSharedPostDialogProps) => {
  const [comment, setComment] = useState(currentComment || '');
  const { updateSharedPost, loading } = useSharedPosts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 EditSharedPostDialog: Actualizando publicación compartida:', {
      sharedPostId,
      comment
    });

    const success = await updateSharedPost(sharedPostId, comment);
    
    if (success) {
      onOpenChange(false);
      onSuccess?.();
      console.log('✅ EditSharedPostDialog: Publicación compartida actualizada exitosamente');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar publicación compartida</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Comentario (opcional)
            </label>
            <Textarea
              id="comment"
              placeholder="Añade un comentario a tu publicación compartida..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
