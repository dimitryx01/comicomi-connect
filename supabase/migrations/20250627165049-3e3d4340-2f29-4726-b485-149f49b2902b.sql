
-- Primero, veamos exactamente qué valores de difficulty existen
SELECT difficulty, COUNT(*) 
FROM public.recipes 
WHERE difficulty IS NOT NULL 
GROUP BY difficulty;

-- Eliminar cualquier constraint existente primero
ALTER TABLE public.recipes DROP CONSTRAINT IF EXISTS recipes_difficulty_check;

-- Actualizar todos los valores de difficulty para que coincidan exactamente
UPDATE public.recipes 
SET difficulty = CASE 
    WHEN difficulty ILIKE '%fácil%' OR difficulty ILIKE '%facil%' OR difficulty ILIKE '%easy%' THEN 'Fácil'
    WHEN difficulty ILIKE '%medio%' OR difficulty ILIKE '%medium%' OR difficulty ILIKE '%intermedio%' THEN 'Medio'
    WHEN difficulty ILIKE '%difícil%' OR difficulty ILIKE '%dificil%' OR difficulty ILIKE '%hard%' OR difficulty ILIKE '%difficult%' THEN 'Difícil'
    ELSE 'Medio'  -- valor por defecto
END;

-- Verificar que todos los valores están correctos antes de aplicar el constraint
SELECT difficulty, COUNT(*) 
FROM public.recipes 
WHERE difficulty IS NOT NULL 
GROUP BY difficulty;

-- Aplicar el constraint solo después de la actualización
ALTER TABLE public.recipes ADD CONSTRAINT recipes_difficulty_check 
    CHECK (difficulty IN ('Fácil', 'Medio', 'Difícil'));
