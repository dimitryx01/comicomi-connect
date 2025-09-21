import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Eye, CheckCircle, XCircle, Search, MapPin, Phone, Globe, Upload, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useOptimizedUpload } from '@/hooks/useOptimizedUpload';
import LocationSelector from '@/components/ui/LocationSelector';

const createRestaurantSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  location_id: z.string().min(1, 'Debe seleccionar una ubicación'),
  street_address: z.string().min(5, 'La dirección específica es requerida'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  website: z.string().url('URL inválida').optional(),
  cuisine_types: z.array(z.string()).min(1, 'Debe seleccionar al menos un tipo de cocina'),
  image_url: z.string().optional(),
  cover_image_url: z.string().optional(),
});

type CreateRestaurantForm = z.infer<typeof createRestaurantSchema>;

const Establishments: React.FC = () => {
  const { hasRole } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const { uploadFile, uploading: uploadingFiles } = useOptimizedUpload();

  // Fetch cuisines for dropdown
  const { data: cuisines = [] } = useQuery({
    queryKey: ['cuisines'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_cuisines');
      if (error) throw error;
      return data || [];
    },
  });

  const form = useForm<CreateRestaurantForm>({
    resolver: zodResolver(createRestaurantSchema),
    defaultValues: {
      name: '',
      description: '',
      location_id: '',
      street_address: '',
      phone: '',
      email: '',
      website: '',
      cuisine_types: [],
      image_url: '',
      cover_image_url: '',
    },
  });

  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  const handleImageUpload = (file: File, type: 'image' | 'cover') => {
    if (type === 'image') {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    form.reset();
    setSelectedCuisines([]);
    setImageFile(null);
    setCoverImageFile(null);
    setImagePreview(null);
    setCoverImagePreview(null);
  };

  // Fetch restaurants with cuisine types
  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          restaurant_cuisines (
            cuisines (
              name
            )
          ),
          locations (
            municipality,
            province,
            autonomous_community
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to include cuisine_types array
      return (data || []).map(restaurant => ({
        ...restaurant,
        cuisine_types: restaurant.restaurant_cuisines?.map((rc: any) => rc.cuisines.name) || []
      }));
    },
  });

  // Create restaurant mutation
  const createRestaurantMutation = useMutation({
    mutationFn: async (restaurantData: CreateRestaurantForm) => {
      let imageUrl = '';
      let coverImageUrl = '';

      // Upload images if provided
      if (imageFile) {
        const imageResult = await uploadFile(imageFile, 'restaurants', 'media');
        if (imageResult.success && imageResult.fileId) {
          imageUrl = imageResult.fileId; // Store fileId, which will be resolved to URL when needed
        }
      }

      if (coverImageFile) {
        const coverResult = await uploadFile(coverImageFile, 'restaurants', 'media');
        if (coverResult.success && coverResult.fileId) {
          coverImageUrl = coverResult.fileId; // Store fileId, which will be resolved to URL when needed
        }
      }

      // First create the restaurant
      const { data, error } = await supabase
        .from('restaurants')
        .insert({
          name: restaurantData.name,
          description: restaurantData.description,
          location_id: restaurantData.location_id,
          street_address: restaurantData.street_address,
          phone: restaurantData.phone || null,
          email: restaurantData.email || null,
          website: restaurantData.website || null,
          image_url: imageUrl || null,
          cover_image_url: coverImageUrl || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Then create the cuisine relationships
      if (restaurantData.cuisine_types.length > 0) {
        const cuisineInserts = restaurantData.cuisine_types.map(cuisineName => {
          // Find the cuisine ID by name
          const cuisine = cuisines.find(c => c.name === cuisineName);
          return {
            restaurant_id: data.id,
            cuisine_id: cuisine?.id
          };
        }).filter(insert => insert.cuisine_id); // Only include valid cuisine IDs

        if (cuisineInserts.length > 0) {
          const { error: cuisineError } = await supabase
            .from('restaurant_cuisines')
            .insert(cuisineInserts);
          
          if (cuisineError) throw cuisineError;
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      setCreateDialogOpen(false);
      resetForm();
      toast.success('Restaurante creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al crear restaurante');
    },
  });

  // Toggle verification status
  const toggleVerificationMutation = useMutation({
    mutationFn: async ({ id, is_verified }: { id: string; is_verified: boolean }) => {
      const { data, error } = await supabase
        .from('restaurants')
        .update({ is_verified })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      toast.success('Estado de verificación actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar estado');
    },
  });

  const handleCreateRestaurant = (data: CreateRestaurantForm) => {
    createRestaurantMutation.mutate(data);
  };

  const filteredRestaurants = restaurants.filter((restaurant: any) => {
    const locationText = restaurant.locations 
      ? `${restaurant.locations.municipality}, ${restaurant.locations.province}`
      : restaurant.location || '';
    
    const matchesSearch = restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         locationText.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'verified' && restaurant.is_verified) ||
                         (statusFilter === 'unverified' && !restaurant.is_verified);
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: restaurants.length,
    verified: restaurants.filter((r: any) => r.is_verified).length,
    unverified: restaurants.filter((r: any) => !r.is_verified).length,
    pending: 0 // Would come from requests table
  };

  if (!hasRole('gestor_establecimientos')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>
              Solo los Gestores de Establecimientos pueden acceder a este módulo.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Establecimientos</h1>
          <p className="text-muted-foreground">
            Administra restaurantes y solicitudes de registro
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Restaurante
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Restaurante</DialogTitle>
              <DialogDescription>
                Registra un nuevo establecimiento en la plataforma
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateRestaurant)} className="space-y-4">
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
                              {cuisine} ×
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
                 
                  {/* Image Upload Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Imágenes del Restaurante</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Main Image */}
                      <div className="space-y-2">
                        <FormLabel>
                          Imagen Principal
                          <span className="text-xs text-muted-foreground ml-2">
                            (Para listados y perfil)
                          </span>
                        </FormLabel>
                       <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                         {imagePreview ? (
                           <div className="space-y-2">
                             <img 
                               src={imagePreview} 
                               alt="Vista previa" 
                               className="w-full h-32 object-cover rounded-md"
                             />
                             <Button
                               type="button"
                               variant="outline"
                               size="sm"
                               onClick={() => {
                                 setImageFile(null);
                                 setImagePreview(null);
                               }}
                             >
                               Remover
                             </Button>
                           </div>
                         ) : (
                           <div className="text-center">
                             <Image className="mx-auto h-12 w-12 text-muted-foreground" />
                             <div className="mt-2">
                               <Button
                                 type="button"
                                 variant="outline"
                                 onClick={() => document.getElementById('image-upload')?.click()}
                               >
                                 <Upload className="mr-2 h-4 w-4" />
                                 Subir Imagen
                               </Button>
                               <input
                                 id="image-upload"
                                 type="file"
                                 accept="image/*"
                                 className="hidden"
                                 onChange={(e) => {
                                   const file = e.target.files?.[0];
                                   if (file) handleImageUpload(file, 'image');
                                 }}
                               />
                             </div>
                           </div>
                         )}
                       </div>
                     </div>

                      {/* Cover Image */}
                      <div className="space-y-2">
                        <FormLabel>
                          Imagen de Portada
                          <span className="text-xs text-muted-foreground ml-2">
                            (Para cabecera del detalle)
                          </span>
                        </FormLabel>
                       <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                         {coverImagePreview ? (
                           <div className="space-y-2">
                             <img 
                               src={coverImagePreview} 
                               alt="Vista previa portada" 
                               className="w-full h-32 object-cover rounded-md"
                             />
                             <Button
                               type="button"
                               variant="outline"
                               size="sm"
                               onClick={() => {
                                 setCoverImageFile(null);
                                 setCoverImagePreview(null);
                               }}
                             >
                               Remover
                             </Button>
                           </div>
                         ) : (
                           <div className="text-center">
                             <Image className="mx-auto h-12 w-12 text-muted-foreground" />
                             <div className="mt-2">
                               <Button
                                 type="button"
                                 variant="outline"
                                 onClick={() => document.getElementById('cover-upload')?.click()}
                               >
                                 <Upload className="mr-2 h-4 w-4" />
                                 Subir Portada
                               </Button>
                               <input
                                 id="cover-upload"
                                 type="file"
                                 accept="image/*"
                                 className="hidden"
                                 onChange={(e) => {
                                   const file = e.target.files?.[0];
                                   if (file) handleImageUpload(file, 'cover');
                                 }}
                               />
                             </div>
                           </div>
                         )}
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 <div className="flex justify-end space-x-2">
                   <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                     Cancelar
                   </Button>
                   <Button type="submit" disabled={createRestaurantMutation.isPending || uploadingFiles}>
                     {createRestaurantMutation.isPending || uploadingFiles ? 'Creando...' : 'Crear Restaurante'}
                   </Button>
                 </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Restaurantes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sin Verificar</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.unverified}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Buscar por nombre o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="verified">Verificados</SelectItem>
                <SelectItem value="unverified">Sin Verificar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurante</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Tipo de Cocina</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Imágenes</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando restaurantes...
                  </TableCell>
                </TableRow>
              ) : filteredRestaurants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No se encontraron restaurantes
                  </TableCell>
                </TableRow>
              ) : (
                filteredRestaurants.map((restaurant: any) => (
                  <TableRow key={restaurant.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{restaurant.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {restaurant.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {restaurant.locations 
                            ? `${restaurant.locations.municipality}, ${restaurant.locations.province}`
                            : restaurant.location || 'Sin ubicación'
                          }
                        </span>
                      </div>
                      {restaurant.street_address && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {restaurant.street_address}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(restaurant as any).cuisine_types?.length > 0 ? (
                          (restaurant as any).cuisine_types.map((cuisine: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {cuisine}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            Sin especificar
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={restaurant.is_verified}
                          onCheckedChange={(checked) => 
                            toggleVerificationMutation.mutate({ 
                              id: restaurant.id, 
                              is_verified: checked 
                            })
                          }
                        />
                        <Badge variant={restaurant.is_verified ? "default" : "secondary"}>
                          {restaurant.is_verified ? 'Verificado' : 'Sin Verificar'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {restaurant.image_url && (
                          <Badge variant="outline" className="text-xs">
                            <Image className="h-3 w-3 mr-1" />
                            Principal
                          </Badge>
                        )}
                        {restaurant.cover_image_url && (
                          <Badge variant="outline" className="text-xs">
                            <Image className="h-3 w-3 mr-1" />
                            Portada
                          </Badge>
                        )}
                        {!restaurant.image_url && !restaurant.cover_image_url && (
                          <span className="text-xs text-muted-foreground">Sin imágenes</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {restaurant.phone && (
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        )}
                        {restaurant.website && (
                          <Globe className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Establishments;