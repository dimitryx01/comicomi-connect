
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useShoppingLists } from '@/hooks/useShoppingLists';

interface Ingredient {
  name: string;
  quantity?: string;
  unit?: string;
}

interface AddToShoppingListButtonProps {
  recipeId: string;
  recipeName: string;
  ingredients: Ingredient[];
}

export const AddToShoppingListButton = ({
  recipeId,
  recipeName,
  ingredients
}: AddToShoppingListButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const { createOrUpdateListForRecipe } = useShoppingLists();

  const handleIngredientToggle = (ingredientName: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredientName)
        ? prev.filter(name => name !== ingredientName)
        : [...prev, ingredientName]
    );
  };

  const handleAddToShoppingList = async () => {
    if (selectedIngredients.length === 0) return;

    const selectedIngredientData = ingredients.filter(ingredient => 
      selectedIngredients.includes(ingredient.name)
    );

    await createOrUpdateListForRecipe(recipeId, recipeName, selectedIngredientData);
    setIsOpen(false);
    setSelectedIngredients([]);
  };

  if (!ingredients || ingredients.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Agregar a lista de compras
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Seleccionar ingredientes</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Selecciona los ingredientes que quieres agregar a tu lista de compras:
          </p>
          
          <div className="space-y-2 max-h-60 overflow-auto">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Checkbox
                  id={`ingredient-${index}`}
                  checked={selectedIngredients.includes(ingredient.name)}
                  onCheckedChange={() => handleIngredientToggle(ingredient.name)}
                />
                <label 
                  htmlFor={`ingredient-${index}`}
                  className="flex-1 text-sm cursor-pointer"
                >
                  <span className="font-medium">{ingredient.name}</span>
                  {(ingredient.quantity || ingredient.unit) && (
                    <span className="text-muted-foreground ml-2">
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                  )}
                </label>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleAddToShoppingList}
              disabled={selectedIngredients.length === 0}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar ({selectedIngredients.length})
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
