
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ShoppingListItem {
  id: string;
  ingredient_name: string;
  quantity: string | null;
  unit: string | null;
  is_checked: boolean;
  recipe_id: string | null;
}

interface ShoppingList {
  id: string;
  title: string;
  is_completed: boolean;
  recipe_id: string | null;
  created_at: string;
  updated_at: string;
  items: ShoppingListItem[];
}

export const useShoppingLists = () => {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchShoppingLists = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch shopping lists with their items
      const { data: listsData, error: listsError } = await supabase
        .from('shopping_lists')
        .select(`
          *,
          shopping_list_items (*)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (listsError) throw listsError;

      const formattedLists: ShoppingList[] = (listsData || []).map((list: any) => ({
        id: list.id,
        title: list.name || 'Mi lista de compras', // usar 'name' de la BD
        is_completed: list.is_completed || false,
        recipe_id: list.recipe_id,
        created_at: list.created_at,
        updated_at: list.updated_at,
        items: (list.shopping_list_items || []).map((item: any) => ({
          id: item.id,
          ingredient_name: item.ingredient_name,
          quantity: item.quantity,
          unit: item.unit,
          is_checked: item.is_checked || false,
          recipe_id: item.recipe_id
        }))
      }));

      setShoppingLists(formattedLists);
    } catch (error) {
      console.error('Error fetching shopping lists:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las listas de compras",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createOrUpdateListForRecipe = useCallback(async (
    recipeId: string, 
    recipeName: string, 
    ingredients: Array<{ name: string; quantity?: string; unit?: string }>
  ) => {
    if (!user) return null;

    try {
      const listTitle = `Por comprar para preparar "${recipeName}"`;
      
      // Check if list already exists
      const { data: existingList } = await supabase
        .from('shopping_lists')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', listTitle) // usar 'name' en lugar de 'title'
        .eq('is_completed', false)
        .single();

      let listId: string;

      if (existingList) {
        listId = existingList.id;
      } else {
        // Create new list
        const { data: newList, error: createError } = await supabase
          .from('shopping_lists')
          .insert({
            user_id: user.id,
            name: listTitle, // usar 'name' en lugar de 'title'
            recipe_id: recipeId
          })
          .select()
          .single();

        if (createError) throw createError;
        listId = newList.id;
      }

      // Add ingredients to the list
      const itemsToInsert = ingredients.map(ingredient => ({
        shopping_list_id: listId,
        ingredient_name: ingredient.name,
        quantity: ingredient.quantity || null,
        unit: ingredient.unit || null,
        recipe_id: recipeId
      }));

      const { error: itemsError } = await supabase
        .from('shopping_list_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: "Ingredientes agregados",
        description: `Se agregaron ${ingredients.length} ingredientes a tu lista de compras`
      });

      fetchShoppingLists();
      return listId;
    } catch (error) {
      console.error('Error creating/updating shopping list:', error);
      toast({
        title: "Error",
        description: "No se pudieron agregar los ingredientes",
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast, fetchShoppingLists]);

  const createList = useCallback(async (title: string = 'Mi lista de compras') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('shopping_lists')
        .insert({
          user_id: user.id,
          name: title // usar 'name' en lugar de 'title'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Lista creada",
        description: "Se ha creado una nueva lista de compras"
      });

      fetchShoppingLists();
      return data.id;
    } catch (error) {
      console.error('Error creating shopping list:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la lista",
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast, fetchShoppingLists]);

  const updateListTitle = useCallback(async (listId: string, newTitle: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('shopping_lists')
        .update({ name: newTitle }) // usar 'name' en lugar de 'title'
        .eq('id', listId)
        .eq('user_id', user.id);

      if (error) throw error;

      fetchShoppingLists();
      return true;
    } catch (error) {
      console.error('Error updating list title:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el título",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, fetchShoppingLists]);

  const toggleListCompletion = useCallback(async (listId: string, completed: boolean) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('shopping_lists')
        .update({ is_completed: completed })
        .eq('id', listId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: completed ? "Lista finalizada" : "Lista reactivada",
        description: completed ? "La lista se movió a archivadas" : "La lista se reactivó"
      });

      fetchShoppingLists();
      return true;
    } catch (error) {
      console.error('Error toggling list completion:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la lista",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, fetchShoppingLists]);

  const deleteList = useCallback(async (listId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Lista eliminada",
        description: "La lista se ha eliminado correctamente"
      });

      fetchShoppingLists();
      return true;
    } catch (error) {
      console.error('Error deleting shopping list:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la lista",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, fetchShoppingLists]);

  const addItem = useCallback(async (
    listId: string, 
    ingredientName: string, 
    quantity?: string, 
    unit?: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .insert({
          shopping_list_id: listId,
          ingredient_name: ingredientName,
          quantity: quantity || null,
          unit: unit || null
        });

      if (error) throw error;

      fetchShoppingLists();
      return true;
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el ingrediente",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, fetchShoppingLists]);

  const toggleItemCheck = useCallback(async (itemId: string, checked: boolean) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .update({ is_checked: checked })
        .eq('id', itemId);

      if (error) throw error;

      fetchShoppingLists();
      return true;
    } catch (error) {
      console.error('Error toggling item check:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el elemento",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, fetchShoppingLists]);

  const deleteItem = useCallback(async (itemId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      fetchShoppingLists();
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el elemento",
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, fetchShoppingLists]);

  useEffect(() => {
    fetchShoppingLists();
  }, [fetchShoppingLists]);

  const activeLists = shoppingLists.filter(list => !list.is_completed);
  const archivedLists = shoppingLists.filter(list => list.is_completed);

  return {
    shoppingLists,
    activeLists,
    archivedLists,
    loading,
    createOrUpdateListForRecipe,
    createList,
    updateListTitle,
    toggleListCompletion,
    deleteList,
    addItem,
    toggleItemCheck,
    deleteItem,
    refreshLists: fetchShoppingLists
  };
};
