
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Check, 
  Plus, 
  Archive,
  RotateCcw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ShoppingListItem {
  id: string;
  ingredient_name: string;
  quantity: string | null;
  unit: string | null;
  is_checked: boolean;
}

interface ShoppingListCardProps {
  id: string;
  title: string;
  isCompleted: boolean;
  items: ShoppingListItem[];
  onUpdateTitle: (listId: string, newTitle: string) => void;
  onToggleCompletion: (listId: string, completed: boolean) => void;
  onDelete: (listId: string) => void;
  onAddItem: (listId: string, name: string, quantity?: string, unit?: string) => void;
  onToggleItem: (itemId: string, checked: boolean) => void;
  onDeleteItem: (itemId: string) => void;
}

export const ShoppingListCard = ({
  id,
  title,
  isCompleted,
  items,
  onUpdateTitle,
  onToggleCompletion,
  onDelete,
  onAddItem,
  onToggleItem,
  onDeleteItem
}: ShoppingListCardProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const checkedItems = items.filter(item => item.is_checked).length;
  const totalItems = items.length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  const handleTitleSave = () => {
    if (editedTitle.trim() && editedTitle !== title) {
      onUpdateTitle(id, editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleAddItem = () => {
    if (newItemName.trim()) {
      onAddItem(
        id, 
        newItemName.trim(), 
        newItemQuantity.trim() || undefined,
        newItemUnit.trim() || undefined
      );
      setNewItemName('');
      setNewItemQuantity('');
      setNewItemUnit('');
      setShowAddItem(false);
    }
  };

  const handleDeleteConfirm = () => {
    onDelete(id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className={`${isCompleted ? 'opacity-75' : ''}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {isEditingTitle ? (
                <div className="flex gap-2">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTitleSave()}
                    className="text-lg font-semibold"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleTitleSave}>
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <CardTitle className="text-lg flex items-center gap-2">
                  {title}
                  {isCompleted && <Badge variant="secondary">Finalizada</Badge>}
                </CardTitle>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span>{checkedItems}/{totalItems} elementos</span>
                {!isCompleted && (
                  <div className="flex-1 max-w-32">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar título
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onToggleCompletion(id, !isCompleted)}
                >
                  {isCompleted ? (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reactivar lista
                    </>
                  ) : (
                    <>
                      <Archive className="h-4 w-4 mr-2" />
                      Finalizar lista
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar lista
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Items list */}
          {items.length > 0 ? (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 group">
                  <Checkbox
                    checked={item.is_checked}
                    onCheckedChange={(checked) => onToggleItem(item.id, checked as boolean)}
                  />
                  <div className={`flex-1 ${item.is_checked ? 'line-through text-muted-foreground' : ''}`}>
                    <span className="font-medium">{item.ingredient_name}</span>
                    {(item.quantity || item.unit) && (
                      <span className="text-sm text-muted-foreground ml-2">
                        {item.quantity} {item.unit}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No hay elementos en esta lista
            </p>
          )}

          {/* Add new item */}
          {!isCompleted && (
            <>
              {showAddItem ? (
                <div className="space-y-2 p-3 border rounded-lg">
                  <Input
                    placeholder="Nombre del ingrediente"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Cantidad"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Unidad"
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddItem} size="sm" className="flex-1">
                      Agregar
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddItem(false)}
                      size="sm"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowAddItem(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar elemento
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar lista?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Esta acción no se puede deshacer. Se eliminará la lista "{title}" y todos sus elementos.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
