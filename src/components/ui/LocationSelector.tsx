import { useState, useEffect, useRef } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import LocationSelectorSelect from './LocationSelectorSelect';

interface Location {
  id: string;
  municipality: string;
  province: string;
  autonomous_community: string;
  postal_code?: string;
  full_location: string;
}

interface LocationSelectorProps {
  value: string;
  onValueChange: (locationId: string, locationData?: Location) => void;
  placeholder?: string;
  className?: string;
  inDialog?: boolean;
}

const LocationSelector = ({ 
  value, 
  onValueChange, 
  placeholder = "Buscar ubicación...",
  className,
  inDialog = false
}: LocationSelectorProps) => {
  // Use Select-based component when inside a dialog to avoid portal conflicts
  if (inDialog) {
    return (
      <LocationSelectorSelect
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        className={className}
      />
    );
  }
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
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

  // Focus input when popover opens in dialog
  useEffect(() => {
    if (open && inDialog && inputRef.current) {
      // Small delay to ensure the popover is fully rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open, inDialog]);

  const handleSelect = (location: Location) => {
    setSelectedLocation(location);
    onValueChange(location.id, location);
    setOpen(false);
    setSearchQuery('');
  };

  const displayValue = selectedLocation 
    ? `${selectedLocation.municipality}, ${selectedLocation.province}` 
    : placeholder;

  return (
    <Popover 
      open={open} 
      onOpenChange={setOpen}
      modal={inDialog}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2 text-left truncate">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{displayValue}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-80 p-0 bg-background border shadow-lg",
          inDialog ? "z-[9999]" : "z-[100]"
        )} 
        align="start"
        onCloseAutoFocus={(e) => inDialog && e.preventDefault()}
        onPointerDownOutside={(e) => inDialog && e.preventDefault()}
        onInteractOutside={(e) => inDialog && e.preventDefault()}
        side="bottom"
        avoidCollisions={true}
        collisionPadding={8}
      >
        <Command shouldFilter={false}>
          <CommandInput
            ref={inputRef}
            placeholder="Escribe una ciudad, provincia o código postal..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading && (
              <CommandEmpty>Buscando ubicaciones...</CommandEmpty>
            )}
            {!loading && searchQuery && locations.length === 0 && (
              <CommandEmpty>No se encontraron ubicaciones.</CommandEmpty>
            )}
            {!loading && searchQuery && locations.length > 0 && (
              <CommandGroup>
                {locations.map((location) => (
                  <CommandItem
                    key={location.id}
                    value={location.id}
                    onSelect={() => handleSelect(location)}
                    className="flex items-center justify-between"
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
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {!searchQuery && (
              <CommandEmpty>
                Comienza a escribir para buscar ubicaciones...
              </CommandEmpty>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default LocationSelector;