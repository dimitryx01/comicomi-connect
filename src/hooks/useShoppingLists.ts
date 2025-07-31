import { useState, useEffect, useCallback, useMemo } from 'react';
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

interface DatabaseShoppingList {
  id: string;
  name: string;
  is_completed: boolean;
  recipe_id: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  shopping_list_items: DatabaseShoppingListItem[];
}

interface DatabaseShoppingListItem {
  id: string;
  ingredient_name: string;
  quantity: string | null;
  unit: string | null;
  is_checked: boolean;
  recipe_id: string | null;
  shopping_list_id: string;
  created_at: string;
}

export const useShoppingLists = () => {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchShoppingLists = useCallback(async () => {
    if (!user) {
      console.log('No user found, cannot fetch shopping lists');
      setHasInitialized(true);
      return;
    }

    try {
      if (!hasInitialized) {
        setLoading(true);
      }
      console.log('Fetching shopping lists for user:', user.id);
      
      const { data: listsData, error: listsError } = await supabase
        .from('shopping_lists')
        .select(`
          *,
          shopping_list_items (*)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (listsError) {
        console.error('Error fetching shopping lists:', listsError);
        throw listsError;
      }

      console.log('Fetched shopping lists data:', listsData);

      const formattedLists: ShoppingList[] = (listsData as DatabaseShoppingList[]).map(list => ({
        id: list.id,
        title: list.name || 'Mi lista de compras',
        is_completed: list.is_completed || false,
        recipe_id: list.recipe_id,
        created_at: list.created_at,
        updated_at: list.updated_at,
        items: (list.shopping_list_items || []).map(item => ({
          id: item.id,
          ingredient_name: item.ingredient_name,
          quantity: item.quantity,
          unit: item.unit,
          is_checked: item.is_checked || false,
          recipe_id: item.recipe_id
        }))
      }));

      setShoppingLists(formattedLists);
      console.log('Successfully formatted shopping lists:', formattedLists);
    } catch (error) {
      console.error('Error fetching shopping lists:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las listas de compras. Verifica tu conexión e inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setHasInitialized(true);
    }
  }, [user, toast, hasInitialized]);

  const createOrUpdateListForRecipe = useCallback(async (
    recipeId: string, 
    recipeName: string, 
    ingredients: Array<{ name: string; quantity?: string; unit?: string }>
  ) => {
    if (!user) {
      console.error('User not authenticated');
      toast({
        title: "Error de autenticación",
        description: "Debes iniciar sesión para crear listas de compras",
        variant: "destructive"
      });
      return null;
    }

    if (!recipeId || !recipeName || !ingredients.length) {
      console.error('Missing required parameters for creating recipe list');
      toast({
        title: "Datos incompletos",
        description: "Faltan datos necesarios para crear la lista",
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log('Creating/updating list for recipe:', { recipeId, recipeName, ingredientsCount: ingredients.length });
      
      const listTitle = `Ingredientes para "${recipeName}"`;
      
      // Check if list already exists
      const { data: existingList, error: searchError } = await supabase
        .from('shopping_lists')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', listTitle)
        .eq('is_completed', false)
        .maybeSingle();

      if (searchError) {
        console.error('Error searching for existing list:', searchError);
        throw new Error(`Error al buscar lista existente: ${searchError.message}`);
      }

      let listId: string;

      if (existingList) {
        console.log('Found existing list:', existingList.id);
        listId = existingList.id;
      } else {
        console.log('Creating new list for recipe');
        // Create new list
        const { data: newList, error: createError } = await supabase
          .from('shopping_lists')
          .insert({
            user_id: user.id,
            name: listTitle,
            recipe_id: recipeId,
            is_completed: false
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating shopping list:', createError);
          throw new Error(`Error al crear la lista: ${createError.message}`);
        }

        if (!newList) {
          throw new Error('No se pudo crear la lista - respuesta vacía');
        }

        console.log('Successfully created new list:', newList);
        listId = newList.id;
      }

      // Add ingredients to the list
      const itemsToInsert = ingredients.map(ingredient => ({
        shopping_list_id: listId,
        ingredient_name: ingredient.name.trim(),
        quantity: ingredient.quantity?.trim() || null,
        unit: ingredient.unit?.trim() || null,
        recipe_id: recipeId,
        is_checked: false
      }));

      console.log('Inserting items:', itemsToInsert);

      const { error: itemsError } = await supabase
        .from('shopping_list_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('Error adding items to list:', itemsError);
        throw new Error(`Error al agregar ingredientes: ${itemsError.message}`);
      }

      console.log('Successfully added ingredients to list');

      toast({
        title: "Ingredientes agregados",
        description: `Se agregaron ${ingredients.length} ingredientes a tu lista de compras`
      });

      // Update state locally without refetching
      setShoppingLists(prev => {
        const updated = [...prev];
        const existingIndex = updated.findIndex(list => list.id === listId);
        if (existingIndex === -1) {
          // Add new list if it doesn't exist
          updated.unshift({
            id: listId,
            title: listTitle,
            is_completed: false,
            recipe_id: recipeId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            items: itemsToInsert.map((item, index) => ({
              id: `temp-${Date.now()}-${index}`,
              ingredient_name: item.ingredient_name,
              quantity: item.quantity,
              unit: item.unit,
              is_checked: false,
              recipe_id: item.recipe_id
            }))
          });
        }
        return updated;
      });
      return listId;
    } catch (error) {
      console.error('Error in createOrUpdateListForRecipe:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: `No se pudieron agregar los ingredientes: ${errorMessage}`,
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast, fetchShoppingLists]);

  const createList = useCallback(async (title: string = 'Mi lista de compras') => {
    if (!user) {
      console.error('User not authenticated');
      toast({
        title: "Error de autenticación",
        description: "Debes iniciar sesión para crear listas de compras",
        variant: "destructive"
      });
      return null;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast({
        title: "Título requerido",
        description: "El título de la lista no puede estar vacío",
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log('Creating new list with title:', trimmedTitle);

      const { data, error } = await supabase
        .from('shopping_lists')
        .insert({
          user_id: user.id,
          name: trimmedTitle,
          is_completed: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating shopping list:', error);
        throw new Error(`Error al crear la lista: ${error.message}`);
      }

      if (!data) {
        throw new Error('No se pudo crear la lista - respuesta vacía');
      }

      console.log('Successfully created list:', data);

      toast({
        title: "Lista creada",
        description: "Se ha creado una nueva lista de compras"
      });

      // Update state locally without refetching
      setShoppingLists(prev => [
        {
          id: data.id,
          title: trimmedTitle,
          is_completed: false,
          recipe_id: null,
          created_at: data.created_at,
          updated_at: data.updated_at,
          items: []
        },
        ...prev
      ]);
      return data.id;
    } catch (error) {
      console.error('Error in createList:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: `No se pudo crear la lista: ${errorMessage}`,
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast, fetchShoppingLists]);

  const updateListTitle = useCallback(async (listId: string, newTitle: string) => {
    if (!user) return false;

    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      toast({
        title: "Título requerido",
        description: "El título de la lista no puede estar vacío",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('Updating list title:', { listId, newTitle: trimmedTitle });

      const { error } = await supabase
        .from('shopping_lists')
        .update({ name: trimmedTitle })
        .eq('id', listId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating list title:', error);
        throw new Error(`Error al actualizar el título: ${error.message}`);
      }

      // Update state locally without refetching
      setShoppingLists(prev => prev.map(list => 
        list.id === listId ? { ...list, title: trimmedTitle } : list
      ));
      return true;
    } catch (error) {
      console.error('Error in updateListTitle:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: `No se pudo actualizar el título: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, fetchShoppingLists]);

  const toggleListCompletion = useCallback(async (listId: string, completed: boolean) => {
    if (!user) return false;

    try {
      console.log('Toggling list completion:', { listId, completed });

      const { error } = await supabase
        .from('shopping_lists')
        .update({ is_completed: completed })
        .eq('id', listId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error toggling list completion:', error);
        throw new Error(`Error al actualizar la lista: ${error.message}`);
      }

      toast({
        title: completed ? "Lista finalizada" : "Lista reactivada",
        description: completed ? "La lista se movió a archivadas" : "La lista se reactivó"
      });

      // Update state locally without refetching
      setShoppingLists(prev => prev.map(list => 
        list.id === listId ? { ...list, is_completed: completed } : list
      ));
      return true;
    } catch (error) {
      console.error('Error in toggleListCompletion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: `No se pudo actualizar la lista: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, fetchShoppingLists]);

  const deleteList = useCallback(async (listId: string) => {
    if (!user) return false;

    try {
      console.log('Deleting list:', listId);

      const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting shopping list:', error);
        throw new Error(`Error al eliminar la lista: ${error.message}`);
      }

      toast({
        title: "Lista eliminada",
        description: "La lista se ha eliminado correctamente"
      });

      // Update state locally without refetching
      setShoppingLists(prev => prev.filter(list => list.id !== listId));
      return true;
    } catch (error) {
      console.error('Error in deleteList:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: `No se pudo eliminar la lista: ${errorMessage}`,
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

    const trimmedName = ingredientName.trim();
    if (!trimmedName) {
      toast({
        title: "Nombre requerido",
        description: "El nombre del ingrediente no puede estar vacío",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('Adding item to list:', { listId, ingredientName: trimmedName, quantity, unit });

      const { error } = await supabase
        .from('shopping_list_items')
        .insert({
          shopping_list_id: listId,
          ingredient_name: trimmedName,
          quantity: quantity?.trim() || null,
          unit: unit?.trim() || null,
          is_checked: false
        });

      if (error) {
        console.error('Error adding item:', error);
        throw new Error(`Error al agregar el ingrediente: ${error.message}`);
      }

      // Update state locally without refetching
      setShoppingLists(prev => prev.map(list => 
        list.id === listId 
          ? { 
              ...list, 
              items: [...list.items, {
                id: `temp-${Date.now()}`,
                ingredient_name: trimmedName,
                quantity: quantity?.trim() || null,
                unit: unit?.trim() || null,
                is_checked: false,
                recipe_id: null
              }]
            }
          : list
      ));
      return true;
    } catch (error) {
      console.error('Error in addItem:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: `No se pudo agregar el ingrediente: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, fetchShoppingLists]);

  const toggleItemCheck = useCallback(async (itemId: string, checked: boolean) => {
    if (!user) return false;

    try {
      console.log('Toggling item check:', { itemId, checked });

      const { error } = await supabase
        .from('shopping_list_items')
        .update({ is_checked: checked })
        .eq('id', itemId);

      if (error) {
        console.error('Error toggling item check:', error);
        throw new Error(`Error al actualizar el elemento: ${error.message}`);
      }

      // Update state locally without refetching
      setShoppingLists(prev => prev.map(list => ({
        ...list,
        items: list.items.map(item => 
          item.id === itemId ? { ...item, is_checked: checked } : item
        )
      })));
      return true;
    } catch (error) {
      console.error('Error in toggleItemCheck:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: `No se pudo actualizar el elemento: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, fetchShoppingLists]);

  const deleteItem = useCallback(async (itemId: string) => {
    if (!user) return false;

    try {
      console.log('Deleting item:', itemId);

      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error deleting item:', error);
        throw new Error(`Error al eliminar el elemento: ${error.message}`);
      }

      // Update state locally without refetching
      setShoppingLists(prev => prev.map(list => ({
        ...list,
        items: list.items.filter(item => item.id !== itemId)
      })));
      return true;
    } catch (error) {
      console.error('Error in deleteItem:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error",
        description: `No se pudo eliminar el elemento: ${errorMessage}`,
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast, fetchShoppingLists]);

  useEffect(() => {
    if (!hasInitialized) {
      fetchShoppingLists();
    }
  }, [user, hasInitialized]);

  const activeLists = useMemo(() => 
    shoppingLists.filter(list => !list.is_completed), 
    [shoppingLists]
  );
  
  const archivedLists = useMemo(() => 
    shoppingLists.filter(list => list.is_completed), 
    [shoppingLists]
  );

  return {
    shoppingLists,
    activeLists,
    archivedLists,
    loading: loading && !hasInitialized,
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
