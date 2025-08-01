
import { useState, useEffect, useCallback, useRef } from 'react';
import { getSignedMediaUrl } from '@/utils/mediaStorage';
import { b2TransactionMonitor } from '@/utils/B2TransactionMonitor';
import { optimizedB2Cache } from '@/utils/OptimizedB2Cache';

// Cache adicional para URLs de avatares con TTL extendido
const avatarUrlCache = new Map<string, { url: string; timestamp: number }>();
const AVATAR_CACHE_TTL = 30 * 60 * 1000; // 30 minutos para avatares

// Determinar si es una URL pública
const isPublicUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};

interface UseSignedUrlReturn {
  signedUrl: string | null;
  loading: boolean;
  error: string | null;
}

export const useSignedUrl = (
  fileId: string | null | undefined,
  options: {
    expiresIn?: number;
    component?: string;
    enabled?: boolean;
  } = {}
): UseSignedUrlReturn => {
  const { expiresIn = 3600, component = 'useSignedUrl', enabled = true } = options;
  
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Usar ref para evitar múltiples fetches del mismo fileId
  const currentRequestRef = useRef<string | null>(null);

  const fetchSignedUrl = useCallback(async (targetFileId: string) => {
    // Prevenir múltiples requests del mismo archivo
    if (currentRequestRef.current === targetFileId) {
      return;
    }
    
    // Si es URL pública, usarla directamente
    if (isPublicUrl(targetFileId)) {
      setSignedUrl(targetFileId);
      setLoading(false);
      setError(null);
      return;
    }

    // Verificar cache de avatares para componentes específicos
    if (component === 'AvatarWithSignedUrl' || component.includes('avatar')) {
      const cached = avatarUrlCache.get(targetFileId);
      if (cached && (Date.now() - cached.timestamp) < AVATAR_CACHE_TTL) {
        setSignedUrl(cached.url);
        setLoading(false);
        setError(null);
        return;
      }
    }

    currentRequestRef.current = targetFileId;
    setLoading(true);
    setError(null);

    try {
      // Usar cache optimizado para evitar transacciones redundantes
      const cacheKey = `hook_signed_url_${targetFileId}_${expiresIn}`;
      
      const url = await optimizedB2Cache.get(cacheKey, async () => {
        b2TransactionMonitor.logTransactionB(component, 'hook_signed_url', targetFileId, 'hook_cache_miss');
        return await getSignedMediaUrl(targetFileId, expiresIn);
      }, {
        component,
        ttl: Math.min(expiresIn * 1000, 25 * 60 * 1000),
        priority: component.includes('avatar') ? 'high' : 'medium'
      });

      // Cache adicional para avatares
      if (component === 'AvatarWithSignedUrl' || component.includes('avatar')) {
        avatarUrlCache.set(targetFileId, {
          url,
          timestamp: Date.now()
        });
      }

      setSignedUrl(url);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ useSignedUrl: Error obteniendo URL firmada:', {
        fileId: targetFileId ? targetFileId.substring(0, 30) + '...' : 'no fileId',
        component,
        error: errorMessage
      });
      setError(errorMessage);
      setSignedUrl(null);
    } finally {
      setLoading(false);
      currentRequestRef.current = null;
    }
  }, [component, expiresIn]);

  useEffect(() => {
    if (!fileId || !enabled) {
      setSignedUrl(null);
      setLoading(false);
      setError(null);
      currentRequestRef.current = null;
      return;
    }

    fetchSignedUrl(fileId);
  }, [fileId, enabled, fetchSignedUrl]);

  return {
    signedUrl,
    loading,
    error
  };
};
