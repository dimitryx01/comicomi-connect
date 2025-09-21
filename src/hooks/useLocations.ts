import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface City {
  id: string;
  municipality: string;
  province: string;
  autonomous_community: string;
  latitude?: number;
  longitude?: number;
  search_terms?: string[];
  full_location: string;
}

export interface PostalCode {
  postal_code: string;
  area_name?: string;
}

export const useLocations = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [postalCodes, setPostalCodes] = useState<PostalCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCities = async (query: string, limit: number = 20) => {
    if (!query || query.length < 2) {
      setCities([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('search_cities_intelligent', {
        search_query: query,
        p_limit: limit
      });

      if (error) throw error;

      const formattedCities: City[] = (data || []).map((item: any) => ({
        id: item.id,
        municipality: item.municipality,
        province: item.province,
        autonomous_community: item.autonomous_community,
        full_location: item.full_location
      }));

      setCities(formattedCities);
      return formattedCities;
    } catch (err) {
      console.error('Error searching cities:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setCities([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getPostalCodesForCity = async (cityId: string): Promise<PostalCode[]> => {
    try {
      const { data, error } = await supabase.rpc('get_postal_codes_for_city', {
        city_id_param: cityId
      });

      if (error) throw error;

      const postalCodes: PostalCode[] = (data || []).map((item: any) => ({
        postal_code: item.postal_code,
        area_name: item.area_name
      }));

      setPostalCodes(postalCodes);
      return postalCodes;
    } catch (err) {
      console.error('Error getting postal codes for city:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return [];
    }
  };

  const validatePostalCode = async (cityId: string, postalCode: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('validate_postal_code_for_city', {
        city_id_param: cityId,
        postal_code_param: postalCode
      });

      if (error) throw error;
      return data || false;
    } catch (err) {
      console.error('Error validating postal code:', err);
      return false;
    }
  };

  const getCityById = async (cityId: string): Promise<City | null> => {
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('id', cityId)
        .single();

      if (error) throw error;

      if (data) {
        return {
          id: data.id,
          municipality: data.municipality,
          province: data.province,
          autonomous_community: data.autonomous_community,
          latitude: data.latitude,
          longitude: data.longitude,
          search_terms: data.search_terms,
          full_location: `${data.municipality}, ${data.province}, ${data.autonomous_community}`
        };
      }

      return null;
    } catch (err) {
      console.error('Error getting city by ID:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  };

  const getAllProvinces = async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('cities')
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
        .from('cities')
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
    cities,
    postalCodes,
    loading,
    error,
    searchCities,
    getCityById,
    getPostalCodesForCity,
    validatePostalCode,
    getAllProvinces,
    getAutonomousCommunities
  };
};