import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
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
  placeholder = "Seleccionar ubicación...",
  className
}: LocationSelectorSelectProps) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);

  // Load initial popular locations
  useEffect(() => {
    const loadPopularLocations = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('search_locations_intelligent', {
          search_query: '',
          p_limit: 50
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
        console.error('Error loading locations:', error);
        setLocations([]);
      } finally {
        setLoading(false);
      }
    };

    loadPopularLocations();
  }, []);

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
          }
        } catch (error) {
          console.error('Error loading selected location:', error);
        }
      }
    };

    loadSelectedLocation();
  }, [value, selectedLocation]);

  const handleSelect = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      setSelectedLocation(location);
      onValueChange(locationId, location);
    }
  };

  const displayValue = selectedLocation 
    ? `${selectedLocation.municipality}, ${selectedLocation.province}` 
    : undefined;

  return (
    <Select value={value} onValueChange={handleSelect}>
      <SelectTrigger className={cn("w-full", className)}>
        <div className="flex items-center gap-2 text-left truncate">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <SelectValue placeholder={placeholder}>
            {displayValue && <span className="truncate">{displayValue}</span>}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {loading && (
          <SelectItem value="loading" disabled>
            Cargando ubicaciones...
          </SelectItem>
        )}
        {!loading && locations.length === 0 && (
          <SelectItem value="empty" disabled>
            No hay ubicaciones disponibles
          </SelectItem>
        )}
        {!loading && locations.length > 0 && locations.map((location) => (
          <SelectItem key={location.id} value={location.id}>
            <div className="flex flex-col">
              <span className="font-medium">{location.municipality}</span>
              <span className="text-sm text-muted-foreground">
                {location.province}, {location.autonomous_community}
                {location.postal_code && ` • ${location.postal_code}`}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LocationSelectorSelect;