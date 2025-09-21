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

  // Definir rangos específicos por ciudad principal
  const getCityPostalCodeRanges = (city: City | null): { min: number; max: number } | null => {
    if (!city) return null;
    
    const cityName = city.municipality.toLowerCase();
    
    // Rangos específicos para ciudades principales de Cataluña
    const catalanRanges: Record<string, { min: number; max: number }> = {
      'barcelona': { min: 8001, max: 8042 },
      'terrassa': { min: 8221, max: 8231 },
      'sabadell': { min: 8201, max: 8208 },
      'badalona': { min: 8911, max: 8918 },
      'hospitalet de llobregat': { min: 8901, max: 8908 },
      'sant cugat del vallès': { min: 8190, max: 8196 },
      'cornellà de llobregat': { min: 8940, max: 8941 },
      'sant boi de llobregat': { min: 8830, max: 8840 },
      'rubí': { min: 8191, max: 8194 },
      'manresa': { min: 8240, max: 8250 },
      'mataró': { min: 8301, max: 8310 },
      'vilanova i la geltrú': { min: 8800, max: 8810 },
      'granollers': { min: 8400, max: 8410 },
      'lleida': { min: 25001, max: 25230 },
      'girona': { min: 17001, max: 17190 },
      'tarragona': { min: 43001, max: 43895 }
    };
    
    return catalanRanges[cityName] || null;
  };

  // Validación mejorada con rangos específicos por ciudad
  const validatePostalCodeFlexible = (code: string, city: City | null): boolean => {
    if (!code || !city) return true; // Permitir vacío
    
    // Debe ser exactamente 5 dígitos
    if (!/^\d{5}$/.test(code)) return false;
    
    const codeNum = parseInt(code);
    
    // Primero intentar validación específica por ciudad
    const cityRange = getCityPostalCodeRanges(city);
    if (cityRange) {
      return codeNum >= cityRange.min && codeNum <= cityRange.max;
    }
    
    // Fallback: validación por comunidad autónoma
    switch (city.autonomous_community) {
      case 'Cataluña':
        return codeNum >= 8000 && codeNum <= 25999;
      case 'Madrid':
        return codeNum >= 28000 && codeNum <= 28999;
      case 'Andalucía':
        return (codeNum >= 4000 && codeNum <= 4999) || 
               (codeNum >= 11000 && codeNum <= 11999) ||
               (codeNum >= 14000 && codeNum <= 14999) ||
               (codeNum >= 18000 && codeNum <= 18999) ||
               (codeNum >= 21000 && codeNum <= 21999) ||
               (codeNum >= 23000 && codeNum <= 23999) ||
               (codeNum >= 29000 && codeNum <= 29999) ||
               (codeNum >= 41000 && codeNum <= 41999);
      case 'Valencia':
        return (codeNum >= 3000 && codeNum <= 3999) ||
               (codeNum >= 12000 && codeNum <= 12999) ||
               (codeNum >= 46000 && codeNum <= 46999);
      default:
        return true; // Para otras comunidades, permitir cualquier código válido
    }
  };

  // Validación mejorada del código postal
  useEffect(() => {
    const validateCode = async () => {
      if (!postalCodeQuery) {
        setIsValidPostalCode(null);
        onPostalCodeChange(null);
        return;
      }

      if (selectedCity && postalCodeQuery.length >= 4) {
        const code = postalCodeQuery.padStart(5, '0');
        
        // Usar la nueva validación flexible
        const isValid = validatePostalCodeFlexible(code, selectedCity);
        
        if (isValid) {
          setIsValidPostalCode(true);
          onPostalCodeChange(code);
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
  }, [selectedCity, postalCodeQuery, onPostalCodeChange]);

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