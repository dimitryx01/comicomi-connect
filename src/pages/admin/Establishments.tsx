import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useNavigationPreservation } from '@/hooks/useNavigationPreservation';
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
import { Plus, Edit, Eye, CheckCircle, XCircle, Search, MapPin, Phone, Globe, Upload, Image, Trash2 } from 'lucide-react';
import { OptimizedRestaurantImage } from '@/components/ui/OptimizedRestaurantImage';
import { RestaurantViewDialog } from '@/components/admin/RestaurantViewDialog';
import { RestaurantEditDialog } from '@/components/admin/RestaurantEditDialog';
import { RestaurantDeleteDialog } from '@/components/admin/RestaurantDeleteDialog';
import { RestaurantTableSkeleton } from '@/components/admin/RestaurantTableSkeleton';
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
  website: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'URL inválida'
  }),
  cuisine_types: z.array(z.string()).min(1, 'Debe seleccionar al menos un tipo de cocina'),
  image_url: z.string().optional(),
  cover_image_url: z.string().optional(),
});

type CreateRestaurantForm = z.infer<typeof createRestaurantSchema>;

const Establishments: React.FC = () => {
  const { hasRole, adminUser } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const { uploadFile, uploading: uploadingFiles } = useOptimizedUpload();
  
  // Navigation preservation
  const { restoreState } = useNavigationPreservation('establishments', {
    searchTerm,
    statusFilter
  });

  // Restore state on mount
  useEffect(() => {
    const savedState = restoreState();
    if (savedState?.filters) {
      setSearchTerm(savedState.filters.searchTerm || '');
      setStatusFilter(savedState.filters.statusFilter || 'all');
    }
  }, [restoreState]);

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

  // Optimized restaurant fetch with aggressive caching
  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      // First, get basic restaurant data with better performance
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          id,
          name,
          description,
          image_url,
          cover_image_url,
          street_address,
          address,
          phone,
          email,
          website,
          is_verified,
          created_at,
          updated_at,
          location_id,
          locations!inner (
            municipality,
            province,
            autonomous_community
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get cuisine types in a separate, optimized query
      const restaurantIds = data?.map(r => r.id) || [];
      const { data: cuisineData, error: cuisineError } = await supabase
        .from('restaurant_cuisines')
        .select(`
          restaurant_id,
          cuisines!inner (
            name
          )
        `)
        .in('restaurant_id', restaurantIds);
      
      if (cuisineError) {
        console.warn('Error loading cuisines:', cuisineError);
      }
      
      // Transform data to include cuisine_types array
      return (data || []).map(restaurant => ({
        ...restaurant,
        cuisine_types: cuisineData
          ?.filter(rc => rc.restaurant_id === restaurant.id)
          ?.map(rc => rc.cuisines.name) || []
      }));
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - aggressive caching for admin data
    gcTime: 60 * 60 * 1000, // 1 hour - keep in cache longer
    refetchOnWindowFocus: false, // Don't refetch when returning to tab
    refetchOnMount: false, // Don't refetch when component remounts
  });

  // Create restaurant mutation
  const createRestaurantMutation = useMutation({
    mutationFn: async (restaurantData: CreateRestaurantForm) => {
      if (!adminUser) {
        throw new Error('No admin user found');
      }

      let imageUrl = '';
      let coverImageUrl = '';

      // Upload images if provided
      if (imageFile) {
        const imageResult = await uploadFile(imageFile, 'restaurants', 'restaurant');
        if (imageResult.success && imageResult.fileId) {
          imageUrl = imageResult.fileId; // Store public URL directly (stored in fileId for restaurant type)
        }
      }

      if (coverImageFile) {
        const coverResult = await uploadFile(coverImageFile, 'restaurants', 'restaurant');
        if (coverResult.success && coverResult.fileId) {
          coverImageUrl = coverResult.fileId; // Store public URL directly (stored in fileId for restaurant type)
        }
      }

      // Prepare cuisine IDs
      const cuisineIds = restaurantData.cuisine_types.map(cuisineName => {
        const cuisine = cuisines.find(c => c.name === cuisineName);
        return cuisine?.id;
      }).filter(Boolean);

      const requestData = {
        name: restaurantData.name,
        description: restaurantData.description,
        location_id: restaurantData.location_id,
        street_address: restaurantData.street_address,
        phone: restaurantData.phone || null,
        email: restaurantData.email || null,
        website: restaurantData.website || null,
        image_url: imageUrl || null,
        cover_image_url: coverImageUrl || null,
        cuisine_ids: cuisineIds
      };

      // Use the admin edge function to create the restaurant
      const { data: result, error } = await supabase.functions.invoke('admin-create-restaurant', {
        body: {
          adminUserId: adminUser.id,
          restaurantData: requestData
        }
      });

      if (error) {
        console.error('[DEBUG] Edge function error:', error);
        throw error;
      }

      if (!result.success) {
        console.error('[DEBUG] Restaurant creation failed:', result.error);
        throw new Error(result.error);
      }

      console.log('[DEBUG] Restaurant created successfully:', result.restaurant);
      return result.restaurant;
    },
    onSuccess: (newRestaurant) => {
      // Optimistic update instead of invalidation
      queryClient.setQueryData(['restaurants'], (oldData: any[]) => {
        return [newRestaurant, ...(oldData || [])];
      });
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
    onSuccess: (updatedRestaurant) => {
      // Optimistic update for verification status
      queryClient.setQueryData(['restaurants'], (oldData: any[]) => {
        return (oldData || []).map((restaurant: any) =>
          restaurant.id === updatedRestaurant.id ? updatedRestaurant : restaurant
        );
      });
      toast.success('Estado de verificación actualizado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar estado');
    },
  });

  // Update restaurant mutation
  const updateRestaurantMutation = useMutation({
    mutationFn: async (restaurantData: any) => {
      const { imageFile, coverImageFile, ...formData } = restaurantData;
      
      let updates: any = {
        name: formData.name,
        description: formData.description,
        location_id: formData.location_id,
        street_address: formData.street_address,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
      };

      // Upload new images if provided
      if (imageFile) {
        const imageResult = await uploadFile(imageFile, 'restaurants', 'restaurant');
        if (imageResult.success && imageResult.fileId) {
          updates.image_url = imageResult.fileId;
        }
      }

      if (coverImageFile) {
        const coverResult = await uploadFile(coverImageFile, 'restaurants', 'restaurant');
        if (coverResult.success && coverResult.fileId) {
          updates.cover_image_url = coverResult.fileId;
        }
      }

      // Update restaurant
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', selectedRestaurant.id)
        .select()
        .single();

      if (error) throw error;

      // Update cuisine types if they changed
      if (formData.cuisine_types && formData.cuisine_types.length > 0) {
        // Delete existing cuisine relationships
        await supabase
          .from('restaurant_cuisines')
          .delete()
          .eq('restaurant_id', selectedRestaurant.id);

        // Insert new ones
        const cuisineIds = formData.cuisine_types.map((cuisineName: string) => {
          const cuisine = cuisines.find(c => c.name === cuisineName);
          return cuisine?.id;
        }).filter(Boolean);

        if (cuisineIds.length > 0) {
          const cuisineInserts = cuisineIds.map((cuisineId: string) => ({
            restaurant_id: selectedRestaurant.id,
            cuisine_id: cuisineId
          }));

          await supabase
            .from('restaurant_cuisines')
            .insert(cuisineInserts);
        }
      }

      return restaurant;
    },
    onSuccess: (updatedRestaurant) => {
      // Optimistic update for restaurant edit
      queryClient.setQueryData(['restaurants'], (oldData: any[]) => {
        return (oldData || []).map((restaurant: any) =>
          restaurant.id === selectedRestaurant.id ? { ...restaurant, ...updatedRestaurant } : restaurant
        );
      });
      setEditDialogOpen(false);
      setSelectedRestaurant(null);
      toast.success('Restaurante actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar restaurante');
    },
  });

  // Delete restaurant mutation
  const deleteRestaurantMutation = useMutation({
    mutationFn: async (restaurantId: string) => {
      // Delete cuisine relationships first
      await supabase
        .from('restaurant_cuisines')
        .delete()
        .eq('restaurant_id', restaurantId);

      // Delete the restaurant
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', restaurantId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Optimistic removal from list
      queryClient.setQueryData(['restaurants'], (oldData: any[]) => {
        return (oldData || []).filter((restaurant: any) => restaurant.id !== selectedRestaurant.id);
      });
      setDeleteDialogOpen(false);
      setSelectedRestaurant(null);
      toast.success('Restaurante eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar restaurante');
    },
  });

  const handleCreateRestaurant = (data: CreateRestaurantForm) => {
    createRestaurantMutation.mutate(data);
  };

  // Dialog handlers
  const handleViewRestaurant = (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    setViewDialogOpen(true);
  };

  const handleEditRestaurant = (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    setEditDialogOpen(true);
  };

  const handleDeleteRestaurant = (restaurant: any) => {
    setSelectedRestaurant(restaurant);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedRestaurant) {
      deleteRestaurantMutation.mutate(selectedRestaurant.id);
    }
  };

  const handleSaveEdit = (data: any) => {
    updateRestaurantMutation.mutate(data);
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
            {isLoading ? (
              <RestaurantTableSkeleton />
            ) : (
              <TableBody>
                {filteredRestaurants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
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
                      {(restaurant.street_address || restaurant.address) && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {restaurant.street_address || restaurant.address}
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
                        {restaurant.image_url ? (
                          <div className="flex items-center space-x-1">
                          <OptimizedRestaurantImage
                            fileId={restaurant.image_url}
                            alt="Principal"
                            className="w-8 h-8 rounded object-cover"
                            variant="main"
                          />
                            <Badge variant="outline" className="text-xs">
                              <Image className="h-3 w-3 mr-1" />
                              Principal
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <div className="w-8 h-8 rounded bg-muted/50 flex items-center justify-center">
                              <Image className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              Sin imagen
                            </Badge>
                          </div>
                        )}
                        {restaurant.cover_image_url ? (
                          <div className="flex items-center space-x-1">
                          <OptimizedRestaurantImage
                            fileId={restaurant.cover_image_url}
                            alt="Portada"
                            className="w-8 h-8 rounded object-cover"
                            variant="cover"
                          />
                            <Badge variant="outline" className="text-xs">
                              <Image className="h-3 w-3 mr-1" />
                              Portada
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <div className="w-8 h-8 rounded bg-muted/50 flex items-center justify-center">
                              <Image className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              Sin portada
                            </Badge>
                          </div>
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
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewRestaurant(restaurant)}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditRestaurant(restaurant)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteRestaurant(restaurant)}
                          title="Eliminar"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
                )}
              </TableBody>
            )}
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <RestaurantViewDialog
        restaurant={selectedRestaurant}
        isOpen={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedRestaurant(null);
        }}
        onEdit={() => {
          setViewDialogOpen(false);
          setEditDialogOpen(true);
        }}
      />

      <RestaurantEditDialog
        restaurant={selectedRestaurant}
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedRestaurant(null);
        }}
        onSave={handleSaveEdit}
        cuisines={cuisines}
        isLoading={updateRestaurantMutation.isPending}
      />

      <RestaurantDeleteDialog
        restaurant={selectedRestaurant}
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedRestaurant(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={deleteRestaurantMutation.isPending}
      />
    </div>
  );
};

export default Establishments;