import { useState } from 'react';
import { MapPin, Phone, Mail, Globe, ChefHat, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CreateRestaurantFormProps {
  onSuccess?: () => void;
}

export const CreateRestaurantForm = ({ onSuccess }: CreateRestaurantFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    cuisineType: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const cuisineTypes = [
    'Española',
    'Italiana',
    'Mexicana',
    'Asiática',
    'Japonesa',
    'China',
    'India',
    'Francesa',
    'Americana',
    'Mediterránea',
    'Vegetariana',
    'Vegana',
    'Mariscos',
    'Carnes',
    'Pizzería',
    'Cafetería',
    'Panadería',
    'Postres',
    'Fusión',
    'Otro'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.address.trim() || !formData.cuisineType) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el nombre, dirección y tipo de cocina",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simular envío (aquí iría la lógica real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "¡Sugerencia enviada!",
        description: "Tu sugerencia de restaurante está pendiente de revisión. Te notificaremos cuando sea aprobada.",
      });
      
      // Limpiar formulario
      setFormData({
        name: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        cuisineType: ''
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar la sugerencia. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Sugerir restaurante
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ayúdanos a agregar nuevos sitios a nuestra comunidad
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre - Requerido */}
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre del restaurante *
            </Label>
            <Input
              id="name"
              placeholder="Nombre del lugar"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>

          {/* Dirección - Requerido */}
          <div>
            <Label htmlFor="address" className="text-sm font-medium flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Dirección *
            </Label>
            <Input
              id="address"
              placeholder="Calle, número, ciudad"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>

          {/* Tipo de cocina - Requerido */}
          <div>
            <Label htmlFor="cuisineType" className="text-sm font-medium flex items-center gap-1">
              <ChefHat className="h-4 w-4" />
              Tipo de cocina *
            </Label>
            <Select 
              value={formData.cuisineType} 
              onValueChange={(value) => handleInputChange('cuisineType', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona el tipo de cocina" />
              </SelectTrigger>
              <SelectContent>
                {cuisineTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descripción */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción (opcional)
            </Label>
            <Textarea
              id="description"
              placeholder="¿Qué hace especial a este lugar?"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={isSubmitting}
              className="mt-1 min-h-[80px] resize-none"
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.description.length}/300 caracteres
            </p>
          </div>

          {/* Contacto - Grid para móvil */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Teléfono (opcional)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+34 XXX XXX XXX"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={isSubmitting}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Email (opcional)
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contacto@restaurante.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isSubmitting}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="website" className="text-sm font-medium flex items-center gap-1">
                <Globe className="h-4 w-4" />
                Sitio web (opcional)
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="https://restaurante.com"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={isSubmitting}
                className="mt-1"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando sugerencia...
                </>
              ) : (
                'Enviar sugerencia'
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            * Campos obligatorios. Tu sugerencia será revisada antes de aparecer en la plataforma.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};