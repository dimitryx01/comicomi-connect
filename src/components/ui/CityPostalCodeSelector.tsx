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

  // Validación flexible del código postal
  useEffect(() => {
    const validateCode = async () => {
      if (!postalCodeQuery) {
        setIsValidPostalCode(null);
        onPostalCodeChange(null);
        return;
      }

      if (selectedCity && postalCodeQuery.length >= 4) {
        // Validación flexible: verificar formato y rangos lógicos
        const code = postalCodeQuery.padStart(5, '0');
        
        // Validación básica de formato (5 dígitos)
        if (code.length === 5 && /^\d{5}$/.test(code)) {
          // Intentar validación estricta primero
          const isStrictValid = await validatePostalCode(selectedCity.id, code);
          
          if (isStrictValid) {
            setIsValidPostalCode(true);
            onPostalCodeChange(code);
          } else {
            // Validación flexible por rangos conocidos por provincia
            const firstTwo = parseInt(code.substring(0, 2));
            let isFlexibleValid = false;
            
            // Rangos aproximados por comunidad autónoma
            if (selectedCity.autonomous_community === 'Cataluña' && (firstTwo >= 8 && firstTwo <= 25)) {
              isFlexibleValid = true;
            } else if (selectedCity.autonomous_community === 'Madrid' && (firstTwo >= 28 && firstTwo <= 28)) {
              isFlexibleValid = true;
            } else if (selectedCity.autonomous_community === 'Andalucía' && (firstTwo >= 4 && firstTwo <= 23)) {
              isFlexibleValid = true;
            } else if (selectedCity.autonomous_community === 'Valencia' && (firstTwo >= 3 && firstTwo <= 12)) {
              isFlexibleValid = true;
            }
            // Agregar más rangos según necesidad
            
            if (isFlexibleValid) {
              setIsValidPostalCode(true);
              onPostalCodeChange(code);
            } else {
              setIsValidPostalCode(false);
              onPostalCodeChange(null);
            }
          }
        } else {
          setIsValidPostalCode(false);
          onPostalCodeChange(null);
        }
      } else {
        setIsValidPostalCode(null);
        onPostalCodeChange(null);
      }
    };

    const delayedValidation = setTimeout(validateCode, 500);
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
    
    // Limitar a 5 dígitos
    if (value.length > 5) {
      value = value.slice(0, 5);
    }
    
    setPostalCodeQuery(value);
  };

  // Formatear código postal al perder el foco
  const handlePostalCodeBlur = () => {
    if (postalCodeQuery.length === 4 && selectedCity?.autonomous_community === 'Cataluña') {
      const formattedCode = '0' + postalCodeQuery;
      setPostalCodeQuery(formattedCode);
    }
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
              placeholder="Ej: 08016 (opcional)"
              value={postalCodeQuery}
              onChange={handlePostalCodeChange}
              onBlur={handlePostalCodeBlur}
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
              El código postal "{postalCodeQuery.padStart(5, '0')}" no parece válido para {selectedCity.municipality}
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