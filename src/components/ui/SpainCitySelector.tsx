
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const spanishCities = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 
  'Las Palmas de Gran Canaria', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 
  'Gijón', 'Hospitalet de Llobregat', 'Vitoria-Gasteiz', 'A Coruña', 'Elche', 'Granada', 
  'Oviedo', 'Badalona', 'Cartagena', 'Terrassa', 'Jerez de la Frontera', 'Sabadell', 
  'Móstoles', 'Santa Cruz de Tenerife', 'Pamplona', 'Almería', 'Alcalá de Henares', 
  'Fuenlabrada', 'Leganés', 'Donostia-San Sebastián', 'Getafe', 'Burgos', 'Albacete', 
  'Castellón de la Plana', 'Alcorcón', 'Santander', 'Logroño', 'Badajoz', 'Salamanca', 
  'Huelva', 'Marbella', 'Lleida', 'Tarragona', 'León', 'Cádiz', 'Dos Hermanas', 
  'Mataró', 'Santa Coloma de Gramenet', 'Torrejón de Ardoz', 'Parla', 'Alcobendas', 
  'Reus', 'Telde', 'Ourense', 'Girona', 'Algeciras', 'Jaén', 'Lugo', 'Santiago de Compostela'
].sort();

interface SpainCitySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const SpainCitySelector = ({ value, onValueChange, placeholder = "Selecciona tu ciudad" }: SpainCitySelectorProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-60 overflow-y-auto bg-background border border-border">
        {spanishCities.map((city) => (
          <SelectItem key={city} value={city}>
            {city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SpainCitySelector;
