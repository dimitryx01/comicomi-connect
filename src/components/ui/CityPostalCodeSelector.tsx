import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Check } from 'lucide-react';
import { useLocations, City, PostalCode } from '@/hooks/useLocations';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CityPostalCodeSelectorProps {
  cityId?: string;
  postalCode?: string;
  onCityChange: (cityId: string | null, cityData: City | null) => void;
  onPostalCodeChange: (postalCode: string | null) => void;
  placeholder?: string;
  className?: string;
}

export const CityPostalCodeSelector: React.FC<CityPostalCodeSelectorProps> = ({
  cityId,
  postalCode,
  onCityChange,
  onPostalCodeChange,
  placeholder = "Buscar ciudad...",
  className = ""
}) => {
  const [cityQuery, setCityQuery] = useState('');
  const [postalCodeQuery, setPostalCodeQuery] = useState(postalCode || '');
  const [cities, setCities] = useState<City[]>([]);
  const [availablePostalCodes, setAvailablePostalCodes] = useState<PostalCode[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isValidPostalCode, setIsValidPostalCode] = useState<boolean | null>(null);
  
  const { 
    searchCities, 
    getCityById, 
    getPostalCodesForCity, 
    validatePostalCode, 
    loading 
  } = useLocations();
  
  const cityInputRef = useRef<HTMLInputElement>(null);
  const postalCodeInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load initial city if cityId is provided
  useEffect(() => {
    if (cityId && !selectedCity) {
      getCityById(cityId).then((city) => {
        if (city) {
          setSelectedCity(city);
          setCityQuery(city.full_location);
        }
      });
    }
  }, [cityId, selectedCity, getCityById]);

  // Search cities with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (cityQuery.length >= 2 && showCityDropdown) {
        const results = await searchCities(cityQuery);
        setCities(results);
      } else {
        setCities([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [cityQuery, showCityDropdown, searchCities]);

  // Load postal codes when city is selected
  useEffect(() => {
    if (selectedCity) {
      getPostalCodesForCity(selectedCity.id).then(setAvailablePostalCodes);
    } else {
      setAvailablePostalCodes([]);
    }
  }, [selectedCity, getPostalCodesForCity]);

  // Validate postal code when it changes
  useEffect(() => {
    const validateCode = async () => {
      if (selectedCity && postalCodeQuery.length >= 4) {
        // Intentar validar tanto con el código original como con formato normalizado
        const codes = [
          postalCodeQuery,
          postalCodeQuery.padStart(5, '0'), // Agregar ceros al inicio
          postalCodeQuery.length === 4 && selectedCity.autonomous_community === 'Cataluña' 
            ? '0' + postalCodeQuery 
            : postalCodeQuery
        ].filter((code, index, self) => self.indexOf(code) === index); // Eliminar duplicados
        
        let isValid = false;
        for (const code of codes) {
          if (code.length === 5) {
            isValid = await validatePostalCode(selectedCity.id, code);
            if (isValid) break;
          }
        }
        
        setIsValidPostalCode(isValid);
        if (isValid) {
          // Enviar el código postal formateado correctamente
          const formattedCode = postalCodeQuery.padStart(5, '0');
          onPostalCodeChange(formattedCode);
        } else if (postalCodeQuery.length >= 5) {
          onPostalCodeChange(null);
        }
      } else {
        setIsValidPostalCode(null);
        onPostalCodeChange(null);
      }
    };

    const delayedValidation = setTimeout(validateCode, 300);
    return () => clearTimeout(delayedValidation);
  }, [selectedCity, postalCodeQuery, validatePostalCode, onPostalCodeChange]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !cityInputRef.current?.contains(event.target as Node)
      ) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setCityQuery(city.full_location);
    setShowCityDropdown(false);
    onCityChange(city.id, city);
    
    // Clear postal code when city changes
    setPostalCodeQuery('');
    onPostalCodeChange(null);
    setIsValidPostalCode(null);
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCityQuery(value);
    setShowCityDropdown(true);
    
    if (!value) {
      setSelectedCity(null);
      onCityChange(null, null);
      setPostalCodeQuery('');
      onPostalCodeChange(null);
      setIsValidPostalCode(null);
    }
  };

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Solo números
    
    // Auto-formatear: agregar cero inicial si es necesario para códigos españoles
    if (value.length === 4 && selectedCity?.autonomous_community === 'Cataluña') {
      value = '0' + value; // Para códigos como 8016 -> 08016
    }
    
    // Limitar a 5 dígitos
    if (value.length > 5) {
      value = value.slice(0, 5);
    }
    
    setPostalCodeQuery(value);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* City Selector */}
      <div className="space-y-2">
        <Label htmlFor="city-search">Ciudad *</Label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              ref={cityInputRef}
              id="city-search"
              type="text"
              placeholder={placeholder}
              value={cityQuery}
              onChange={handleCityInputChange}
              onFocus={() => setShowCityDropdown(true)}
              className="pl-10"
              autoComplete="off"
            />
          </div>

          {/* City Dropdown */}
          {showCityDropdown && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {loading && (
                <div className="p-3 text-sm text-muted-foreground">
                  Buscando ciudades...
                </div>
              )}
              
              {!loading && cityQuery.length >= 2 && cities.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground">
                  No se encontraron ciudades
                </div>
              )}
              
              {!loading && cityQuery.length < 2 && (
                <div className="p-3 text-sm text-muted-foreground">
                  Escribe al menos 2 caracteres para buscar
                </div>
              )}
              
              {cities.map((city) => (
                <div
                  key={city.id}
                  className="p-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0"
                  onClick={() => handleCitySelect(city)}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{city.municipality}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {city.province}, {city.autonomous_community}
                      </div>
                    </div>
                    {selectedCity?.id === city.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Postal Code Input */}
      {selectedCity && (
        <div className="space-y-2">
          <Label htmlFor="postal-code">
            Código Postal <span className="text-muted-foreground">(opcional pero recomendado)</span>
          </Label>
          <div className="relative">
            <Input
              ref={postalCodeInputRef}
              id="postal-code"
              type="text"
              placeholder="Ej: 08016 o 8016"
              value={postalCodeQuery}
              onChange={handlePostalCodeChange}
              maxLength={5}
              className={`${
                isValidPostalCode === false 
                  ? 'border-destructive focus-visible:ring-destructive' 
                  : isValidPostalCode === true 
                  ? 'border-green-500 focus-visible:ring-green-500' 
                  : ''
              }`}
            />
            {isValidPostalCode === true && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-4 w-4" />
            )}
          </div>
          
          {isValidPostalCode === false && postalCodeQuery.length >= 4 && (
            <p className="text-sm text-destructive">
              El código postal "{postalCodeQuery.padStart(5, '0')}" no pertenece a {selectedCity.municipality}
            </p>
          )}
          
          {availablePostalCodes.length > 0 && postalCodeQuery.length < 5 && (
            <div className="text-sm text-muted-foreground">
              Códigos postales disponibles para {selectedCity.municipality}: {' '}
              {availablePostalCodes.slice(0, 5).map(pc => pc.postal_code).join(', ')}
              {availablePostalCodes.length > 5 && ` y ${availablePostalCodes.length - 5} más`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};