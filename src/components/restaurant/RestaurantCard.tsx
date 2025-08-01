
import { useState, memo } from 'react';
import { MapPin, Star, Heart, Bookmark, Clock, Phone, Globe, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { SaveButton } from '@/components/ui/SaveButton';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RestaurantCardProps {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  coverImageUrl?: string;
  cuisineType?: string;
  address?: string;
  location?: string;
  phone?: string;
  website?: string;
  averageRating: number;
  reviewsCount: number;
  isVerified: boolean;
  onSaveToggle?: (restaurantId: string) => void;
  isSaved?: boolean;
}

const RestaurantCard = memo(({
  id,
  name,
  description,
  imageUrl,
  coverImageUrl,
  cuisineType,
  address,
  location,
  phone,
  website,
  averageRating,
  reviewsCount,
  isVerified,
  onSaveToggle,
  isSaved = false
}: RestaurantCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCardClick = () => {
    navigate(`/restaurants/${id}`);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSaveToggle) {
      onSaveToggle(id);
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleReportRestaurant = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para reportar",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          restaurant_id: id,
          report_type: 'inappropriate_content',
          description: 'Restaurante reportado desde la interfaz',
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Reporte enviado",
        description: "Hemos recibido tu reporte y será revisado por nuestro equipo"
      });
    } catch (error) {
      console.error('Error reporting restaurant:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte",
        variant: "destructive"
      });
    }
  };

  // Determinar si mostrar el botón de guardar para usuarios autenticados
  const showSaveButton = !!user;
  const savedState = isSaved;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-sm bg-white">
      <div onClick={handleCardClick}>
        {/* Cover Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-200 overflow-hidden">
          {coverImageUrl || imageUrl ? (
            <img 
              src={coverImageUrl || imageUrl} 
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-orange-50 to-red-100">
              <div className="text-center">
                <div className="text-4xl mb-2">🍽️</div>
                <p className="text-sm text-gray-500">Restaurante</p>
              </div>
            </div>
          )}
          
          {/* Verified Badge */}
          {isVerified && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-blue-500 text-white border-0 backdrop-blur-sm">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Verificado
              </Badge>
            </div>
          )}
          
          {/* Cuisine Type Badge */}
          {cuisineType && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-white/90 text-gray-700 border backdrop-blur-sm font-medium">
                {cuisineType}
              </Badge>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Restaurant Name, Rating and Options Menu */}
        <div onClick={handleCardClick}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start justify-between flex-1">
              <h3 className="font-bold text-xl text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors flex-1 mr-3">
                {name}
              </h3>
              
              {/* Options Menu moved here */}
              <div onClick={handleOptionsClick} className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium text-sm text-gray-700">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
                  </span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleReportRestaurant}>
                      Reportar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          
          {description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {description}
            </p>
          )}
        </div>

        {/* Location and Contact Info */}
        <div onClick={handleCardClick}>
          <div className="space-y-2">
            {address && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <span className="line-clamp-1">{address}</span>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {phone && (
                <div className="flex items-center gap-1" onClick={handleActionClick}>
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{phone}</span>
                </div>
              )}
              
              {website && (
                <div className="flex items-center gap-1" onClick={handleActionClick}>
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span className="text-blue-600 hover:underline">Sitio web</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row with Save Button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div onClick={handleCardClick} className="flex items-center gap-1 text-sm text-gray-600">
            <Star className="h-4 w-4 text-gray-500" />
            <span>{reviewsCount} reseña{reviewsCount !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="flex items-center gap-3">
            {showSaveButton && (
              <div onClick={handleSaveClick}>
                <SaveButton
                  isSaved={savedState}
                  onToggle={() => {}}
                />
              </div>
            )}
            
            <div onClick={handleCardClick} className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded cursor-pointer hover:bg-gray-100 transition-colors">
              Ver detalles →
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default RestaurantCard;
