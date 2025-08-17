
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Cuisine {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
  sort_order: number;
}

interface MeasurementUnit {
  id: string;
  code: string;
  name: string;
  category: string;
  is_active: boolean;
  sort_order: number;
}

export const useCuisinesAndUnits = () => {
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [units, setUnits] = useState<MeasurementUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cuisinesResponse, unitsResponse] = await Promise.all([
          supabase
            .from('cuisines')
            .select('*')
            .eq('is_active', true)
            .order('sort_order'),
          supabase
            .from('measurement_units')
            .select('*')
            .eq('is_active', true)
            .order('sort_order')
        ]);

        if (cuisinesResponse.data) {
          setCuisines(cuisinesResponse.data);
        }

        if (unitsResponse.data) {
          setUnits(unitsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching cuisines and units:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { cuisines, units, loading };
};
