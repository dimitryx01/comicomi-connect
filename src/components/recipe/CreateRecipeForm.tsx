
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create New Recipe</h2>
        <p className="text-muted-foreground">Share your culinary creation with the community</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Recipe Title</Label>
            <Input id="title" placeholder="Enter recipe title" />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe your recipe" rows={3} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="prepTime">Prep Time (min)</Label>
              <Input id="prepTime" type="number" placeholder="30" />
            </div>
            <div>
              <Label htmlFor="cookTime">Cook Time (min)</Label>
              <Input id="cookTime" type="number" placeholder="45" />
            </div>
            <div>
              <Label htmlFor="servings">Servings</Label>
              <Input id="servings" type="number" placeholder="4" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="cuisine">Cuisine Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="mexican">Mexican</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="american">American</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="image">Recipe Image URL</Label>
            <Input id="image" placeholder="https://example.com/image.jpg" />
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
              />
              <Button type="button" onClick={addTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer">
                  {tag}
                  <X className="h-3 w-3 ml-1" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ingredients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ingredients</CardTitle>
            <Button type="button" onClick={addIngredient} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Ingredient"
                  value={ingredient.name}
                  onChange={(e) => {
                    const newIngredients = [...ingredients];
                    newIngredients[index].name = e.target.value;
                    setIngredients(newIngredients);
                  }}
                  className="flex-1"
                />
                <Input
                  placeholder="Qty"
                  value={ingredient.quantity}
                  onChange={(e) => {
                    const newIngredients = [...ingredients];
                    newIngredients[index].quantity = e.target.value;
                    setIngredients(newIngredients);
                  }}
                  className="w-20"
                />
                <Input
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChange={(e) => {
                    const newIngredients = [...ingredients];
                    newIngredients[index].unit = e.target.value;
                    setIngredients(newIngredients);
                  }}
                  className="w-20"
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

        {/* Steps */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Instructions</CardTitle>
            <Button type="button" onClick={addStep} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Step {index + 1}
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
                  placeholder="Describe this step..."
                  value={step.description}
                  onChange={(e) => {
                    const newSteps = [...steps];
                    newSteps[index].description = e.target.value;
                    setSteps(newSteps);
                  }}
                  rows={2}
                />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Duration (optional)"
                    value={step.duration}
                    onChange={(e) => {
                      const newSteps = [...steps];
                      newSteps[index].duration = e.target.value;
                      setSteps(newSteps);
                    }}
                    className="w-32"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1">Publish Recipe</Button>
        <Button variant="outline" onClick={onSuccess}>Cancel</Button>
      </div>
    </div>
  );
};

export default CreateRecipeForm;
