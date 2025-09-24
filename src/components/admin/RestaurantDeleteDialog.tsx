import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Restaurant {
  id: string;
  name: string;
  description: string;
}

interface RestaurantDeleteDialogProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const RestaurantDeleteDialog: React.FC<RestaurantDeleteDialogProps> = ({
  restaurant,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}) => {
  if (!restaurant) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Esta acción eliminará permanentemente el restaurante <strong>"{restaurant.name}"</strong> 
              y todos los datos asociados.
            </p>
            <p className="text-destructive font-medium">
              Esta acción no se puede deshacer.
            </p>
            <div className="bg-muted p-3 rounded-md mt-3">
              <p className="text-sm">
                <strong>Se eliminarán:</strong>
              </p>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>• Información del restaurante</li>
                <li>• Imágenes asociadas</li>
                <li>• Relaciones con tipos de cocina</li>
                <li>• Referencias en posts y reseñas</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Eliminando...' : 'Eliminar Restaurante'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};