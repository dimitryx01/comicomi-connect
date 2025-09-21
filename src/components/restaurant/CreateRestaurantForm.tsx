import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import LocationSelector from '@/components/ui/LocationSelector';

interface CreateRestaurantFormProps {
  onSuccess?: () => void;
}

const CreateRestaurantForm = ({ onSuccess }: CreateRestaurantFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    locationId: '',
    streetAddress: '',
    phone: '',
    email: '',
    website: '',
    cuisineType: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const cuisineTypes = [
    'Mediterránea',
    'Italiana',
    'Japonesa',
    'China',
    'Mexicana',
    'India',
    'Francesa',
    'Americana',
    'Española',
    'Árabe',
    'Peruana',
    'Argentina',
    'Tailandesa',
    'Griega',
    'Turca',
    'Vegetariana/Vegana',
    'Fusión',
    'Parrilla',
    'Mariscos',
    'Fast Food',
    'Cafetería',
    'Tapas',
    'Otro'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (locationId: string, locationData?: any) => {
    setFormData(prev => ({
      ...prev,
      locationId
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.locationId) {
      toast({
        title: "Error",
        description: "Por favor completa al menos el nombre y la ubicación del restaurante.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular envío de datos
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('📝 Datos del restaurante a crear:', formData);
      
      toast({
        title: "¡Solicitud enviada!",
        description: "Tu solicitud para agregar el restaurante ha sido enviada. La revisaremos pronto.",
      });

      // Limpiar formulario
      setFormData({
        name: '',
        description: '',
        locationId: '',
        streetAddress: '',
        phone: '',
        email: '',
        website: '',
        cuisineType: ''
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al enviar la solicitud. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Sugerir Nuevo Restaurante</CardTitle>
        <CardDescription>
          ¿Conoces un restaurante que no está en nuestra plataforma? Ayúdanos a agregarlo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información Básica</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Restaurante *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nombre del restaurante"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe el restaurante, su ambiente, especialidades..."
                rows={3}
              />
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ubicación</h3>
            
            <div className="space-y-2">
              <Label htmlFor="location">Ciudad/Ubicación *</Label>
              <LocationSelector
                value={formData.locationId}
                onValueChange={handleLocationChange}
                placeholder="Buscar ciudad o ubicación..."
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="streetAddress">Dirección específica</Label>
              <Input
                id="streetAddress"
                value={formData.streetAddress}
                onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                placeholder="Calle, número, piso... (opcional)"
              />
            </div>
          </div>

          {/* Tipo de cocina */}
          <div className="space-y-2">
            <Label htmlFor="cuisineType">Tipo de Cocina</Label>
            <Select value={formData.cuisineType} onValueChange={(value) => handleInputChange('cuisineType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de cocina" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {cuisineTypes.map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Información de contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información de Contacto (Opcional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+34 123 456 789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contacto@restaurante.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.restaurante.com"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            * Los campos marcados son obligatorios. Tu solicitud será revisada por nuestro equipo.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateRestaurantForm;