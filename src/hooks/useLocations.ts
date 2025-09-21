import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Location {
  id: string;
  municipality: string;
  province: string;
  autonomous_community: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  search_terms?: string[];
  full_location: string;
}

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLocations = async (query: string, limit: number = 20) => {
    if (!query || query.length < 2) {
      setLocations([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('search_locations_intelligent', {
        search_query: query,
        p_limit: limit
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
      return formattedLocations;
    } catch (err) {
      console.error('Error searching locations:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLocations([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getLocationById = async (locationId: string): Promise<Location | null> => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', locationId)
        .single();

      if (error) throw error;

      if (data) {
        return {
          id: data.id,
          municipality: data.municipality,
          province: data.province,
          autonomous_community: data.autonomous_community,
          postal_code: data.postal_code,
          latitude: data.latitude,
          longitude: data.longitude,
          search_terms: data.search_terms,
          full_location: `${data.municipality}, ${data.province}, ${data.autonomous_community}`
        };
      }

      return null;
    } catch (err) {
      console.error('Error getting location by ID:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  };

  const getAllProvinces = async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('province')
        .order('province');

      if (error) throw error;

      const provinces = [...new Set(data?.map(item => item.province) || [])];
      return provinces;
    } catch (err) {
      console.error('Error getting provinces:', err);
      return [];
    }
  };

  const getAutonomousCommunities = async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('autonomous_community')
        .order('autonomous_community');

      if (error) throw error;

      const communities = [...new Set(data?.map(item => item.autonomous_community) || [])];
      return communities;
    } catch (err) {
      console.error('Error getting autonomous communities:', err);
      return [];
    }
  };

  return {
    locations,
    loading,
    error,
    searchLocations,
    getLocationById,
    getAllProvinces,
    getAutonomousCommunities
  };
};