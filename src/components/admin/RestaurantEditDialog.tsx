import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Image, X } from 'lucide-react';
import { RestaurantImage } from '@/components/ui/RestaurantImage';
import { useOptimizedUpload } from '@/hooks/useOptimizedUpload';
import LocationSelector from '@/components/ui/LocationSelector';

const editRestaurantSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  location_id: z.string().min(1, 'Debe seleccionar una ubicación'),
  street_address: z.string().min(5, 'La dirección específica es requerida'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  website: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'URL inválida'
  }),
  cuisine_types: z.array(z.string()).min(1, 'Debe seleccionar al menos un tipo de cocina'),
});

type EditRestaurantForm = z.infer<typeof editRestaurantSchema>;

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  cover_image_url: string | null;
  location_id: string | null;
  street_address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  cuisine_types: string[];
}

interface RestaurantEditDialogProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EditRestaurantForm & { imageFile?: File; coverImageFile?: File }) => void;
  cuisines: Array<{ id: string; name: string }>;
  isLoading?: boolean;
}

export const RestaurantEditDialog: React.FC<RestaurantEditDialogProps> = ({
  restaurant,
  isOpen,
  onClose,
  onSave,
  cuisines,
  isLoading = false
}) => {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  const form = useForm<EditRestaurantForm>({
    resolver: zodResolver(editRestaurantSchema),
    defaultValues: {
      name: '',
      description: '',
      location_id: '',
      street_address: '',
      phone: '',
      email: '',
      website: '',
      cuisine_types: [],
    },
  });

  useEffect(() => {
    if (restaurant && isOpen) {
      form.reset({
        name: restaurant.name,
        description: restaurant.description || '',
        location_id: restaurant.location_id || '',
        street_address: restaurant.street_address || '',
        phone: restaurant.phone || '',
        email: restaurant.email || '',
        website: restaurant.website || '',
        cuisine_types: restaurant.cuisine_types || [],
      });
      setSelectedCuisines(restaurant.cuisine_types || []);
      setImageFile(null);
      setCoverImageFile(null);
      setImagePreview(null);
      setCoverImagePreview(null);
    }
  }, [restaurant, isOpen, form]);

  const handleImageUpload = (file: File, type: 'image' | 'cover') => {
    if (type === 'image') {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = (type: 'image' | 'cover') => {
    if (type === 'image') {
      setImageFile(null);
      setImagePreview(null);
    } else {
      setCoverImageFile(null);
      setCoverImagePreview(null);
    }
  };

  const handleSubmit = (data: EditRestaurantForm) => {
    onSave({
      ...data,
      imageFile: imageFile || undefined,
      coverImageFile: coverImageFile || undefined,
    });
  };

  const handleClose = () => {
    form.reset();
    setSelectedCuisines([]);
    setImageFile(null);
    setCoverImageFile(null);
    setImagePreview(null);
    setCoverImagePreview(null);
    onClose();
  };

  if (!restaurant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Restaurante</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Restaurante</FormLabel>
                    <FormControl>
                      <Input placeholder="La Taverna" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cuisine_types"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipos de Cocina</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedCuisines.map((cuisine) => (
                        <Badge 
                          key={cuisine} 
                          variant="secondary" 
                          className="cursor-pointer"
                          onClick={() => {
                            const newSelected = selectedCuisines.filter(c => c !== cuisine);
                            setSelectedCuisines(newSelected);
                            field.onChange(newSelected);
                          }}
                        >
                          {cuisine} <X className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                    <Select 
                      onValueChange={(value) => {
                        if (!selectedCuisines.includes(value)) {
                          const newSelected = [...selectedCuisines, value];
                          setSelectedCuisines(newSelected);
                          field.onChange(newSelected);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tipos de cocina" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cuisines
                          .filter(cuisine => !selectedCuisines.includes(cuisine.name))
                          .map((cuisine) => (
                            <SelectItem key={cuisine.id} value={cuisine.name}>
                              {cuisine.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descripción detallada del restaurante..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Ubicación</h3>
              
              <FormField
                control={form.control}
                name="location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad/Ubicación *</FormLabel>
                    <FormControl>
                      <LocationSelector
                        value={field.value}
                        onValueChange={(locationId) => {
                          field.onChange(locationId);
                        }}
                        placeholder="Buscar ciudad o ubicación..."
                        className="w-full"
                        inDialog={true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="street_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección Específica *</FormLabel>
                    <FormControl>
                      <Input placeholder="Calle Mayor, 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Contact Information */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+34 123 456 789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="info@restaurante.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sitio Web</FormLabel>
                    <FormControl>
                      <Input placeholder="https://restaurante.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Imágenes</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Main Image */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Imagen Principal</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeImage('image')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : restaurant.image_url ? (
                      <div className="relative">
                        <RestaurantImage
                          fileId={restaurant.image_url}
                          alt="Current image"
                          className="w-full h-32 object-cover rounded"
                          variant="main"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Imagen actual</p>
                      </div>
                    ) : (
                      <div className="py-8">
                        <Image className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Sin imagen</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'image');
                      }}
                      className="mt-2 text-sm"
                    />
                  </div>
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Imagen de Portada</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {coverImagePreview ? (
                      <div className="relative">
                        <img
                          src={coverImagePreview}
                          alt="Cover Preview"
                          className="w-full h-32 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => removeImage('cover')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : restaurant.cover_image_url ? (
                      <div className="relative">
                        <RestaurantImage
                          fileId={restaurant.cover_image_url}
                          alt="Current cover"
                          className="w-full h-32 object-cover rounded"
                          variant="cover"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Imagen actual</p>
                      </div>
                    ) : (
                      <div className="py-8">
                        <Image className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Sin imagen de portada</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'cover');
                      }}
                      className="mt-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};