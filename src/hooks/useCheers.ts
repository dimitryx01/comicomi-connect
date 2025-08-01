
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Cache en memoria con TTL para evitar peticiones excesivas
const cheersCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 segundos
const RATE_LIMIT_DELAY = 300; // 300ms debounce

const getCacheKey = (postId: string, userId?: string) => `${postId}_${userId || 'anonymous'}`;

const isCacheValid = (timestamp: number) => Date.now() - timestamp < CACHE_TTL;

// Debouncer simple
let debounceTimeouts = new Map<string, NodeJS.Timeout>();

export const useCheers = (postId: string, isSharedPost: boolean = false) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Memoizar la clave de query para evitar re-renders
  const queryKey = useMemo(() => ['cheers', postId, user?.id, isSharedPost], [postId, user?.id, isSharedPost]);
  
  // Obtener datos de cheers con React Query
  const { data: cheersData = { count: 0, hasCheered: false }, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!postId) return { count: 0, hasCheered: false };
      
      const cacheKey = getCacheKey(postId, user?.id);
      const cached = cheersCache.get(cacheKey);
      
      // Usar cache si es válido
      if (cached && isCacheValid(cached.timestamp)) {
        if (import.meta.env.DEV) {
          console.log('📋 useCheers: Usando cache para:', postId);
        }
        return cached.data;
      }
      
      try {
        // Obtener contador de cheers
        const { count: cheersCountData, error: countError } = await supabase
          .from('cheers')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);
        
        if (countError) {
          if (import.meta.env.DEV) {
            console.error('❌ useCheers: Error obteniendo contador:', countError);
          }
          throw countError;
        }
        
        let hasCheered = false;
        
        // Verificar si el usuario dio cheer
        if (user) {
          const { data: hasCheerData, error: hasCheerError } = await supabase
            .from('cheers')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (hasCheerError) {
            if (import.meta.env.DEV) {
              console.error('❌ useCheers: Error verificando cheer:', hasCheerError);
            }
            throw hasCheerError;
          }
          
          hasCheered = !!hasCheerData;
        }
        
        const result = { count: cheersCountData || 0, hasCheered };
        
        // Guardar en cache
        cheersCache.set(cacheKey, { 
          data: result, 
          timestamp: Date.now() 
        });
        
        if (import.meta.env.DEV) {
          console.log('✅ useCheers: Datos obtenidos:', result);
        }
        
        return result;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('❌ useCheers: Error en query:', error);
        }
        return { count: 0, hasCheered: false };
      }
    },
    staleTime: 30000, // 30 segundos
    gcTime: 60000, // 1 minuto
    retry: 1,
    retryDelay: 1000,
    enabled: !!postId
  });

  // Función optimizada para toggle cheer con debounce
  const toggleCheer = useCallback(async () => {
    if (!user || !postId || isLoading) {
      if (import.meta.env.DEV) {
        console.log('⚠️ useCheers: No se puede hacer cheer');
      }
      return;
    }

    // Implementar debounce
    const debounceKey = `${postId}_${user.id}`;
    const existingTimeout = debounceTimeouts.get(debounceKey);
    
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    const timeout = setTimeout(async () => {
      try {
        const currentHasCheered = cheersData.hasCheered;
        
        // Actualización optimista
        queryClient.setQueryData(queryKey, (old: any) => ({
          count: currentHasCheered ? (old?.count || 1) - 1 : (old?.count || 0) + 1,
          hasCheered: !currentHasCheered
        }));
        
        if (currentHasCheered) {
          // Remover cheer
          const { error } = await supabase
            .from('cheers')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);

          if (error) throw error;
        } else {
          // Agregar cheer
          const { error } = await supabase
            .from('cheers')
            .insert({ post_id: postId, user_id: user.id });

          if (error) throw error;
        }
        
        // Invalidar cache
        const cacheKey = getCacheKey(postId, user.id);
        cheersCache.delete(cacheKey);
        
        // Refrescar datos
        queryClient.invalidateQueries({ queryKey });
        
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('❌ useCheers: Error en toggleCheer:', error);
        }
        
        // Revertir actualización optimista
        queryClient.invalidateQueries({ queryKey });
      } finally {
        debounceTimeouts.delete(debounceKey);
      }
    }, RATE_LIMIT_DELAY);
    
    debounceTimeouts.set(debounceKey, timeout);
  }, [user, postId, isLoading, cheersData.hasCheered, queryKey, queryClient]);

  return {
    cheersCount: cheersData.count,
    hasCheered: cheersData.hasCheered,
    loading: isLoading,
    toggleCheer
  };
};
