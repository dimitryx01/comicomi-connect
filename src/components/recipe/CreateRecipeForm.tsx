
import { useState } from 'react';
import { Plus, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CreateRecipeFormProps {
  onSuccess?: () => void;
}

const CreateRecipeForm = ({ onSuccess }: CreateRecipeFormProps) => {
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
  const [steps, setSteps] = useState([{ description: '', duration: '' }]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addStep = () => {
    setSteps([...steps, { description: '', duration: '' }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
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

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-4">
      <div className="text-center">
        <h2 className="text-xl font-bold">Crear nueva receta</h2>
        <p className="text-sm text-muted-foreground">Comparte tu creación culinaria</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-sm font-medium">Título de la receta</Label>
          <Input id="title" placeholder="Nombre de tu receta" className="mt-1" />
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium">Descripción</Label>
          <Textarea id="description" placeholder="Describe tu receta" rows={2} className="mt-1 resize-none" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="prepTime" className="text-sm font-medium">Prep (min)</Label>
            <Input id="prepTime" type="number" placeholder="30" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="cookTime" className="text-sm font-medium">Cook (min)</Label>
            <Input id="cookTime" type="number" placeholder="45" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="servings" className="text-sm font-medium">Porciones</Label>
            <Input id="servings" type="number" placeholder="4" className="mt-1" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="difficulty" className="text-sm font-medium">Dificultad</Label>
            <Select>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Medio</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="cuisine" className="text-sm font-medium">Tipo de cocina</Label>
            <Select>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="italian">Italiana</SelectItem>
                <SelectItem value="mexican">Mexicana</SelectItem>
                <SelectItem value="asian">Asiática</SelectItem>
                <SelectItem value="spanish">Española</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="image" className="text-sm font-medium">URL de imagen</Label>
          <Input id="image" placeholder="https://ejemplo.com/imagen.jpg" className="mt-1" />
        </div>

        <div>
          <Label className="text-sm font-medium">Etiquetas</Label>
          <div className="flex gap-2 mt-1">
            <Input
              placeholder="Agregar etiqueta"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              className="flex-1"
            />
            <Button type="button" onClick={addTag} size="sm">Agregar</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="cursor-pointer">
                {tag}
                <X className="h-3 w-3 ml-1" onClick={() => removeTag(tag)} />
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Ingredients */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Ingredientes</CardTitle>
              <Button type="button" onClick={addIngredient} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="space-y-2">
                <Input
                  placeholder="Ingrediente"
                  value={ingredient.name}
                  onChange={(e) => {
                    const newIngredients = [...ingredients];
                    newIngredients[index].name = e.target.value;
                    setIngredients(newIngredients);
                  }}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Cantidad"
                    value={ingredient.quantity}
                    onChange={(e) => {
                      const newIngredients = [...ingredients];
                      newIngredients[index].quantity = e.target.value;
                      setIngredients(newIngredients);
                    }}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Unidad"
                    value={ingredient.unit}
                    onChange={(e) => {
                      const newIngredients = [...ingredients];
                      newIngredients[index].unit = e.target.value;
                      setIngredients(newIngredients);
                    }}
                    className="flex-1"
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
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Steps */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Instrucciones</CardTitle>
              <Button type="button" onClick={addStep} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Paso {index + 1}
                  </span>
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
                  placeholder="Describe este paso..."
                  value={step.description}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[index].description = e.target.value;
                    setSteps(newSteps);
                  }}
                  rows={2}
                  className="resize-none"
                />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Duración (opcional)"
                    value={step.duration}
                    onChange={(e) => {
                      const newSteps = [...steps];
                      newSteps[index].duration = e.target.value;
                      setSteps(newSteps);
                    }}
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 pt-4">
        <Button className="flex-1">Publicar receta</Button>
        <Button variant="outline" onClick={onSuccess} className="flex-1">Cancelar</Button>
      </div>
    </div>
  );
};

export default CreateRecipeForm;
