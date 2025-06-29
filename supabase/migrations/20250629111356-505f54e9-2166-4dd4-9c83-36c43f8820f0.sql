
-- Add missing columns to shopping_lists table
ALTER TABLE public.shopping_lists 
ADD COLUMN is_completed boolean DEFAULT false,
ADD COLUMN recipe_id uuid REFERENCES public.recipes(id);

-- Create index for better performance
CREATE INDEX idx_shopping_lists_user_completed ON public.shopping_lists(user_id, is_completed);
CREATE INDEX idx_shopping_lists_recipe ON public.shopping_lists(recipe_id);
