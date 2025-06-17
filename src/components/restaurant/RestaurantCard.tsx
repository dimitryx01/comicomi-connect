
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { LazyImage } from "@/components/ui/LazyImage";

export interface RestaurantProps {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  imageUrl?: string;
  location: string;
  reviewCount: number;
}

const RestaurantCard = ({
  id,
  name,
  cuisine,
  rating,
  imageUrl,
  location,
  reviewCount,
}: RestaurantProps) => {
  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : i < rating
                ? "fill-yellow-400 text-yellow-400 fill-opacity-50"
                : "text-muted-foreground"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
        <span className="ml-1 text-xs text-muted-foreground">({reviewCount})</span>
      </div>
    );
  };

  return (
    <Link to={`/restaurant/${id}`}>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md border-none animate-scale-in">
        <div className="relative aspect-video overflow-hidden">
          <LazyImage
            src={imageUrl || '/placeholder.svg'}
            alt={name}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-base line-clamp-1">{name}</h3>
              <Badge variant="outline" className="mt-1 bg-secondary">
                {cuisine}
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{location}</p>
          <div className="mt-2">
            {renderStars(rating)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default RestaurantCard;
