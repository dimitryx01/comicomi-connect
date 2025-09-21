import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Location {
  id: string;
  municipality: string;
  province: string;
  autonomous_community: string;
  postal_code?: string;
  full_location: string;
}

interface LocationSelectorSelectProps {
  value: string;
  onValueChange: (locationId: string, locationData?: Location) => void;
  placeholder?: string;
  className?: string;
}

const LocationSelectorSelect = ({ 
  value, 
  onValueChange, 
  placeholder = "Buscar ubicación...",
  className
}: LocationSelectorSelectProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchLocations = async (query: string) => {
    if (!query || query.length < 2) {
      setLocations([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_locations_intelligent', {
        search_query: query,
        p_limit: 15
      });

      if (error) throw error;

      const formattedLocations: Location[] = (data || []).map((item: any) => ({
        id: item.id,
        municipality: item.municipality,
        province: item.province,
        autonomous_community: item.autonomous_community,
        postal_code: item.postal_code,
        full_location: item.full_location
      }));

      setLocations(formattedLocations);
    } catch (error) {
      console.error('Error searching locations:', error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Load selected location on mount if value exists
  useEffect(() => {
    const loadSelectedLocation = async () => {
      if (value && !selectedLocation) {
        try {
          const { data, error } = await supabase
            .from('locations')
            .select('id, municipality, province, autonomous_community, postal_code')
            .eq('id', value)
            .single();

          if (error) throw error;

          if (data) {
            const location: Location = {
              id: data.id,
              municipality: data.municipality,
              province: data.province,
              autonomous_community: data.autonomous_community,
              postal_code: data.postal_code,
              full_location: `${data.municipality}, ${data.province}, ${data.autonomous_community}`
            };
            setSelectedLocation(location);
            setSearchQuery(`${location.municipality}, ${location.province}`);
          }
        } catch (error) {
          console.error('Error loading selected location:', error);
        }
      }
    };

    loadSelectedLocation();
  }, [value, selectedLocation]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (location: Location) => {
    setSelectedLocation(location);
    setSearchQuery(`${location.municipality}, ${location.province}`);
    onValueChange(location.id, location);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(true);
    
    // Clear selection if user is typing something different
    if (selectedLocation && value !== `${selectedLocation.municipality}, ${selectedLocation.province}`) {
      setSelectedLocation(null);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-4"
        />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-auto rounded-md border bg-popover shadow-lg">
          {loading && (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              Buscando ubicaciones...
            </div>
          )}
          {!loading && searchQuery && locations.length === 0 && (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              No se encontraron ubicaciones.
            </div>
          )}
          {!loading && searchQuery && locations.length > 0 && (
            <div className="py-1">
              {locations.map((location) => (
                <Button
                  key={location.id}
                  variant="ghost"
                  className="w-full justify-between px-4 py-2 h-auto text-left"
                  onClick={() => handleSelect(location)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{location.municipality}</span>
                    <span className="text-sm text-muted-foreground">
                      {location.province}, {location.autonomous_community}
                      {location.postal_code && ` • ${location.postal_code}`}
                    </span>
                  </div>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4",
                      value === location.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </Button>
              ))}
            </div>
          )}
          {!searchQuery && (
            <div className="px-4 py-2 text-sm text-muted-foreground">
              Comienza a escribir para buscar ubicaciones...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSelectorSelect;