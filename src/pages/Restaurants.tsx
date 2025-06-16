
import { useState } from 'react';
import { Filter, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import { restaurants } from '@/data/mockData';

const Restaurants = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');

  const filters = [
    { id: 'all', label: 'All Cuisines' },
    { id: 'italian', label: 'Italian' },
    { id: 'mexican', label: 'Mexican' },
    { id: 'asian', label: 'Asian' },
    { id: 'american', label: 'American' },
    { id: 'mediterranean', label: 'Mediterranean' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Restaurants</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {filters.map((filter) => (
            <Badge
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedFilter(filter.id)}
            >
              {filter.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <RestaurantCard 
            key={restaurant.id} 
            id={restaurant.id}
            name={restaurant.name}
            cuisine={restaurant.cuisine}
            rating={restaurant.rating}
            imageUrl={restaurant.imageUrl}
            location={restaurant.location}
            reviewCount={restaurant.reviewCount}
          />
        ))}
      </div>
    </div>
  );
};

export default Restaurants;
