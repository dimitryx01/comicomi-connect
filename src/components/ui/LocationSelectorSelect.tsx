import React from 'react';
import { CityPostalCodeSelector } from './CityPostalCodeSelector';
import { City } from '@/hooks/useLocations';

interface LocationSelectorSelectProps {
  value?: string;
  postalCode?: string;
  onValueChange: (cityId: string | null, cityData: City | null) => void;
  onPostalCodeChange?: (postalCode: string | null) => void;
  placeholder?: string;
  className?: string;
}

export const LocationSelectorSelect: React.FC<LocationSelectorSelectProps> = ({
  value,
  postalCode,
  onValueChange,
  onPostalCodeChange,
  placeholder = "Buscar ciudad...",
  className = ""
}) => {
  return (
    <CityPostalCodeSelector
      cityId={value}
      postalCode={postalCode}
      onCityChange={onValueChange}
      onPostalCodeChange={onPostalCodeChange || (() => {})}
      placeholder={placeholder}
      className={className}
    />
  );
};

export default LocationSelectorSelect;