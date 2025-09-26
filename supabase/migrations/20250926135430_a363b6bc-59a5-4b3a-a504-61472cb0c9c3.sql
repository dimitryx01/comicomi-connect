-- Add postal_code column to restaurants table
ALTER TABLE public.restaurants 
ADD COLUMN postal_code TEXT;