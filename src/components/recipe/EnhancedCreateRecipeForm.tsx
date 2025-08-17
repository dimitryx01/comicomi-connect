import { useState, useEffect } from 'react';
import { Plus, X, Clock, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EnhancedCreateRecipeFormProps {
  onSuccess?: () => void;
  editMode?: boolean;
  initialData?: any;
}

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface Step {
  description: string;
  duration: string;
}

const EnhancedCreateRecipeForm = ({ onSuccess, editMode = false, initialData }: EnhancedCreateRecipeFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Database data
  const [measurementUnits, setMeasurementUnits] = useState<any[]>([]);
  const [cuisines, setCuisines] = useState<any[]>([]);
  
  // Datos básicos
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [prepTime, setPrepTime] = useState<number>(0);
  const [cookTime, setCookTime] = useState<number>(0);
  const [servings, setServings] = useState<number>(4);
  const [difficulty, setDifficulty] = useState('');
  const [cuisineType, setCuisineType] = useState('');

  // Arrays
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', quantity: '', unit: '' }
  ]);
  const [steps, setSteps] = useState<Step[]>([
    { description: '', duration: '' }
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [recipeInterests, setRecipeInterests] = useState<string[]>([]);

  // Campos de entrada temporal
  const [newTag, setNewTag] = useState('');

  const difficulties = ['Fácil', 'Medio', 'Difícil'];

  const commonAllergens = [
    'Gluten', 'Lácteos', 'Huevos', 'Frutos secos', 'Soja', 
    'Mariscos', 'Pescado', 'Sésamo'
  ];

  const interestCategories = [
    'Vegano', 'Vegetariano', 'Sin gluten', 'Keto', 'Bajo en calorías',
    'Desayuno', 'Almuerzo', 'Cena', 'Postres', 'Snacks',
    'Fritura', 'Horneado', 'Parrilla', 'Salteado', 'Vapor',
    'Carnes', 'Especias', 'Frutas', 'Mariscos', 'Vegetales'
  ];

  // Load database data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load measurement units
        const { data: units, error: unitsError } = await (supabase as any)
          .from('measurement_units')
          .select('id,name,code,category,sort_order')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        
        if (unitsError) {
          console.error('Error loading measurement units:', unitsError);
        } else {
          setMeasurementUnits((units as any[]) || []);
        }

        // Load cuisines
        const { data: cuisinesData, error: cuisinesError } = await (supabase as any)
          .from('cuisines')
          .select('id,name,slug,sort_order')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        
        if (cuisinesError) {
          console.error('Error loading cuisines:', cuisinesError);
        } else {
          setCuisines((cuisinesData as any[]) || []);
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };

    loadData();
  }, []);

  // Load initial data when in edit mode
  useEffect(() => {
    if (editMode && initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setImageUrl(initialData.image_url || '');
      setYoutubeUrl(initialData.youtube_url || '');
      setPrepTime(initialData.prep_time || 0);
      setCookTime(initialData.cook_time || 0);
      setServings(initialData.servings || 4);
      setDifficulty(initialData.difficulty || '');
      setCuisineType(initialData.cuisine_type || '');
      
      // Load and normalize ingredients
      if (initialData.ingredients) {
        let parsedIngredients = initialData.ingredients;
        
        // Parse if it's a string
        if (typeof parsedIngredients === 'string') {
          try {
            parsedIngredients = JSON.parse(parsedIngredients);
          } catch (e) {
            console.warn('Could not parse ingredients string:', e);
            parsedIngredients = [];
          }
        }
        
        // Normalize ingredients to expected shape
        if (Array.isArray(parsedIngredients)) {
          const normalizedIngredients = parsedIngredients
            .map((ing: any) => ({
              name: String(ing?.name || ing?.ingredient || ing?.ingredient_name || '').trim(),
              quantity: String(ing?.quantity || ing?.amount || ing?.cantidad || '').trim(),
              unit: String(ing?.unit || ing?.unidad || ing?.measure || '').trim()
            }))
            .filter(ing => ing.name.length > 0); // Filter out empty ingredients
          
          setIngredients(normalizedIngredients.length > 0 ? normalizedIngredients : [{ name: '', quantity: '', unit: '' }]);
        } else {
          setIngredients([{ name: '', quantity: '', unit: '' }]);
        }
      } else {
        setIngredients([{ name: '', quantity: '', unit: '' }]);
      }
      
      // Load steps
      if (initialData.steps && Array.isArray(initialData.steps)) {
        const stepsData = initialData.steps.map((step: any) => ({
          description: step.description || '',
          duration: step.duration || ''
        }));
        setSteps(stepsData.length > 0 ? stepsData : [{ description: '', duration: '' }]);
      }
      
      // Load tags, allergens, and interests
      setTags(initialData.tags || []);
      setAllergens(initialData.allergens || []);
      setRecipeInterests(initialData.recipe_interests || []);
    }
  }, [editMode, initialData]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addStep = () => {
    setSteps([...steps, { description: '', duration: '' }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, field: keyof Step, value: string) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const toggleAllergen = (allergen: string) => {
    setAllergens(prev => 
      prev.includes(allergen) 
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  const toggleInterest = (interest: string) => {
    setRecipeInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const validateForm = () => {
    console.log('🔍 Validando formulario...');
    
    if (!title.trim()) {
      console.error('❌ Validación: Título vacío');
      toast.error('El título es obligatorio');
      return false;
    }

    if (!imageUrl.trim()) {
      console.error('❌ Validación: URL de imagen vacía');
      toast.error('La imagen es obligatoria');
      return false;
    }

    if (!difficulty) {
      console.error('❌ Validación: Dificultad no seleccionada');
      toast.error('La dificultad es obligatoria');
      return false;
    }

    if (!cuisineType) {
      console.error('❌ Validación: Tipo de cocina no seleccionado');
      toast.error('El tipo de cocina es obligatorio');
      return false;
    }

    // Validar ingredientes
    const validIngredients = ingredients.filter(ing => (ing?.name ?? '').trim().length > 0);
    if (validIngredients.length === 0) {
      console.error('❌ Validación: No hay ingredientes válidos');
      toast.error('Debes agregar al menos un ingrediente con nombre');
      return false;
    }

    // Validar pasos
    const validSteps = steps.filter(step => step.description.trim());
    if (validSteps.length === 0) {
      console.error('❌ Validación: No hay pasos válidos');
      toast.error('Debes agregar al menos un paso con descripción');
      return false;
    }

    console.log('✅ Validación: Formulario válido', {
      title: title.trim(),
      validIngredients: validIngredients.length,
      validSteps: validSteps.length,
      difficulty,
      cuisineType
    });

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log(editMode ? '🚀 Iniciando actualización de receta...' : '🚀 Iniciando envío de formulario de receta...');
    
    // Verificar autenticación
    if (!user) {
      console.error('❌ Usuario no autenticado');
      toast.error('Debes estar logueado para ' + (editMode ? 'editar' : 'crear') + ' una receta');
      return;
    }

    console.log('👤 Usuario autenticado:', user.id);

    // Validar formulario
    if (!validateForm()) {
      console.error('❌ Validación de formulario falló');
      return;
    }

    setLoading(true);

    try {
      // Preparar ingredientes válidos
      const validIngredients = ingredients
        .filter(ing => ing.name.trim())
        .map(ing => ({
          name: ing.name.trim(),
          quantity: ing.quantity.trim(),
          unit: ing.unit.trim()
        }));

      console.log('📝 Ingredientes procesados:', validIngredients);

      // Preparar pasos válidos
      const validSteps = steps
        .filter(step => step.description.trim())
        .map((step, index) => ({
          step: index + 1,
          description: step.description.trim(),
          duration: step.duration.trim() || null
        }));

      console.log('📋 Pasos procesados:', validSteps);

      // Preparar datos para envío
      const recipeData = {
        title: title.trim(),
        description: description.trim() || null,
        image_url: imageUrl.trim(),
        youtube_url: youtubeUrl.trim() || null,
        prep_time: prepTime,
        cook_time: cookTime,
        total_time: prepTime + cookTime,
        servings,
        difficulty,
        cuisine_type: cuisineType,
        ingredients: validIngredients,
        steps: validSteps,
        tags: tags,
        allergens: allergens,
        recipe_interests: recipeInterests,
        is_public: true
      };

      // Add author_id only for create mode
      if (!editMode) {
        (recipeData as any).author_id = user.id;
      }

      console.log('📦 Datos preparados para envío:', {
        ...recipeData,
        ingredients: `${validIngredients.length} ingredientes`,
        steps: `${validSteps.length} pasos`
      });

      let data, error;

      if (editMode && initialData) {
        // Update existing recipe
        console.log('💾 Actualizando receta en Supabase...');
        const result = await supabase
          .from('recipes')
          .update(recipeData)
          .eq('id', initialData.id)
          .eq('author_id', user.id) // Extra security check
          .select('id')
          .single();
        
        data = result.data;
        error = result.error;
      } else {
        // Create new recipe
        console.log('💾 Insertando nueva receta en Supabase...');
        const result = await supabase
          .from('recipes')
          .insert(recipeData)
          .select('id')
          .single();

        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('❌ Error de Supabase:', error);
        console.error('❌ Detalles del error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Mostrar error específico basado en el código
        let errorMessage = editMode ? 'Error al actualizar la receta' : 'Error al crear la receta';
        if (error.code === '23505') {
          errorMessage = 'Ya existe una receta con ese título';
        } else if (error.code === '23502') {
          errorMessage = 'Faltan campos obligatorios';
        } else if (error.code === '42501') {
          errorMessage = 'No tienes permisos para ' + (editMode ? 'editar' : 'crear') + ' recetas';
        } else if (error.message) {
          errorMessage = `Error: ${error.message}`;
        }
        
        toast.error(errorMessage);
        return;
      }

      console.log(editMode ? '✅ Receta actualizada exitosamente:' : '✅ Receta creada exitosamente:', data);
      
      toast.success(editMode ? 'Receta actualizada exitosamente' : 'Receta creada exitosamente');
      
      // Limpiar formulario solo si no estamos en modo edición
      if (!editMode) {
        console.log('🧹 Limpiando formulario...');
        setTitle('');
        setDescription('');
        setImageUrl('');
        setYoutubeUrl('');
        setPrepTime(0);
        setCookTime(0);
        setServings(4);
        setDifficulty('');
        setCuisineType('');
        setIngredients([{ name: '', quantity: '', unit: '' }]);
        setSteps([{ description: '', duration: '' }]);
        setTags([]);
        setAllergens([]);
        setRecipeInterests([]);
      }
      
      // Callback de éxito
      if (onSuccess) {
        console.log('🎯 Ejecutando callback de éxito...');
        onSuccess();
      }

    } catch (error) {
      console.error('💥 Error crítico durante ' + (editMode ? 'actualización' : 'creación') + ':', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('💥 Mensaje de error:', errorMessage);
      
      toast.error(`Error inesperado: ${errorMessage}`);
    } finally {
      console.log('🏁 Finalizando proceso de ' + (editMode ? 'actualización' : 'creación') + '...');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[90vh] overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold">{editMode ? 'Editar Receta' : 'Crear Nueva Receta'}</h2>
        <p className="text-muted-foreground">
          {editMode ? 'Modifica los detalles de tu receta' : 'Comparte tu creación culinaria con la comunidad'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título de la Receta *</Label>
              <Input
                id="title"
                placeholder="Ej: Paella Valenciana Tradicional"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe tu receta..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">URL de la Imagen *</Label>
              <Input
                id="imageUrl"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />
              {imageUrl && (
                <div className="mt-2">
                  <img 
                    src={imageUrl} 
                    alt="Vista previa" 
                    className="w-full h-48 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={(e) => {
                      e.currentTarget.style.display = 'block';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="youtubeUrl">URL del Video de YouTube (opcional)</Label>
              <Input
                id="youtubeUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Detalles de cocción */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles de Cocción</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="prepTime">Tiempo de prep. (min)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  min="0"
                  value={prepTime}
                  onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="cookTime">Tiempo de cocción (min)</Label>
                <Input
                  id="cookTime"
                  type="number"
                  min="0"
                  value={cookTime}
                  onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="servings">Porciones</Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value) || 4)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Dificultad *</Label>
                <Select value={difficulty} onValueChange={setDifficulty} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar dificultad" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((diff) => (
                      <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo de Cocina *</Label>
                <Select value={cuisineType} onValueChange={setCuisineType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuisines.map((cuisine) => (
                      <SelectItem key={cuisine.id} value={cuisine.name}>{cuisine.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingredientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ingredientes</CardTitle>
            <Button type="button" onClick={addIngredient} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Ingrediente *"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Cantidad"
                  value={ingredient.quantity}
                  onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                  className="w-24"
                />
                <Select
                  value={ingredient.unit}
                  onValueChange={(value) => updateIngredient(index, 'unit', value)}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {measurementUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.name}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {ingredients.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pasos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Instrucciones</CardTitle>
            <Button type="button" onClick={addStep} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Paso {index + 1}</span>
                  {steps.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeStep(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder="Describe este paso... *"
                  value={step.description}
                  onChange={(e) => updateStep(index, 'description', e.target.value)}
                  rows={2}
                />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Duración (opcional)"
                    value={step.duration}
                    onChange={(e) => updateStep(index, 'duration', e.target.value)}
                    className="w-40"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tags, Alérgenos e Intereses */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Agregar tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">Agregar</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer">
                      {tag}
                      <X className="h-3 w-3 ml-1" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Alérgenos */}
            <div>
              <Label>Alérgenos</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {commonAllergens.map((allergen) => (
                  <Badge
                    key={allergen}
                    variant={allergens.includes(allergen) ? "destructive" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleAllergen(allergen)}
                  >
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Categorías de intereses */}
            <div>
              <Label>Categorías (para filtrado por intereses)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {interestCategories.map((interest) => (
                  <Badge
                    key={interest}
                    variant={recipeInterests.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? (editMode ? 'Actualizando...' : 'Creando...') : (editMode ? 'Actualizar Receta' : 'Publicar Receta')}
          </Button>
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedCreateRecipeForm;
