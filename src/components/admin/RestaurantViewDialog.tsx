import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { RestaurantImage } from '@/components/ui/RestaurantImage';
import { MapPin, Phone, Globe, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  cover_image_url: string | null;
  street_address: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  cuisine_types: string[];
  locations?: {
    municipality: string;
    province: string;
    autonomous_community: string;
  };
}

interface RestaurantViewDialogProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export const RestaurantViewDialog: React.FC<RestaurantViewDialogProps> = ({
  restaurant,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!restaurant) return null;

  const locationText = restaurant.locations 
    ? `${restaurant.locations.municipality}, ${restaurant.locations.province}, ${restaurant.locations.autonomous_community}`
    : 'Ubicación no especificada';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {restaurant.name}
            {restaurant.is_verified ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Images Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Imagen Principal</h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <RestaurantImage
                  fileId={restaurant.image_url}
                  alt={`${restaurant.name} - Imagen principal`}
                  className="w-full h-full object-cover"
                  variant="main"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Imagen de Portada</h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <RestaurantImage
                  fileId={restaurant.cover_image_url}
                  alt={`${restaurant.name} - Portada`}
                  className="w-full h-full object-cover"
                  variant="cover"
                />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Descripción</h3>
              <p className="text-sm leading-relaxed">{restaurant.description}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Tipos de Cocina</h3>
              <div className="flex flex-wrap gap-2">
                {restaurant.cuisine_types.map((cuisine) => (
                  <Badge key={cuisine} variant="secondary">
                    {cuisine}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Ubicación</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="text-sm">
                    <div>{locationText}</div>
                    <div className="text-muted-foreground">{restaurant.street_address}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Contacto</h3>
              <div className="space-y-2">
                {restaurant.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{restaurant.phone}</span>
                  </div>
                )}
                
                {restaurant.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{restaurant.email}</span>
                  </div>
                )}
                
                {restaurant.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={restaurant.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {restaurant.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Fecha de Creación</h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(restaurant.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Última Actualización</h3>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(restaurant.updated_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Estado:</span>
              <Badge variant={restaurant.is_verified ? "default" : "destructive"}>
                {restaurant.is_verified ? "Verificado" : "No Verificado"}
              </Badge>
            </div>
            
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-sm text-primary hover:underline"
              >
                Editar Restaurante
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};