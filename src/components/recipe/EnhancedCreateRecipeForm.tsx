
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

const EnhancedCreateRecipeForm = ({ onSuccess }: EnhancedCreateRecipeFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
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
  const cuisineTypes = [
    'Asiática', 'Colombiana', 'Francesa', 'India', 'Italiana', 
    'Japonesa', 'Mediterránea', 'Mexicana', 'Española'
  ];

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
    if (!title.trim()) {
      toast.error('El título es obligatorio');
      return false;
    }
    if (!imageUrl.trim()) {
      toast.error('La imagen es obligatoria');
      return false;
    }
    if (!difficulty) {
      toast.error('La dificultad es obligatoria');
      return false;
    }
    if (!cuisineType) {
      toast.error('El tipo de cocina es obligatorio');
      return false;
    }
    if (ingredients.some(ing => !ing.name.trim())) {
      toast.error('Todos los ingredientes deben tener nombre');
      return false;
    }
    if (steps.some(step => !step.description.trim())) {
      toast.error('Todos los pasos deben tener descripción');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Debes estar logueado para crear una receta');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);

    try {
      const recipeData = {
        title: title.trim(),
        description: description.trim() || null,
        image_url: imageUrl.trim(),
        youtube_url: youtubeUrl.trim() || null,
        author_id: user.id,
        prep_time: prepTime,
        cook_time: cookTime,
        total_time: prepTime + cookTime,
        servings,
        difficulty,
        cuisine_type: cuisineType,
        ingredients: ingredients.filter(ing => ing.name.trim()),
        steps: steps.map((step, index) => ({
          step: index + 1,
          description: step.description.trim(),
          duration: step.duration.trim() || null
        })).filter(step => step.description),
        tags: tags,
        allergens: allergens,
        recipe_interests: recipeInterests,
        is_public: true
      };

      const { error } = await supabase
        .from('recipes')
        .insert([recipeData]);

      if (error) {
        console.error('Error creating recipe:', error);
        toast.error('Error al crear la receta');
        return;
      }

      toast.success('Receta creada exitosamente');
      onSuccess?.();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear la receta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[90vh] overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold">Crear Nueva Receta</h2>
        <p className="text-muted-foreground">Comparte tu creación culinaria con la comunidad</p>
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
                    {cuisineTypes.map((cuisine) => (
                      <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
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
                <Input
                  placeholder="Unidad"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  className="w-24"
                />
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
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
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
            {loading ? 'Creando...' : 'Publicar Receta'}
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
