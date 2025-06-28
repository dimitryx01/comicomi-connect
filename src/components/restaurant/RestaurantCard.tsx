
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Phone, Globe, CheckCircle, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SaveButton } from "@/components/ui/SaveButton";

interface RestaurantCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  coverImageUrl: string;
  cuisineType: string;
  address: string;
  location: string;
  phone?: string;
  website?: string;
  averageRating: number;
  reviewsCount: number;
  isVerified?: boolean;
}

const RestaurantCard = ({
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
  isVerified = false
}: RestaurantCardProps) => {
  const navigate = useNavigate();

  const handleViewRestaurant = () => {
    navigate(`/restaurants/${id}`);
  };

  const displayImage = coverImageUrl || imageUrl || "/placeholder.svg";

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <div className="aspect-[4/3] overflow-hidden">
          <img 
            src={displayImage} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {isVerified && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verificado
            </Badge>
          </div>
        )}
        
        <div className="absolute top-2 left-2">
          <Badge variant="outline" className="bg-white/90 text-gray-800">
            {cuisineType}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg line-clamp-1 mb-1 group-hover:text-primary transition-colors">
              {name}
            </h3>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {description}
            </p>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{averageRating.toFixed(1)}</span>
            <span>({reviewsCount} reseñas)</span>
          </div>
        </div>

        {(phone || website) && (
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
            {phone && (
              <div className="flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span className="truncate">{phone}</span>
              </div>
            )}
            {website && (
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span className="truncate">Web</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button onClick={handleViewRestaurant} className="flex-1 mr-2">
            <Eye className="h-4 w-4 mr-2" />
            Ver restaurante
          </Button>
          
          <SaveButton
            contentId={id}
            contentType="restaurant"
            variant="outline"
            showText={false}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;
